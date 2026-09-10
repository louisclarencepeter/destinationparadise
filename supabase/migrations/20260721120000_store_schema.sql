-- Multi-trip store schema (HANDOFF.md Phase 2).
--
-- Design notes:
-- * All monetary values are integers in the currency's smallest unit
--   (`*_minor`, USD cents for the pilot). Never floats.
-- * All commercial tables have RLS enabled with NO anon/authenticated
--   policies: the browser can never touch them. Netlify functions use the
--   service role, which bypasses RLS by design.
-- * Availability truth: capacity_total − confirmed booking seats − active
--   unexpired holds. Expired holds are excluded by predicate (expires_at),
--   so correctness never depends on the cleanup job having run.
-- * The atomic checkout path is implemented as SQL functions so one RPC is
--   one transaction: lock departures in stable order, re-check, re-price,
--   write order + items + holds together, or fail the whole cart with the
--   exact offending items.
-- * Departures hang off the EXPERIENCE (one physical slot shared by the
--   shared/private options) rather than per option as sketched in the
--   handoff: both modes consume seats from one pool, private adds a party
--   supplement. Revisit when Phase 0 fixes real per-option inventory rules.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- Catalog
-- ---------------------------------------------------------------------------

create table if not exists store_experiences (
  id uuid primary key default gen_random_uuid(),
  source_key text not null unique,          -- editorial content id (e.g. 'safari-blue')
  slug text not null unique,
  code text not null unique,                -- booking-code prefix (e.g. 'SB')
  title text not null,
  status text not null default 'active' check (status in ('active', 'inactive')),
  timezone text not null default 'Africa/Dar_es_Salaam',
  location text,
  meeting_point text,
  cancellation_policy_version text not null default 'v0-unconfirmed',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists store_experience_options (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references store_experiences(id) on delete cascade,
  code text not null,                        -- 'shared' | 'private' (client mode)
  name text not null,
  booking_mode text not null default 'instant' check (booking_mode in ('instant', 'request')),
  capacity_mode text not null default 'per_seat' check (capacity_mode in ('per_seat', 'per_party')),
  min_guests int not null default 1 check (min_guests >= 1),
  max_guests int not null check (max_guests >= min_guests),
  duration_minutes int,
  booking_cutoff_minutes int not null default 1200,
  currency char(3) not null default 'USD',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (experience_id, code)
);

create table if not exists store_option_prices (
  id uuid primary key default gen_random_uuid(),
  option_id uuid not null references store_experience_options(id) on delete cascade,
  kind text not null check (kind in ('per_person_adult', 'per_person_child', 'party_supplement', 'pickup_supplement')),
  amount_minor bigint not null check (amount_minor >= 0),
  currency char(3) not null default 'USD',
  active boolean not null default true,
  created_at timestamptz not null default now(),
  unique (option_id, kind)
);

-- ---------------------------------------------------------------------------
-- Inventory
-- ---------------------------------------------------------------------------

create table if not exists store_departures (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references store_experiences(id) on delete cascade,
  starts_at timestamptz not null,
  ends_at timestamptz,
  local_date date not null,                  -- wall-clock date in the experience timezone
  local_time text not null check (local_time ~ '^[0-2][0-9]:[0-5][0-9]$'),
  capacity_total int not null check (capacity_total > 0),
  status text not null default 'scheduled' check (status in ('scheduled', 'closed', 'cancelled')),
  booking_cutoff_at timestamptz not null,
  supplier_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (experience_id, starts_at)
);

create index if not exists store_departures_lookup_idx
  on store_departures (experience_id, local_date);

create table if not exists store_capacity_holds (
  id uuid primary key default gen_random_uuid(),
  departure_id uuid not null references store_departures(id) on delete cascade,
  order_id uuid,                             -- fk added after store_orders exists
  seats int not null check (seats > 0),
  status text not null default 'active' check (status in ('active', 'consumed', 'released', 'expired')),
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);

create index if not exists store_capacity_holds_active_idx
  on store_capacity_holds (departure_id, status, expires_at);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------

create table if not exists store_orders (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique,
  status text not null default 'pending_payment' check (status in (
    'awaiting_availability', 'quoted', 'pending_payment', 'paid', 'expired',
    'payment_failed', 'requires_review', 'partially_refunded', 'refunded', 'cancelled')),
  currency char(3) not null default 'USD',
  total_minor bigint not null check (total_minor >= 0),
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  language char(2) not null default 'en',
  access_token_hash text not null,           -- sha256 hex of the browser's order token
  hold_expires_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table store_capacity_holds
  add constraint store_capacity_holds_order_fk
  foreign key (order_id) references store_orders(id) on delete set null;

create table if not exists store_order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references store_orders(id) on delete cascade,
  departure_id uuid not null references store_departures(id),
  option_id uuid not null references store_experience_options(id),
  -- Immutable sale snapshot: later catalog edits must not change history.
  experience_source_key text not null,
  experience_title text not null,
  option_code text not null,
  option_name text not null,
  timezone text not null,
  local_date date not null,
  local_time text not null,
  guests int not null check (guests > 0),
  price_lines jsonb not null,
  total_minor bigint not null check (total_minor >= 0),
  currency char(3) not null,
  cancellation_policy_version text not null,
  pickup text,
  created_at timestamptz not null default now()
);

create index if not exists store_order_items_order_idx on store_order_items (order_id);

create table if not exists store_payment_attempts (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references store_orders(id) on delete cascade,
  provider text not null default 'dpo',
  status text not null default 'created' check (status in (
    'created', 'pending', 'unknown', 'paid', 'paid_acknowledgement_pending',
    'failed', 'expired', 'verification_failed', 'refunded')),
  company_ref text,
  provider_token text,
  requested_minor bigint,
  requested_currency char(3),
  provider_amounts jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists store_payment_attempts_order_idx on store_payment_attempts (order_id);

create table if not exists store_bookings (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references store_orders(id) on delete cascade,
  order_item_id uuid not null unique references store_order_items(id) on delete cascade,
  departure_id uuid not null references store_departures(id),
  code text not null unique,
  status text not null default 'confirmed' check (status in (
    'held', 'confirmed', 'cancelled', 'completed', 'refund_pending', 'refunded')),
  guests int not null check (guests > 0),
  supplier_ref text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists store_bookings_departure_idx on store_bookings (departure_id, status);

create table if not exists store_provider_events (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  event_key text not null unique,            -- dedupes provider callbacks/retries
  order_id uuid references store_orders(id) on delete set null,
  payload jsonb,
  created_at timestamptz not null default now()
);

create table if not exists store_idempotency_keys (
  key text primary key,
  order_id uuid references store_orders(id) on delete cascade,
  response jsonb,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '24 hours')
);

create table if not exists store_notification_outbox (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references store_orders(id) on delete cascade,
  kind text not null,
  payload jsonb,
  status text not null default 'pending' check (status in ('pending', 'sent', 'failed')),
  attempts int not null default 0,
  next_attempt_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists store_notification_outbox_due_idx
  on store_notification_outbox (status, next_attempt_at);

-- ---------------------------------------------------------------------------
-- Row-level security: default deny for browser roles. The service role used
-- by Netlify functions bypasses RLS; nothing else can read or write.
-- ---------------------------------------------------------------------------

do $$
declare t text;
begin
  foreach t in array array[
    'store_experiences', 'store_experience_options', 'store_option_prices',
    'store_departures', 'store_capacity_holds', 'store_orders',
    'store_order_items', 'store_payment_attempts', 'store_bookings',
    'store_provider_events', 'store_idempotency_keys', 'store_notification_outbox']
  loop
    execute format('alter table %I enable row level security', t);
    -- anon/authenticated exist on Supabase; skip on vanilla Postgres (CI/local checks).
    if exists (select 1 from pg_roles where rolname = 'anon') then
      execute format('revoke all on %I from anon', t);
    end if;
    if exists (select 1 from pg_roles where rolname = 'authenticated') then
      execute format('revoke all on %I from authenticated', t);
    end if;
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Availability helpers
-- ---------------------------------------------------------------------------

-- Seats still sellable on a departure. Expired holds are excluded by the
-- expires_at predicate regardless of their status flag.
create or replace function store_seats_available(p_departure_id uuid)
returns int
language sql
stable
as $$
  select d.capacity_total
    - coalesce((select sum(b.guests) from store_bookings b
                 where b.departure_id = d.id
                   and b.status in ('held', 'confirmed')), 0)
    - coalesce((select sum(h.seats) from store_capacity_holds h
                 where h.departure_id = d.id
                   and h.status = 'active'
                   and h.expires_at > now()), 0)
  from store_departures d
  where d.id = p_departure_id;
$$;

-- ---------------------------------------------------------------------------
-- API: catalog
-- ---------------------------------------------------------------------------

create or replace function store_api_catalog()
returns jsonb
language sql
stable
as $$
  select coalesce(jsonb_agg(exp order by exp->>'sourceKey'), '[]'::jsonb)
  from (
    select jsonb_build_object(
      'sourceKey', e.source_key,
      'slug', e.slug,
      'title', e.title,
      'timezone', e.timezone,
      'meetingPoint', e.meeting_point,
      'cancellationPolicyVersion', e.cancellation_policy_version,
      'options', (
        select jsonb_agg(jsonb_build_object(
          'code', o.code,
          'name', o.name,
          'bookingMode', o.booking_mode,
          'minGuests', o.min_guests,
          'maxGuests', o.max_guests,
          'durationMinutes', o.duration_minutes,
          'bookingCutoffMinutes', o.booking_cutoff_minutes,
          'currency', o.currency,
          'prices', (
            select jsonb_object_agg(p.kind, p.amount_minor)
            from store_option_prices p
            where p.option_id = o.id and p.active
          )
        ) order by o.code)
        from store_experience_options o
        where o.experience_id = e.id and o.active
      )
    ) as exp
    from store_experiences e
    where e.status = 'active'
  ) experiences;
$$;

-- ---------------------------------------------------------------------------
-- API: availability for one experience over a date range
-- ---------------------------------------------------------------------------

create or replace function store_api_availability(
  p_source_key text,
  p_from date,
  p_to date
)
returns jsonb
language plpgsql
stable
as $$
declare
  v_experience store_experiences;
  v_days jsonb;
begin
  select * into v_experience from store_experiences
    where source_key = p_source_key and status = 'active';
  if not found then
    return jsonb_build_object('error', 'unknown_experience');
  end if;
  if p_to < p_from or p_to - p_from > 92 then
    return jsonb_build_object('error', 'invalid_range');
  end if;

  select coalesce(jsonb_object_agg(day.local_date, day.info), '{}'::jsonb)
  into v_days
  from (
    select d.local_date::text as local_date,
           jsonb_build_object(
             'date', d.local_date,
             'bookable', bool_or(d.status = 'scheduled'
                                 and d.booking_cutoff_at > now()
                                 and store_seats_available(d.id) > 0),
             'times', jsonb_agg(jsonb_build_object(
               'time', d.local_time,
               'departureId', d.id,
               'seats', case
                 when d.status <> 'scheduled' or d.booking_cutoff_at <= now() then 0
                 else greatest(store_seats_available(d.id), 0)
               end
             ) order by d.local_time)
           ) as info
    from store_departures d
    where d.experience_id = v_experience.id
      and d.local_date between p_from and p_to
      and d.status <> 'cancelled'
    group by d.local_date
  ) day;

  return jsonb_build_object(
    'sourceKey', v_experience.source_key,
    'timezone', v_experience.timezone,
    'from', p_from,
    'to', p_to,
    'days', v_days
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Pricing: one rule for quote AND checkout so they can never disagree.
-- Items: [{sourceKey, optionCode, guests, date 'YYYY-MM-DD', time 'HH:MM'}]
-- ---------------------------------------------------------------------------

create or replace function store_price_option(p_option_id uuid, p_guests int)
returns jsonb
language plpgsql
stable
as $$
declare
  v_per_person bigint;
  v_supplement bigint;
  v_lines jsonb := '[]'::jsonb;
  v_total bigint := 0;
begin
  select amount_minor into v_per_person from store_option_prices
    where option_id = p_option_id and kind = 'per_person_adult' and active;
  if v_per_person is null then
    return null;
  end if;

  v_lines := v_lines || jsonb_build_array(jsonb_build_object(
    'type', 'per_person', 'unitMinor', v_per_person,
    'quantity', p_guests, 'amountMinor', v_per_person * p_guests));
  v_total := v_per_person * p_guests;

  select amount_minor into v_supplement from store_option_prices
    where option_id = p_option_id and kind = 'party_supplement' and active;
  if v_supplement is not null and v_supplement > 0 then
    v_lines := v_lines || jsonb_build_array(jsonb_build_object(
      'type', 'party_supplement', 'amountMinor', v_supplement));
    v_total := v_total + v_supplement;
  end if;

  return jsonb_build_object('lines', v_lines, 'totalMinor', v_total);
end;
$$;

-- Evaluate one requested item without locking (quote) — resolves the
-- departure from (sourceKey, date, time) so the client cart schema stays
-- exactly what Phase 1 already persists.
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
begin
  v_guests := coalesce((p_item->>'guests')::int, 0);

  select e.* into v_experience from store_experiences e
    where e.source_key = p_item->>'sourceKey' and e.status = 'active';
  if not found then
    return jsonb_build_object('status', 'unknown_experience');
  end if;

  select o.* into v_option from store_experience_options o
    where o.experience_id = v_experience.id
      and o.code = p_item->>'optionCode' and o.active;
  if not found or v_option.booking_mode <> 'instant' then
    return jsonb_build_object('status', 'unknown_option');
  end if;

  if v_guests < v_option.min_guests or v_guests > v_option.max_guests then
    return jsonb_build_object('status', 'invalid_guests');
  end if;

  select d.* into v_departure from store_departures d
    where d.experience_id = v_experience.id
      and d.local_date = (p_item->>'date')::date
      and d.local_time = p_item->>'time';
  if not found then
    return jsonb_build_object('status', 'unknown_departure');
  end if;

  if v_departure.status <> 'scheduled' or v_departure.booking_cutoff_at <= now() then
    return jsonb_build_object('status', 'departed');
  end if;

  v_seats := store_seats_available(v_departure.id);
  v_price := store_price_option(v_option.id, v_guests);
  if v_price is null then
    return jsonb_build_object('status', 'unpriced_option');
  end if;

  return jsonb_build_object(
    'status', case
      when v_seats <= 0 then 'sold_out'
      when v_seats < v_guests then 'insufficient_seats'
      else 'available'
    end,
    'seats', greatest(v_seats, 0),
    'departureId', v_departure.id,
    'optionId', v_option.id,
    'experienceTitle', v_experience.title,
    'optionName', v_option.name,
    'timezone', v_experience.timezone,
    'pickup', v_experience.meeting_point,
    'cancellationPolicyVersion', v_experience.cancellation_policy_version,
    'currency', v_option.currency,
    'price', v_price
  );
end;
$$;

create or replace function store_api_quote(p_items jsonb)
returns jsonb
language plpgsql
stable
as $$
declare
  v_item jsonb;
  v_result jsonb;
  v_quotes jsonb := '[]'::jsonb;
  v_subtotal bigint := 0;
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0
     or jsonb_array_length(p_items) > 20 then
    return jsonb_build_object('error', 'invalid_items');
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_result := store_evaluate_item(v_item);
    v_quotes := v_quotes || jsonb_build_array(
      jsonb_build_object('id', v_item->>'id') || v_result);
    if v_result->>'status' = 'available' then
      v_subtotal := v_subtotal + ((v_result->'price'->>'totalMinor')::bigint);
    end if;
  end loop;

  return jsonb_build_object('quotes', v_quotes, 'subtotalMinor', v_subtotal, 'currency', 'USD');
end;
$$;

-- ---------------------------------------------------------------------------
-- API: atomic checkout — the single transaction from the handoff.
-- Groups seats by departure, locks departures in stable order, re-checks
-- capacity, re-prices, and creates order + immutable items + holds together.
-- Any conflict rejects the WHOLE checkout and names the offending items.
-- ---------------------------------------------------------------------------

create or replace function store_api_checkout(
  p_items jsonb,
  p_contact jsonb,
  p_language text default 'en',
  p_hold_minutes int default 15,
  p_idempotency_key text default null
)
returns jsonb
language plpgsql
as $$
declare
  v_stored jsonb;
  v_item jsonb;
  v_eval jsonb;
  v_evaluated jsonb := '[]'::jsonb;
  v_conflicts jsonb := '[]'::jsonb;
  v_departure_ids uuid[];
  v_dep_id uuid;
  v_needed int;
  v_seats int;
  v_total bigint := 0;
  v_order_id uuid;
  v_reference text;
  v_token text;
  v_hold_expires timestamptz;
  v_items_out jsonb := '[]'::jsonb;
  v_attempt int := 0;
begin
  -- Idempotent replay: same key returns the stored success response.
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

  -- First pass: resolve and validate every item WITHOUT locks.
  for v_item in select * from jsonb_array_elements(p_items) loop
    v_eval := store_evaluate_item(v_item);
    v_evaluated := v_evaluated || jsonb_build_array(v_item || v_eval);
    if v_eval->>'status' not in ('available') then
      v_conflicts := v_conflicts || jsonb_build_array(jsonb_build_object(
        'id', v_item->>'id', 'status', v_eval->>'status'));
    end if;
  end loop;
  if jsonb_array_length(v_conflicts) > 0 then
    return jsonb_build_object('ok', false, 'error', 'availability_conflict', 'conflicts', v_conflicts);
  end if;

  -- Group requested seats by departure, then lock those departures in a
  -- stable order so concurrent checkouts cannot deadlock.
  select array_agg(distinct (e->>'departureId')::uuid order by (e->>'departureId')::uuid)
    into v_departure_ids
  from jsonb_array_elements(v_evaluated) e;

  perform 1 from store_departures
    where id = any(v_departure_ids)
    order by id
    for update;

  -- Re-check capacity inside the lock, summing per-departure demand.
  for v_dep_id in select unnest(v_departure_ids) loop
    select coalesce(sum((e->>'guests')::int), 0) into v_needed
      from jsonb_array_elements(v_evaluated) e
      where (e->>'departureId')::uuid = v_dep_id;
    v_seats := store_seats_available(v_dep_id);
    if v_seats < v_needed then
      select coalesce(jsonb_agg(jsonb_build_object(
               'id', e->>'id',
               'status', case when v_seats <= 0 then 'sold_out' else 'insufficient_seats' end)), '[]'::jsonb)
        into v_conflicts
        from jsonb_array_elements(v_evaluated) e
        where (e->>'departureId')::uuid = v_dep_id;
      return jsonb_build_object('ok', false, 'error', 'availability_conflict', 'conflicts', v_conflicts);
    end if;
  end loop;

  -- Mint a unique human-facing reference.
  loop
    v_attempt := v_attempt + 1;
    v_reference := 'DP-' || to_char(now(), 'YYYY') || '-' ||
                   lpad((floor(random() * 1000000))::int::text, 6, '0');
    exit when not exists (select 1 from store_orders where reference = v_reference);
    if v_attempt > 20 then
      raise exception 'could not allocate order reference';
    end if;
  end loop;

  v_token := encode(gen_random_bytes(24), 'hex');
  v_hold_expires := now() + make_interval(mins => greatest(p_hold_minutes, 5));

  select coalesce(sum(((e->'price'->>'totalMinor')::bigint)), 0)
    into v_total from jsonb_array_elements(v_evaluated) e;

  insert into store_orders (
    reference, status, currency, total_minor,
    contact_name, contact_email, contact_phone, language,
    access_token_hash, hold_expires_at
  ) values (
    v_reference, 'pending_payment', 'USD', v_total,
    left(coalesce(p_contact->>'name', ''), 200),
    left(coalesce(p_contact->>'email', ''), 254),
    left(coalesce(p_contact->>'phone', ''), 60),
    case when p_language in ('en', 'de', 'pl') then p_language else 'en' end,
    encode(digest(v_token, 'sha256'), 'hex'),
    v_hold_expires
  ) returning id into v_order_id;

  for v_item in select * from jsonb_array_elements(v_evaluated) loop
    insert into store_order_items (
      order_id, departure_id, option_id,
      experience_source_key, experience_title, option_code, option_name,
      timezone, local_date, local_time, guests,
      price_lines, total_minor, currency, cancellation_policy_version, pickup
    ) values (
      v_order_id,
      (v_item->>'departureId')::uuid,
      (v_item->>'optionId')::uuid,
      v_item->>'sourceKey',
      v_item->>'experienceTitle',
      v_item->>'optionCode',
      v_item->>'optionName',
      v_item->>'timezone',
      (v_item->>'date')::date,
      v_item->>'time',
      (v_item->>'guests')::int,
      v_item->'price'->'lines',
      (v_item->'price'->>'totalMinor')::bigint,
      coalesce(v_item->>'currency', 'USD'),
      coalesce(v_item->>'cancellationPolicyVersion', 'v0-unconfirmed'),
      v_item->>'pickup'
    );

    insert into store_capacity_holds (departure_id, order_id, seats, status, expires_at)
    values ((v_item->>'departureId')::uuid, v_order_id, (v_item->>'guests')::int, 'active', v_hold_expires);

    v_items_out := v_items_out || jsonb_build_array(jsonb_build_object(
      'id', v_item->>'id',
      'sourceKey', v_item->>'sourceKey',
      'title', v_item->>'experienceTitle',
      'optionCode', v_item->>'optionCode',
      'date', v_item->>'date',
      'time', v_item->>'time',
      'guests', (v_item->>'guests')::int,
      'pickup', v_item->>'pickup',
      'totalMinor', (v_item->'price'->>'totalMinor')::bigint
    ));
  end loop;

  insert into store_payment_attempts (order_id, status, requested_minor, requested_currency)
  values (v_order_id, 'created', v_total, 'USD');

  v_stored := jsonb_build_object(
    'ok', true,
    'reference', v_reference,
    'accessToken', v_token,
    'status', 'pending_payment',
    'currency', 'USD',
    'totalMinor', v_total,
    'holdExpiresAt', v_hold_expires,
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
-- Finalization core (shared by the Phase 2 dev-simulated payment and the
-- Phase 3 DPO verify path): idempotently mark paid, consume holds, mint one
-- booking per item. Never duplicates bookings on replay.
-- ---------------------------------------------------------------------------

create or replace function store_finalize_paid_order(p_reference text)
returns jsonb
language plpgsql
as $$
declare
  v_order store_orders;
  v_item record;
  v_code text;
  v_prefix text;
  v_attempt int;
  v_bookings jsonb := '[]'::jsonb;
begin
  select * into v_order from store_orders
    where reference = p_reference
    for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'unknown_order');
  end if;

  -- Idempotent: already finalized → return the existing bookings.
  if v_order.status = 'paid' then
    select coalesce(jsonb_agg(jsonb_build_object(
             'bookingCode', b.code, 'orderItemId', b.order_item_id)), '[]'::jsonb)
      into v_bookings
      from store_bookings b where b.order_id = v_order.id;
    return jsonb_build_object('ok', true, 'alreadyFinalized', true,
      'reference', v_order.reference, 'bookings', v_bookings);
  end if;

  if v_order.status <> 'pending_payment' then
    return jsonb_build_object('ok', false, 'error', 'order_not_payable', 'status', v_order.status);
  end if;

  -- Late payment safety: if any hold expired, re-check capacity atomically
  -- (locks the departures) before confirming; never oversell.
  perform 1 from store_departures d
    where d.id in (select departure_id from store_order_items where order_id = v_order.id)
    order by d.id
    for update;

  for v_item in
    select oi.*, (select count(*) from store_capacity_holds h
                    where h.order_id = v_order.id
                      and h.departure_id = oi.departure_id
                      and h.status = 'active'
                      and h.expires_at > now()) as live_holds
    from store_order_items oi where oi.order_id = v_order.id
  loop
    if v_item.live_holds = 0 and store_seats_available(v_item.departure_id) < v_item.guests then
      update store_orders set status = 'requires_review', updated_at = now()
        where id = v_order.id;
      return jsonb_build_object('ok', false, 'error', 'capacity_lost', 'itemId', v_item.id);
    end if;
  end loop;

  update store_orders set status = 'paid', updated_at = now() where id = v_order.id;
  update store_payment_attempts set status = 'paid', updated_at = now()
    where order_id = v_order.id and status in ('created', 'pending', 'unknown');
  update store_capacity_holds set status = 'consumed'
    where order_id = v_order.id and status = 'active';

  for v_item in
    select oi.*, e.code as exp_code
    from store_order_items oi
    join store_experiences e on e.source_key = oi.experience_source_key
    where oi.order_id = v_order.id
  loop
    v_prefix := coalesce(v_item.exp_code, 'DP');
    v_attempt := 0;
    loop
      v_attempt := v_attempt + 1;
      v_code := v_prefix || '-' || lpad((1000 + floor(random() * 9000))::int::text, 4, '0');
      exit when not exists (select 1 from store_bookings where code = v_code);
      if v_attempt > 50 then
        v_code := v_prefix || '-' || substr(encode(gen_random_bytes(4), 'hex'), 1, 6);
        exit;
      end if;
    end loop;

    insert into store_bookings (order_id, order_item_id, departure_id, code, status, guests)
    values (v_order.id, v_item.id, v_item.departure_id, v_code, 'confirmed', v_item.guests);

    v_bookings := v_bookings || jsonb_build_array(jsonb_build_object(
      'bookingCode', v_code, 'orderItemId', v_item.id));
  end loop;

  insert into store_notification_outbox (order_id, kind, payload)
  values
    (v_order.id, 'order_receipt', jsonb_build_object('reference', v_order.reference)),
    (v_order.id, 'booking_confirmations', jsonb_build_object('reference', v_order.reference));

  return jsonb_build_object('ok', true, 'reference', v_order.reference, 'bookings', v_bookings);
end;
$$;

-- ---------------------------------------------------------------------------
-- Order status read for the confirmation page (token-authorized).
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
    -- Same response for unknown reference and bad token: no oracle.
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
           'sourceKey', oi.experience_source_key,
           'title', oi.experience_title,
           'optionCode', oi.option_code,
           'optionName', oi.option_name,
           'date', oi.local_date,
           'time', oi.local_time,
           'timezone', oi.timezone,
           'guests', oi.guests,
           'pickup', oi.pickup,
           'priceLines', oi.price_lines,
           'totalMinor', oi.total_minor,
           'currency', oi.currency,
           'bookingCode', b.code,
           'bookingStatus', b.status
         ) order by oi.local_date, oi.local_time), '[]'::jsonb)
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
    'createdAt', v_order.created_at,
    'items', v_items
  );
end;
$$;

-- ---------------------------------------------------------------------------
-- Expiry maintenance (scheduled). Correctness never depends on this running —
-- availability math already ignores expired holds — but it keeps state tidy
-- and expires abandoned pending orders.
-- ---------------------------------------------------------------------------

create or replace function store_release_expired_holds()
returns jsonb
language plpgsql
as $$
declare
  v_holds int;
  v_orders int;
begin
  update store_capacity_holds set status = 'expired'
    where status = 'active' and expires_at <= now();
  get diagnostics v_holds = row_count;

  update store_orders o set status = 'expired', updated_at = now()
    where o.status = 'pending_payment'
      and o.hold_expires_at is not null
      and o.hold_expires_at <= now() - interval '30 minutes'
      and not exists (select 1 from store_payment_attempts pa
                        where pa.order_id = o.id
                          and pa.status in ('paid', 'paid_acknowledgement_pending', 'pending', 'unknown'));
  get diagnostics v_orders = row_count;

  update store_payment_attempts pa set status = 'expired', updated_at = now()
    where pa.status = 'created'
      and exists (select 1 from store_orders o where o.id = pa.order_id and o.status = 'expired');

  delete from store_idempotency_keys where expires_at <= now();

  return jsonb_build_object('expiredHolds', v_holds, 'expiredOrders', v_orders);
end;
$$;

-- ---------------------------------------------------------------------------
-- Departure seeding helper: extends the rolling window of manually managed
-- departures for every active experience. Idempotent — safe to re-run. Ops
-- can call this from the Supabase SQL editor until a real admin exists.
-- Times/capacities live in store_departure_templates.
-- ---------------------------------------------------------------------------

create table if not exists store_departure_templates (
  id uuid primary key default gen_random_uuid(),
  experience_id uuid not null references store_experiences(id) on delete cascade,
  local_time text not null check (local_time ~ '^[0-2][0-9]:[0-5][0-9]$'),
  capacity_total int not null check (capacity_total > 0),
  duration_minutes int not null default 240,
  active boolean not null default true,
  unique (experience_id, local_time)
);

alter table store_departure_templates enable row level security;
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'anon') then
    revoke all on store_departure_templates from anon;
  end if;
  if exists (select 1 from pg_roles where rolname = 'authenticated') then
    revoke all on store_departure_templates from authenticated;
  end if;
end $$;

create or replace function store_seed_departures(p_days int default 60)
returns int
language plpgsql
as $$
declare
  v_count int := 0;
begin
  insert into store_departures (
    experience_id, starts_at, ends_at, local_date, local_time,
    capacity_total, status, booking_cutoff_at
  )
  select
    t.experience_id,
    ((current_date + day_offset) || ' ' || t.local_time)::timestamp at time zone e.timezone,
    (((current_date + day_offset) || ' ' || t.local_time)::timestamp at time zone e.timezone)
      + make_interval(mins => t.duration_minutes),
    current_date + day_offset,
    t.local_time,
    t.capacity_total,
    'scheduled',
    (((current_date + day_offset) || ' ' || t.local_time)::timestamp at time zone e.timezone)
      - make_interval(mins => coalesce(o.booking_cutoff_minutes, 1200))
  from store_departure_templates t
  join store_experiences e on e.id = t.experience_id and e.status = 'active'
  join lateral (
    select min(booking_cutoff_minutes) as booking_cutoff_minutes
    from store_experience_options
    where experience_id = t.experience_id and active
  ) o on true
  cross join generate_series(1, greatest(p_days, 1)) as day_offset
  where t.active
  on conflict (experience_id, starts_at) do nothing;

  get diagnostics v_count = row_count;
  return v_count;
end;
$$;
