-- Approved whole-group prices and per-car pickup for the Zanzibar instant
-- pilots. Rates deliberately start EMPTY: operations must approve each mode,
-- group size and pickup zone before that selection can take online payment.
-- Existing sale snapshots, attempts, request-only products and the legacy
-- two-argument store_price_option remain unchanged.

create table if not exists store_option_group_prices (
  option_id uuid not null references store_experience_options(id) on delete cascade,
  guests int not null check (guests between 1 and 6),
  amount_minor bigint not null check (amount_minor >= 0),
  currency char(3) not null default 'USD' check (currency = 'USD'),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (option_id, guests)
);

create table if not exists store_option_pickup_prices (
  option_id uuid not null references store_experience_options(id) on delete cascade,
  zone_code text not null check (zone_code in ('stone-town', 'north', 'east', 'south')),
  amount_minor bigint not null check (amount_minor >= 0),
  currency char(3) not null default 'USD' check (currency = 'USD'),
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (option_id, zone_code)
);

-- Both primary keys start with option_id, covering option lookups and the
-- foreign-key cascade; no duplicate indexes are needed. Public catalog rates
-- are read through the existing service-backed API, never directly by clients.
do $$
declare v_table text;
begin
  foreach v_table in array array['store_option_group_prices', 'store_option_pickup_prices'] loop
    execute format('alter table %I enable row level security', v_table);
    execute format('revoke all on %I from public', v_table);
    if exists (select 1 from pg_roles where rolname = 'anon') then
      execute format('revoke all on %I from anon', v_table);
    end if;
    if exists (select 1 from pg_roles where rolname = 'authenticated') then
      execute format('revoke all on %I from authenticated', v_table);
    end if;
    if exists (select 1 from pg_roles where rolname = 'service_role') then
      execute format('grant select, insert, update, delete on %I to service_role', v_table);
    end if;
  end loop;
end $$;

-- One configured group TOTAL plus one configured car supplement. A zero
-- supplement explicitly means included pickup; a missing row means unpriced.
-- Prices from another currency, inactive rates and unknown zones never fall
-- back to the legacy per-person/private-supplement calculation.
create or replace function store_price_option_with_pickup(
  p_option_id uuid, p_guests int, p_pickup_zone text, p_accommodation text
)
returns jsonb
language plpgsql
stable
set search_path = public
as $$
declare
  v_currency char(3);
  v_group bigint;
  v_pickup bigint;
  v_total numeric;
  v_accommodation text := nullif(btrim(p_accommodation), '');
begin
  if p_guests is null or p_guests not between 1 and 6
     or p_pickup_zone is null or p_pickup_zone not in ('stone-town', 'north', 'east', 'south')
     or v_accommodation is null or length(v_accommodation) > 200 then
    return null;
  end if;
  select currency into v_currency from store_experience_options
    where id = p_option_id and active;
  if not found then return null; end if;

  select amount_minor into v_group from store_option_group_prices
    where option_id = p_option_id and guests = p_guests and active and currency = v_currency;
  select amount_minor into v_pickup from store_option_pickup_prices
    where option_id = p_option_id and zone_code = p_pickup_zone and active and currency = v_currency;
  if v_group is null or v_pickup is null then return null; end if;
  -- JavaScript/API consumers must be able to represent integer cents exactly.
  -- Add in numeric before rejecting unsafe values; this is a serialization
  -- bound, not a business limit or a change to any historical sale snapshot.
  v_total := v_group::numeric + v_pickup::numeric;
  if v_total <= 0 or v_total > 9007199254740991 then return null; end if;

  return jsonb_build_object(
    'lines', jsonb_build_array(
      jsonb_build_object('type', 'group_price', 'guests', p_guests,
        'quantity', 1, 'amountMinor', v_group),
      jsonb_build_object('type', 'pickup_supplement', 'zoneCode', p_pickup_zone,
        'accommodation', v_accommodation, 'quantity', 1,
        'unitMinor', v_pickup, 'amountMinor', v_pickup)
    ),
    'totalMinor', v_total::bigint
  );
end;
$$;

revoke all on function store_price_option_with_pickup(uuid, int, text, text) from public;
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on function store_price_option_with_pickup(uuid, int, text, text) from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on function store_price_option_with_pickup(uuid, int, text, text) from authenticated;
  end if;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function store_price_option_with_pickup(uuid, int, text, text) to service_role;
  end if;
end $$;

-- Preserve existing catalog fields/options. Only the three instant pilots
-- publish the new rate maps. Hotels belong to private sale snapshots, not to
-- these public configuration tables or the catalog response.
create or replace function store_api_catalog()
returns jsonb
language sql
stable
as $$
  select coalesce(jsonb_agg(exp order by exp->>'sourceKey'), '[]'::jsonb)
  from (
    select jsonb_build_object(
      'sourceKey', e.source_key, 'slug', e.slug, 'title', e.title,
      'timezone', e.timezone, 'meetingPoint', e.meeting_point,
      'cancellationPolicyVersion', e.cancellation_policy_version,
      'options', (
        select jsonb_agg(jsonb_build_object(
          'code', o.code, 'name', o.name, 'bookingMode', o.booking_mode,
          'minGuests', o.min_guests, 'maxGuests', o.max_guests,
          'durationMinutes', o.duration_minutes,
          'bookingCutoffMinutes', o.booking_cutoff_minutes, 'currency', o.currency,
          'prices', (select jsonb_object_agg(p.kind, p.amount_minor)
            from store_option_prices p where p.option_id = o.id and p.active)
        ) || case when e.source_key in ('safari-blue', 'spice-tour', 'stone-town')
          and o.booking_mode = 'instant' then jsonb_build_object(
            'pickupPricingRequired', true, 'instantMaxGuests', 6,
            'groupPrices', coalesce((select jsonb_object_agg(p.guests::text, p.amount_minor)
              from store_option_group_prices p
              where p.option_id = o.id and p.active and p.currency = o.currency), '{}'::jsonb),
            'pickupPrices', coalesce((select jsonb_object_agg(p.zone_code, p.amount_minor)
              from store_option_pickup_prices p
              where p.option_id = o.id and p.active and p.currency = o.currency), '{}'::jsonb)
          ) else '{}'::jsonb end order by o.code)
        from store_experience_options o where o.experience_id = e.id and o.active
      )
    ) as exp
    from store_experiences e where e.status = 'active'
  ) s;
$$;

-- Quote and atomic checkout both call this evaluator. New pilot selections
-- must be eligible and completely priced before checkout writes any order,
-- attempt or hold. Existing checkout replay returns its saved snapshot before
-- evaluation; provider callbacks/finalization continue using that snapshot.
create or replace function store_evaluate_item(p_item jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  v_experience store_experiences;
  v_option store_experience_options;
  v_departure store_departures;
  v_guests int;
  v_seats int;
  v_price jsonb;
  v_pilot boolean;
  v_zone text;
  v_accommodation text;
  v_pickup text;
begin
  v_guests := coalesce((p_item->>'guests')::int, 0);
  select e.* into v_experience from store_experiences e
    where e.source_key = p_item->>'sourceKey' and e.status = 'active';
  if not found then return jsonb_build_object('status', 'unknown_experience'); end if;
  select o.* into v_option from store_experience_options o
    where o.experience_id = v_experience.id and o.code = p_item->>'optionCode' and o.active;
  if not found or v_option.booking_mode <> 'instant' then
    return jsonb_build_object('status', 'unknown_option');
  end if;

  v_pilot := v_experience.source_key in ('safari-blue', 'spice-tour', 'stone-town');
  if v_guests < v_option.min_guests then return jsonb_build_object('status', 'invalid_guests'); end if;
  if v_pilot and v_guests > 6 then return jsonb_build_object('status', 'quote_required'); end if;
  if v_guests > v_option.max_guests then return jsonb_build_object('status', 'invalid_guests'); end if;

  v_pickup := v_experience.meeting_point;
  if v_pilot then
    v_zone := nullif(btrim(p_item->>'pickupZone'), '');
    v_accommodation := nullif(btrim(p_item->>'accommodation'), '');
    if v_zone is null or v_zone not in ('stone-town', 'north', 'east', 'south', 'other')
       or v_accommodation is null or length(v_accommodation) > 200 then
      return jsonb_build_object('status', 'pickup_required');
    end if;
    if v_zone = 'other' then return jsonb_build_object('status', 'quote_required'); end if;
    v_price := store_price_option_with_pickup(v_option.id, v_guests, v_zone, v_accommodation);
    if v_price is null then return jsonb_build_object('status', 'quote_required'); end if;
    v_pickup := case v_zone when 'stone-town' then 'Stone Town'
      when 'north' then 'North Zanzibar' when 'east' then 'East Zanzibar'
      when 'south' then 'South Zanzibar' end || ' — ' || v_accommodation;
  end if;

  select d.* into v_departure from store_departures d
    where d.experience_id = v_experience.id
      and d.local_date = (p_item->>'date')::date and d.local_time = p_item->>'time';
  if not found then return jsonb_build_object('status', 'unknown_departure'); end if;
  if v_departure.status <> 'scheduled' or v_departure.booking_cutoff_at <= now() then
    return jsonb_build_object('status', 'departed');
  end if;

  v_seats := store_seats_available(v_departure.id);
  if not v_pilot then
    v_price := store_price_option(v_option.id, v_guests);
    if v_price is null then return jsonb_build_object('status', 'unpriced_option'); end if;
  end if;
  return jsonb_build_object(
    'status', case when v_seats <= 0 then 'sold_out'
      when v_seats < v_guests then 'insufficient_seats' else 'available' end,
    'seats', greatest(v_seats, 0), 'departureId', v_departure.id,
    'optionId', v_option.id, 'experienceTitle', v_experience.title,
    'optionName', v_option.name, 'timezone', v_experience.timezone,
    'pickup', v_pickup, 'cancellationPolicyVersion', v_experience.cancellation_policy_version,
    'currency', v_option.currency, 'price', v_price
  );
end;
$$;

-- Splitting one departure into several cart rows cannot bypass the six-seat
-- car limit or charge pickup twice. Even a smaller duplicate party needs a
-- staff quote rather than guessing how its separate rows should be merged.
-- Different experiences or departure times are independent trips; the guard
-- applies across zones and modes without needing accommodation data.
create or replace function store_group_pickup_quote_departures(p_items jsonb)
returns jsonb
language sql
stable
set search_path = public
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'sourceKey', source_key, 'date', local_date, 'time', local_time
  )), '[]'::jsonb)
  from (
    select item->>'sourceKey' as source_key, item->>'date' as local_date,
      item->>'time' as local_time
    from jsonb_array_elements(p_items) item
    join store_experiences e on e.source_key = item->>'sourceKey' and e.status = 'active'
    join store_experience_options o on o.experience_id = e.id
      and o.code = item->>'optionCode' and o.active and o.booking_mode = 'instant'
    where e.source_key in ('safari-blue', 'spice-tour', 'stone-town')
    group by item->>'sourceKey', item->>'date', item->>'time'
    having count(*) > 1 or sum((item->>'guests')::int) > 6
  ) quote_departures;
$$;

-- Quote preserves every row and reports which trip needs a staff quote.
-- Its payable subtotal excludes all rows belonging to a trip requiring a quote.
create or replace function store_api_quote(p_items jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  v_item jsonb;
  v_result jsonb;
  v_quotes jsonb := '[]'::jsonb;
  v_subtotal numeric := 0;
  v_quote_departures jsonb;
  v_has_priced_pilot boolean := false;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0
     or jsonb_array_length(p_items) > 20 then
    return jsonb_build_object('error', 'invalid_items');
  end if;
  v_quote_departures := store_group_pickup_quote_departures(p_items);
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_result := store_evaluate_item(v_item);
    if v_result->>'status' not in ('unknown_experience', 'unknown_option', 'invalid_guests')
      and exists (select 1 from jsonb_array_elements(v_quote_departures) trip
      where trip->>'sourceKey' = v_item->>'sourceKey'
        and trip->>'date' = v_item->>'date' and trip->>'time' = v_item->>'time') then
      v_result := jsonb_build_object('status', 'quote_required');
    end if;
    v_quotes := v_quotes || jsonb_build_array(jsonb_build_object('id', v_item->>'id') || v_result);
    if v_result->>'status' = 'available' then
      v_subtotal := v_subtotal + (v_result->'price'->>'totalMinor')::numeric;
      v_has_priced_pilot := v_has_priced_pilot
        or v_item->>'sourceKey' in ('safari-blue', 'spice-tour', 'stone-town');
    end if;
  end loop;
  -- Several individually exact fares can exceed the API's exact-integer bound
  -- when combined. A fresh cart containing a pilot then needs one staff quote;
  -- pure nonpilot pricing and existing stored orders retain their behavior.
  if v_has_priced_pilot and v_subtotal > 9007199254740991 then
    select jsonb_agg(case when quote.value->>'status' = 'available'
      then jsonb_build_object('id', quote.value->>'id', 'status', 'quote_required')
      else quote.value end order by quote.ordinality) into v_quotes
    from jsonb_array_elements(v_quotes) with ordinality quote(value, ordinality);
    v_subtotal := 0;
  end if;
  return jsonb_build_object('quotes', v_quotes, 'subtotalMinor', v_subtotal::bigint, 'currency', 'USD');
end;
$$;

-- Save the exact preexisting atomic checkout body once, then wrap its original
-- signature. Keeping the original function identity means cached callers of
-- the deposit overload also receive the guard. The saved body is service-only;
-- it retains all inventory locks, snapshots and existing error behavior.
do $$
declare v_definition text;
begin
  if to_regprocedure('public.store_api_checkout_before_group_pickup(jsonb,jsonb,text,integer,text)') is null then
    v_definition := pg_get_functiondef('public.store_api_checkout(jsonb,jsonb,text,integer,text)'::regprocedure);
    execute replace(v_definition, 'CREATE OR REPLACE FUNCTION public.store_api_checkout(',
      'CREATE OR REPLACE FUNCTION public.store_api_checkout_before_group_pickup(');
  end if;
end $$;

create or replace function store_api_checkout(
  p_items jsonb, p_contact jsonb, p_language text default 'en',
  p_hold_minutes int default 15, p_idempotency_key text default null
)
returns jsonb
language plpgsql
as $$
declare
  v_stored jsonb;
  v_quote jsonb;
  v_conflicts jsonb;
  v_result jsonb;
begin
  -- Replay precedes new eligibility checks: an already-priced historical
  -- order is neither repriced nor blocked by later guest/pickup policy changes.
  if p_idempotency_key is not null then
    select response into v_stored from store_idempotency_keys
      where key = p_idempotency_key and expires_at > now();
    if v_stored is not null then
      return v_stored || jsonb_build_object('idempotentReplay', true);
    end if;
  end if;
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0
     or jsonb_array_length(p_items) > 20 then
    return jsonb_build_object('ok', false, 'error', 'invalid_items');
  end if;
  v_quote := store_api_quote(p_items);
  select coalesce(jsonb_agg(jsonb_build_object('id', item->>'id', 'status', item->>'status')), '[]'::jsonb)
    into v_conflicts from jsonb_array_elements(v_quote->'quotes') item
    where item->>'status' <> 'available';
  if jsonb_array_length(v_conflicts) > 0 then
    return jsonb_build_object('ok', false, 'error', 'availability_conflict', 'conflicts', v_conflicts);
  end if;
  v_result := store_api_checkout_before_group_pickup(p_items, p_contact, p_language,
    p_hold_minutes, p_idempotency_key);
  if coalesce((v_result->>'ok')::boolean, false) then
    -- The atomic body reprices the cart. If an administrative rate edit raced
    -- the eligibility check, abort the entire RPC rather than leave unsafe
    -- money amounts, new holds or a payment attempt visible to the client.
    if (v_result->>'totalMinor')::numeric > 9007199254740991
      and exists (select 1 from jsonb_array_elements(p_items) item
        where item->>'sourceKey' in ('safari-blue', 'spice-tour', 'stone-town')) then
      raise exception 'configured pilot cart amount exceeds exact integer cents';
    end if;
    -- Include the actual saved lines for the review after a checkout reprice.
    -- Duplicate pilot departures have already been blocked. Legacy nonpilot
    -- duplicate rows have the same resolved price/pickup for this selection.
    v_result := v_result || jsonb_build_object('items', (
      select coalesce(jsonb_agg(item.value || jsonb_build_object('priceLines', snapshot.price_lines)
        order by item.ordinality), '[]'::jsonb)
      from jsonb_array_elements(v_result->'items') with ordinality item(value, ordinality)
      left join lateral (
        select oi.price_lines from store_order_items oi join store_orders o on o.id = oi.order_id
        where o.reference = v_result->>'reference'
          and oi.experience_source_key = item.value->>'sourceKey'
          and oi.option_code = item.value->>'optionCode'
          and oi.local_date = (item.value->>'date')::date
          and oi.local_time = item.value->>'time'
          and oi.guests = (item.value->>'guests')::int
        order by oi.created_at, oi.id limit 1
      ) snapshot on true
    ));
    if p_idempotency_key is not null then
      update store_idempotency_keys set response = v_result where key = p_idempotency_key;
    end if;
  end if;
  return v_result;
end;
$$;

revoke all on function store_group_pickup_quote_departures(jsonb) from public;
revoke all on function store_api_checkout_before_group_pickup(jsonb, jsonb, text, int, text) from public;
do $$
declare v_role text;
begin
  foreach v_role in array array['anon', 'authenticated'] loop
    if exists (select 1 from pg_roles where rolname = v_role) then
      execute format('revoke all on function store_group_pickup_quote_departures(jsonb) from %I', v_role);
      execute format('revoke all on function store_api_checkout_before_group_pickup(jsonb,jsonb,text,int,text) from %I', v_role);
    end if;
  end loop;
  if exists (select 1 from pg_roles where rolname = 'service_role') then
    grant execute on function store_group_pickup_quote_departures(jsonb) to service_role;
    grant execute on function store_api_checkout_before_group_pickup(jsonb,jsonb,text,int,text) to service_role;
  end if;
end $$;

-- Email composers can show the same immutable group/pickup breakdown as the
-- token-gated order API. Deposit and historical full-payment summaries retain
-- the existing helper and requested amount, including after catalog edits.
create or replace function store_order_for_notification(p_reference text)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'ok', true, 'reference', o.reference, 'status', o.status,
    'currency', o.currency, 'totalMinor', o.total_minor,
    'contactName', o.contact_name, 'contactEmail', o.contact_email,
    'contactPhone', o.contact_phone, 'language', o.language,
    'quoteNote', o.quote_note, 'quoteExpiresAt', o.quote_expires_at,
    'createdAt', o.created_at,
    'items', (select coalesce(jsonb_agg(jsonb_build_object(
      'title', oi.experience_title, 'optionName', oi.option_name, 'kind', oi.item_kind,
      'date', oi.local_date, 'time', oi.local_time,
      'requestedDates', oi.requested_dates, 'staffNote', oi.staff_note,
      'guests', oi.guests, 'pickup', oi.pickup, 'priceLines', oi.price_lines,
      'totalMinor', oi.total_minor, 'bookingCode', b.code
    ) order by oi.local_date nulls last, oi.local_time nulls last, oi.created_at), '[]'::jsonb)
      from store_order_items oi left join store_bookings b on b.order_item_id = oi.id
      where oi.order_id = o.id)
  ) || store_payment_summary(o.id)
  from store_orders o where o.reference = p_reference;
$$;
