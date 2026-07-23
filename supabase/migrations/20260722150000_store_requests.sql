-- Request/mixed carts (HANDOFF.md Phase 5).
--
-- Model: a cart containing ANY request-only item checks out WITHOUT payment
-- into an 'awaiting_availability' order (no holds taken — nothing is promised
-- yet). Staff confirm dates/prices via store_staff_quote (Supabase SQL editor,
-- see docs/store-ops.md) which moves the order to 'quoted' and emails the
-- guest an accept link. Guest acceptance (store_api_accept_quote) is the
-- atomic moment: departures are locked, capacity re-checked, fresh holds
-- created, and the order becomes 'pending_payment' for ONE combined payment —
-- preserving the one-payment promise without charging for unavailable trips.

-- ---------------------------------------------------------------------------
-- Schema: request items have no departure until staff schedule them.
-- ---------------------------------------------------------------------------

alter table store_order_items alter column departure_id drop not null;
alter table store_order_items alter column option_id drop not null;
alter table store_order_items alter column local_date drop not null;
alter table store_order_items alter column local_time drop not null;

alter table store_order_items
  add column if not exists item_kind text not null default 'instant'
    check (item_kind in ('instant', 'request')),
  add column if not exists requested_dates text,
  add column if not exists staff_note text;

-- Request items start unpriced; relax the snapshot totals for them only.
alter table store_order_items alter column total_minor drop not null;
alter table store_order_items alter column price_lines drop not null;

-- Quote lifecycle metadata on the order.
alter table store_orders
  add column if not exists quote_note text,
  add column if not exists quote_expires_at timestamptz,
  add column if not exists quoted_at timestamptz,
  add column if not exists accepted_at timestamptz;

-- ---------------------------------------------------------------------------
-- Catalog: request-only products join the store catalog.
-- ---------------------------------------------------------------------------

insert into store_experiences (source_key, slug, code, title, meeting_point, location)
values
  ('prison-island', 'prison-island', 'PI', 'Prison Island Boat Trip',
   'Boat departs the Forodhani jetty in Stone Town; hotel pickup on request.', 'Changuu Island, Zanzibar'),
  ('northern-safari', 'northern-safari', 'NS', 'Northern Tanzania Safari',
   'Flights and transfers arranged with your safari planner.', 'Serengeti & Ngorongoro, Tanzania'),
  ('custom-journey', 'custom-journey', 'CX', 'Custom Zanzibar Journey',
   'Every transfer is planned around your itinerary.', 'Zanzibar, tailor-made')
on conflict (source_key) do update
  set title = excluded.title, meeting_point = excluded.meeting_point,
      location = excluded.location, updated_at = now();

insert into store_experience_options
  (experience_id, code, name, booking_mode, capacity_mode, min_guests, max_guests, duration_minutes, booking_cutoff_minutes)
select e.id, 'request', 'On request', 'request', 'per_party', 1, v.max_guests, null, 0
from store_experiences e
join (values
  ('prison-island', 8), ('northern-safari', 6), ('custom-journey', 12)
) as v(source_key, max_guests) on v.source_key = e.source_key
on conflict (experience_id, code) do update set max_guests = excluded.max_guests;

-- ---------------------------------------------------------------------------
-- Guest submits a request cart (mixed instant+request allowed). No payment,
-- no holds; instant items snapshot their current price as an indication only.
-- Items: [{id, sourceKey, optionCode, guests, date?, time?, requestedDates?}]
-- ---------------------------------------------------------------------------

create or replace function store_api_request_checkout(
  p_items jsonb,
  p_contact jsonb,
  p_language text default 'en',
  p_idempotency_key text default null
)
returns jsonb
language plpgsql
as $$
declare
  v_stored jsonb;
  v_item jsonb;
  v_experience store_experiences;
  v_option store_experience_options;
  v_eval jsonb;
  v_order_id uuid;
  v_reference text;
  v_token text;
  v_attempt int := 0;
  v_request_count int := 0;
  v_items_out jsonb := '[]'::jsonb;
begin
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

  loop
    v_attempt := v_attempt + 1;
    v_reference := 'DP-' || to_char(now(), 'YYYY') || '-' ||
                   lpad((floor(random() * 1000000))::int::text, 6, '0');
    exit when not exists (select 1 from store_orders where reference = v_reference);
    if v_attempt > 20 then raise exception 'could not allocate order reference'; end if;
  end loop;
  v_token := encode(gen_random_bytes(24), 'hex');

  insert into store_orders (
    reference, status, currency, total_minor,
    contact_name, contact_email, contact_phone, language, access_token_hash
  ) values (
    v_reference, 'awaiting_availability', 'USD', 0,
    left(coalesce(p_contact->>'name', ''), 200),
    left(coalesce(p_contact->>'email', ''), 254),
    left(coalesce(p_contact->>'phone', ''), 60),
    case when p_language in ('en', 'de', 'pl') then p_language else 'en' end,
    encode(digest(v_token, 'sha256'), 'hex')
  ) returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(p_items) loop
    select e.* into v_experience from store_experiences e
      where e.source_key = v_item->>'sourceKey' and e.status = 'active';
    if not found then
      raise exception 'unknown experience %', v_item->>'sourceKey';
    end if;

    if v_item->>'optionCode' = 'request' then
      select o.* into v_option from store_experience_options o
        where o.experience_id = v_experience.id and o.code = 'request' and o.active;
      if not found then raise exception 'experience % is not requestable', v_item->>'sourceKey'; end if;
      v_request_count := v_request_count + 1;

      insert into store_order_items (
        order_id, item_kind, experience_source_key, experience_title,
        option_id, option_code, option_name, timezone,
        local_date, local_time, guests, requested_dates,
        currency, cancellation_policy_version, pickup
      ) values (
        v_order_id, 'request', v_experience.source_key, v_experience.title,
        v_option.id, 'request', v_option.name, v_experience.timezone,
        null, null,
        least(greatest(coalesce((v_item->>'guests')::int, 1), 1), v_option.max_guests),
        left(coalesce(v_item->>'requestedDates', ''), 300),
        'USD', v_experience.cancellation_policy_version, v_experience.meeting_point
      );
    else
      -- Instant item riding along in a request cart: validate + snapshot the
      -- indicative price, but take NO hold — capacity is secured at accept.
      v_eval := store_evaluate_item(v_item);
      if v_eval->>'status' in ('unknown_experience', 'unknown_option', 'invalid_guests', 'unpriced_option') then
        raise exception 'invalid instant item %: %', v_item->>'id', v_eval->>'status';
      end if;

      insert into store_order_items (
        order_id, item_kind, departure_id, option_id,
        experience_source_key, experience_title, option_code, option_name,
        timezone, local_date, local_time, guests,
        price_lines, total_minor, currency, cancellation_policy_version, pickup
      ) values (
        v_order_id, 'instant',
        nullif(v_eval->>'departureId', '')::uuid,
        nullif(v_eval->>'optionId', '')::uuid,
        v_item->>'sourceKey', v_eval->>'experienceTitle',
        v_item->>'optionCode', v_eval->>'optionName',
        v_eval->>'timezone', (v_item->>'date')::date, v_item->>'time',
        (v_item->>'guests')::int,
        v_eval->'price'->'lines', (v_eval->'price'->>'totalMinor')::bigint,
        'USD', coalesce(v_eval->>'cancellationPolicyVersion', 'v0-unconfirmed'),
        v_eval->>'pickup'
      );
    end if;

    v_items_out := v_items_out || jsonb_build_array(jsonb_build_object(
      'id', v_item->>'id', 'sourceKey', v_item->>'sourceKey'));
  end loop;

  if v_request_count = 0 then
    raise exception 'request checkout needs at least one request item';
  end if;

  -- The guest email needs the raw order link token; it lives transiently in
  -- the outbox payload and is redacted right after sending (store_outbox_redact).
  insert into store_notification_outbox (order_id, kind, payload)
  values
    (v_order_id, 'request_received', jsonb_build_object('reference', v_reference, 'accessToken', v_token)),
    (v_order_id, 'request_team_alert', jsonb_build_object('reference', v_reference));

  v_stored := jsonb_build_object(
    'ok', true,
    'reference', v_reference,
    'accessToken', v_token,
    'status', 'awaiting_availability',
    'items', v_items_out
  );
  if p_idempotency_key is not null then
    insert into store_idempotency_keys (key, order_id, response)
    values (p_idempotency_key, v_order_id, v_stored)
    on conflict (key) do nothing;
  end if;
  return v_stored;
end;
$$;

-- ---------------------------------------------------------------------------
-- Staff quote (run from the SQL editor — see docs/store-ops.md).
-- Updates: [{itemId, date 'YYYY-MM-DD', time 'HH:MM', totalMinor, note?}]
-- Every item must end up scheduled + priced; the order becomes 'quoted' and
-- the guest gets the accept email.
-- ---------------------------------------------------------------------------

create or replace function store_staff_quote(
  p_reference text,
  p_item_updates jsonb,
  p_note text default null,
  p_valid_hours int default 72
)
returns jsonb
language plpgsql
as $$
declare
  v_order store_orders;
  v_update jsonb;
  v_item store_order_items;
  v_departure store_departures;
  v_total bigint;
  v_unscheduled int;
  v_new_token text;
begin
  select * into v_order from store_orders where reference = p_reference for update;
  if not found then return jsonb_build_object('ok', false, 'error', 'unknown_order'); end if;
  if v_order.status not in ('awaiting_availability', 'quoted') then
    return jsonb_build_object('ok', false, 'error', 'order_not_quotable', 'status', v_order.status);
  end if;

  for v_update in select * from jsonb_array_elements(coalesce(p_item_updates, '[]'::jsonb)) loop
    select * into v_item from store_order_items
      where id = (v_update->>'itemId')::uuid and order_id = v_order.id;
    if not found then
      return jsonb_build_object('ok', false, 'error', 'unknown_item', 'itemId', v_update->>'itemId');
    end if;

    -- Resolve the departure by the experience + proposed date/time; staff must
    -- have created the departure first (store_departures insert or templates).
    select d.* into v_departure
      from store_departures d
      join store_experiences e on e.id = d.experience_id
      where e.source_key = v_item.experience_source_key
        and d.local_date = (v_update->>'date')::date
        and d.local_time = v_update->>'time'
        and d.status = 'scheduled';
    if not found then
      return jsonb_build_object('ok', false, 'error', 'no_departure',
        'itemId', v_update->>'itemId',
        'hint', 'create the departure row first (see docs/store-ops.md)');
    end if;

    update store_order_items set
      departure_id = v_departure.id,
      local_date = v_departure.local_date,
      local_time = v_departure.local_time,
      total_minor = (v_update->>'totalMinor')::bigint,
      price_lines = jsonb_build_array(jsonb_build_object(
        'type', 'staff_quote', 'amountMinor', (v_update->>'totalMinor')::bigint)),
      staff_note = left(v_update->>'note', 400)
    where id = v_item.id;
  end loop;

  select count(*) into v_unscheduled from store_order_items
    where order_id = v_order.id and (departure_id is null or total_minor is null);
  if v_unscheduled > 0 then
    return jsonb_build_object('ok', false, 'error', 'items_unscheduled', 'remaining', v_unscheduled);
  end if;

  select sum(total_minor) into v_total from store_order_items where order_id = v_order.id;

  -- Rotate the order token so the accept email can carry a fresh raw link
  -- (only the hash is stored on the order; the raw value sits transiently in
  -- the outbox payload until the sender redacts it).
  v_new_token := encode(gen_random_bytes(24), 'hex');

  update store_orders set
    status = 'quoted',
    total_minor = v_total,
    quote_note = left(p_note, 600),
    quoted_at = now(),
    quote_expires_at = now() + make_interval(hours => greatest(p_valid_hours, 1)),
    access_token_hash = encode(digest(v_new_token, 'sha256'), 'hex'),
    updated_at = now()
  where id = v_order.id;

  insert into store_notification_outbox (order_id, kind, payload)
  values (v_order.id, 'quote_ready',
          jsonb_build_object('reference', p_reference, 'accessToken', v_new_token));

  return jsonb_build_object('ok', true, 'reference', p_reference,
    'totalMinor', v_total, 'status', 'quoted');
end;
$$;

-- ---------------------------------------------------------------------------
-- Guest accepts the quote: THE atomic moment. Locks all departures in stable
-- order, re-checks capacity for every item, creates fresh holds, and moves the
-- order to pending_payment for one combined payment.
-- ---------------------------------------------------------------------------

create or replace function store_api_accept_quote(
  p_reference text,
  p_token text,
  p_hold_minutes int default 1440
)
returns jsonb
language plpgsql
as $$
declare
  v_order store_orders;
  v_departure_ids uuid[];
  v_dep_id uuid;
  v_needed int;
  v_seats int;
  v_conflicts jsonb := '[]'::jsonb;
  v_hold_expires timestamptz;
begin
  select * into v_order from store_orders
    where reference = p_reference for update;
  if not found or v_order.access_token_hash <> encode(digest(coalesce(p_token, ''), 'sha256'), 'hex') then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;
  if v_order.status = 'pending_payment' then
    return jsonb_build_object('ok', true, 'alreadyAccepted', true,
      'reference', p_reference, 'totalMinor', v_order.total_minor,
      'holdExpiresAt', v_order.hold_expires_at);
  end if;
  if v_order.status <> 'quoted' then
    return jsonb_build_object('ok', false, 'error', 'order_not_quoted', 'status', v_order.status);
  end if;
  if v_order.quote_expires_at is not null and v_order.quote_expires_at <= now() then
    return jsonb_build_object('ok', false, 'error', 'quote_expired');
  end if;

  select array_agg(distinct departure_id order by departure_id)
    into v_departure_ids
  from store_order_items where order_id = v_order.id;

  perform 1 from store_departures where id = any(v_departure_ids)
    order by id for update;

  for v_dep_id in select unnest(v_departure_ids) loop
    select coalesce(sum(guests), 0) into v_needed
      from store_order_items where order_id = v_order.id and departure_id = v_dep_id;
    v_seats := store_seats_available(v_dep_id);
    if v_seats < v_needed then
      select coalesce(jsonb_agg(jsonb_build_object('itemId', oi.id,
               'status', case when v_seats <= 0 then 'sold_out' else 'insufficient_seats' end)), '[]'::jsonb)
        into v_conflicts
        from store_order_items oi
        where oi.order_id = v_order.id and oi.departure_id = v_dep_id;
      return jsonb_build_object('ok', false, 'error', 'availability_conflict', 'conflicts', v_conflicts);
    end if;
  end loop;

  v_hold_expires := now() + make_interval(mins => greatest(p_hold_minutes, 30));

  insert into store_capacity_holds (departure_id, order_id, seats, status, expires_at)
  select departure_id, v_order.id, guests, 'active', v_hold_expires
  from store_order_items where order_id = v_order.id;

  update store_orders set
    status = 'pending_payment',
    accepted_at = now(),
    hold_expires_at = v_hold_expires,
    updated_at = now()
  where id = v_order.id;

  insert into store_payment_attempts (order_id, status, requested_minor, requested_currency)
  values (v_order.id, 'created', v_order.total_minor, 'USD');

  return jsonb_build_object('ok', true, 'reference', p_reference,
    'totalMinor', v_order.total_minor, 'holdExpiresAt', v_hold_expires);
end;
$$;

-- Outbox worklist now surfaces the transient access token so the sender can
-- build guest links (redacted right after sending).
create or replace function store_outbox_due(p_limit int default 10)
returns jsonb
language sql
stable
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', nb.id,
    'kind', nb.kind,
    'reference', o.reference,
    'attempts', nb.attempts,
    'accessToken', nb.payload->>'accessToken'
  ) order by nb.created_at), '[]'::jsonb)
  from store_notification_outbox nb
  join store_orders o on o.id = nb.order_id
  where nb.status = 'pending' and nb.next_attempt_at <= now()
  limit greatest(p_limit, 1);
$$;

-- Post-send token redaction for guest-facing outbox rows.
create or replace function store_outbox_redact(p_id uuid)
returns jsonb
language plpgsql
as $$
begin
  update store_notification_outbox
    set payload = payload - 'accessToken', updated_at = now()
    where id = p_id;
  return jsonb_build_object('ok', true);
end;
$$;

-- Notification snapshot gains the request-flow fields for the new email kinds.
create or replace function store_order_for_notification(p_reference text)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'ok', true,
    'reference', o.reference,
    'status', o.status,
    'currency', o.currency,
    'totalMinor', o.total_minor,
    'contactName', o.contact_name,
    'contactEmail', o.contact_email,
    'contactPhone', o.contact_phone,
    'language', o.language,
    'quoteNote', o.quote_note,
    'quoteExpiresAt', o.quote_expires_at,
    'createdAt', o.created_at,
    'items', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'title', oi.experience_title,
        'optionName', oi.option_name,
        'kind', oi.item_kind,
        'date', oi.local_date,
        'time', oi.local_time,
        'requestedDates', oi.requested_dates,
        'staffNote', oi.staff_note,
        'guests', oi.guests,
        'pickup', oi.pickup,
        'totalMinor', oi.total_minor,
        'bookingCode', b.code
      ) order by oi.local_date nulls last, oi.local_time nulls last, oi.created_at), '[]'::jsonb)
      from store_order_items oi
      left join store_bookings b on b.order_item_id = oi.id
      where oi.order_id = o.id
    )
  )
  from store_orders o
  where o.reference = p_reference;
$$;

-- ---------------------------------------------------------------------------
-- Order read: expose the request-flow fields to the (token-gated) order page.
-- ---------------------------------------------------------------------------

create or replace function store_api_order(p_reference text, p_token text)
returns jsonb
language plpgsql
stable
as $$
declare
  v_order store_orders;
  v_items jsonb;
begin
  select * into v_order from store_orders where reference = p_reference;
  if not found or v_order.access_token_hash <> encode(digest(coalesce(p_token, ''), 'sha256'), 'hex') then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
           'sourceKey', oi.experience_source_key,
           'title', oi.experience_title,
           'optionCode', oi.option_code,
           'optionName', oi.option_name,
           'kind', oi.item_kind,
           'date', oi.local_date,
           'time', oi.local_time,
           'requestedDates', oi.requested_dates,
           'staffNote', oi.staff_note,
           'timezone', oi.timezone,
           'guests', oi.guests,
           'pickup', oi.pickup,
           'priceLines', oi.price_lines,
           'totalMinor', oi.total_minor,
           'currency', oi.currency,
           'bookingCode', b.code,
           'bookingStatus', b.status
         ) order by oi.local_date nulls last, oi.local_time nulls last, oi.created_at), '[]'::jsonb)
    into v_items
  from store_order_items oi
  left join store_bookings b on b.order_item_id = oi.id
  where oi.order_id = v_order.id;

  return jsonb_build_object(
    'ok', true,
    'reference', v_order.reference,
    'status', v_order.status,
    'currency', v_order.currency,
    'totalMinor', v_order.total_minor,
    'contactName', v_order.contact_name,
    'language', v_order.language,
    'holdExpiresAt', v_order.hold_expires_at,
    'quoteNote', v_order.quote_note,
    'quoteExpiresAt', v_order.quote_expires_at,
    'createdAt', v_order.created_at,
    'items', v_items
  );
end;
$$;
