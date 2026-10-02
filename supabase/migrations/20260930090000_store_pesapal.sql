-- Provider-aware payment creation and verification. Existing DPO orders and
-- three-argument attachment calls remain compatible. No customer card details
-- are stored here: providers host checkout and only their transaction ID/URL
-- are persisted. Apply after all previous store migrations.

alter table store_payment_attempts
  add column if not exists provider_environment text
    check (provider_environment in ('sandbox', 'live')),
  add column if not exists provider_payment_url text,
  add column if not exists payment_claim_id uuid;

alter table store_orders
  add column if not exists payment_plan text not null default 'full'
    check (payment_plan in ('full', 'deposit_20')),
  add column if not exists deposit_percent int not null default 100
    check (deposit_percent in (20, 100)),
  add column if not exists charge_minor bigint check (charge_minor >= 0);

alter table store_payment_attempts
  add column if not exists payment_plan text not null default 'full'
    check (payment_plan in ('full', 'deposit_20')),
  add column if not exists deposit_percent int not null default 100
    check (deposit_percent in (20, 100));

-- Historical orders/attempts retain full payment. requested_minor is the exact
-- provider charge, while total_minor remains the immutable experience total.
create or replace function store_payment_summary(p_order_id uuid)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'paymentPlan', coalesce(pa.payment_plan, o.payment_plan),
    'depositPercent', coalesce(pa.deposit_percent, o.deposit_percent),
    'chargeMinor', charge.minor,
    'depositMinor', case when coalesce(pa.payment_plan, o.payment_plan) = 'deposit_20'
      then charge.minor else 0 end,
    'balanceMinor', o.total_minor - charge.minor,
    'paymentStatus', case when o.status = 'paid'
      and coalesce(pa.payment_plan, o.payment_plan) = 'deposit_20' then 'deposit_paid'
      else o.status end
  )
  from store_orders o
  left join lateral (
    select * from store_payment_attempts where order_id = o.id
    order by created_at desc, id desc limit 1
  ) pa on true
  cross join lateral (select coalesce(pa.requested_minor, o.charge_minor,
    case when o.payment_plan = 'deposit_20' then o.total_minor / 5
      + case when o.total_minor % 5 > 0 then 1 else 0 end
      else o.total_minor end) as minor) charge
  where o.id = p_order_id;
$$;

-- The plan can only be set before any provider submission. The wrapper calls
-- this in the same checkout/accept transaction; no partial deposit order can
-- become visible to another request.
create or replace function store_set_new_payment_plan(p_reference text, p_payment_plan text)
returns jsonb
language plpgsql
as $$
declare
  v_order store_orders;
  v_attempt store_payment_attempts;
  v_charge bigint;
begin
  if p_payment_plan is null or p_payment_plan not in ('full', 'deposit_20') then
    return jsonb_build_object('ok', false, 'error', 'invalid_payment_plan');
  end if;
  select * into v_order from store_orders where reference = p_reference for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'unknown_order');
  end if;
  select * into v_attempt from store_payment_attempts where order_id = v_order.id
    order by created_at desc, id desc limit 1 for update;
  if not found or v_order.status <> 'pending_payment'
     or v_attempt.status <> 'created' or v_attempt.provider_token is not null
     or v_attempt.payment_claim_id is not null then
    return jsonb_build_object('ok', false, 'error', 'payment_plan_locked');
  end if;
  -- Exact ceil(total/5) without floating point or total*20 integer overflow.
  v_charge := case when p_payment_plan = 'deposit_20'
    then v_order.total_minor / 5 + case when v_order.total_minor % 5 > 0 then 1 else 0 end
    else v_order.total_minor end;
  update store_orders set payment_plan = p_payment_plan,
    deposit_percent = case when p_payment_plan = 'deposit_20' then 20 else 100 end,
    charge_minor = v_charge where id = v_order.id;
  update store_payment_attempts set payment_plan = p_payment_plan,
    deposit_percent = case when p_payment_plan = 'deposit_20' then 20 else 100 end,
    requested_minor = v_charge where id = v_attempt.id;
  return jsonb_build_object('ok', true) || store_payment_summary(v_order.id);
end;
$$;

-- Request carts have no attempt until quote acceptance. Store the explicit
-- plan now so staff-quoted total changes show the same charge before acceptance.
create or replace function store_api_request_checkout(
  p_items jsonb, p_contact jsonb, p_language text, p_idempotency_key text,
  p_payment_plan text
)
returns jsonb
language plpgsql
as $$
declare
  v_result jsonb;
  v_summary jsonb;
  v_order_id uuid;
begin
  if p_payment_plan is null or p_payment_plan not in ('full', 'deposit_20') then
    return jsonb_build_object('ok', false, 'error', 'invalid_payment_plan');
  end if;
  if p_idempotency_key is not null then
    perform pg_advisory_xact_lock(hashtextextended(p_idempotency_key, 0));
  end if;
  v_result := store_api_request_checkout(p_items, p_contact, p_language, p_idempotency_key);
  if not coalesce((v_result->>'ok')::boolean, false) then return v_result; end if;
  select id into v_order_id from store_orders where reference = v_result->>'reference';
  if coalesce((v_result->>'idempotentReplay')::boolean, false) then
    v_summary := store_payment_summary(v_order_id);
    if v_summary->>'paymentPlan' <> p_payment_plan then
      return jsonb_build_object('ok', false, 'error', 'payment_plan_mismatch');
    end if;
  else
    update store_orders set payment_plan = p_payment_plan,
      deposit_percent = case when p_payment_plan = 'deposit_20' then 20 else 100 end
      where id = v_order_id;
    v_summary := store_payment_summary(v_order_id);
  end if;
  v_result := v_result || v_summary;
  if p_idempotency_key is not null then
    update store_idempotency_keys set response = v_result where key = p_idempotency_key;
  end if;
  return v_result;
end;
$$;

-- New callers explicitly choose the deposit. Old checkout signatures and their
-- full-payment semantics remain unchanged, including quote pricing/holds.
create or replace function store_api_checkout(
  p_items jsonb, p_contact jsonb, p_language text, p_hold_minutes int,
  p_idempotency_key text, p_payment_plan text
)
returns jsonb
language plpgsql
as $$
declare
  v_result jsonb;
  v_summary jsonb;
  v_order_id uuid;
begin
  if p_payment_plan is null or p_payment_plan not in ('full', 'deposit_20') then
    return jsonb_build_object('ok', false, 'error', 'invalid_payment_plan');
  end if;
  -- Concurrent retries of the same key must observe the first committed order.
  if p_idempotency_key is not null then
    perform pg_advisory_xact_lock(hashtextextended(p_idempotency_key, 0));
  end if;
  v_result := store_api_checkout(p_items, p_contact, p_language, p_hold_minutes, p_idempotency_key);
  if not coalesce((v_result->>'ok')::boolean, false) then return v_result; end if;
  select id into v_order_id from store_orders where reference = v_result->>'reference';
  if coalesce((v_result->>'idempotentReplay')::boolean, false) then
    v_summary := store_payment_summary(v_order_id);
    if v_summary->>'paymentPlan' <> p_payment_plan then
      return jsonb_build_object('ok', false, 'error', 'payment_plan_mismatch');
    end if;
  else
    v_summary := store_set_new_payment_plan(v_result->>'reference', p_payment_plan);
    if not coalesce((v_summary->>'ok')::boolean, false) then
      raise exception 'new checkout payment plan failed: %', v_summary;
    end if;
  end if;
  v_result := v_result || (v_summary - 'ok');
  if p_idempotency_key is not null then
    update store_idempotency_keys set response = v_result where key = p_idempotency_key;
  end if;
  return v_result;
end;
$$;

create or replace function store_api_accept_quote(
  p_reference text, p_token text, p_hold_minutes int, p_payment_plan text
)
returns jsonb
language plpgsql
as $$
declare
  v_result jsonb;
  v_summary jsonb;
  v_order_id uuid;
begin
  if p_payment_plan is null or p_payment_plan not in ('full', 'deposit_20') then
    return jsonb_build_object('ok', false, 'error', 'invalid_payment_plan');
  end if;
  v_result := store_api_accept_quote(p_reference, p_token, p_hold_minutes);
  if not coalesce((v_result->>'ok')::boolean, false) then return v_result; end if;
  select id into v_order_id from store_orders where reference = p_reference;
  if coalesce((v_result->>'alreadyAccepted')::boolean, false) then
    v_summary := store_payment_summary(v_order_id);
    if v_summary->>'paymentPlan' <> p_payment_plan then
      return jsonb_build_object('ok', false, 'error', 'payment_plan_mismatch');
    end if;
  else
    v_summary := store_set_new_payment_plan(p_reference, p_payment_plan);
    if not coalesce((v_summary->>'ok')::boolean, false) then
      raise exception 'accepted quote payment plan failed: %', v_summary;
    end if;
  end if;
  return v_result || (v_summary - 'ok');
end;
$$;

-- A provider transaction must never pay two orders. Provider names namespace
-- tokens so DPO and Pesapal can independently issue the same string.
create unique index if not exists store_payment_attempts_provider_token_idx
  on store_payment_attempts(provider, provider_token)
  where provider_token is not null;

-- Claim the remote submission before sending it. A timeout leaves an unknown
-- attempt which must be investigated/reconciled rather than charged again.
create or replace function store_begin_payment(
  p_reference text,
  p_provider text,
  p_provider_environment text,
  p_claim_id uuid
)
returns jsonb
language plpgsql
as $$
declare
  v_order store_orders;
  v_attempt store_payment_attempts;
begin
  if p_provider is null or p_provider not in ('dpo', 'pesapal') then
    return jsonb_build_object('ok', false, 'error', 'invalid_provider');
  end if;
  if p_provider_environment is null or p_provider_environment not in ('sandbox', 'live') then
    return jsonb_build_object('ok', false, 'error', 'invalid_provider_environment');
  end if;
  if p_claim_id is null then
    return jsonb_build_object('ok', false, 'error', 'invalid_payment_claim');
  end if;

  select * into v_order from store_orders where reference = p_reference for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'unknown_order');
  end if;
  if v_order.status <> 'pending_payment' then
    return jsonb_build_object('ok', false, 'error', 'order_not_payable', 'status', v_order.status);
  end if;

  select * into v_attempt from store_payment_attempts where order_id = v_order.id
    order by created_at desc, id desc limit 1 for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'no_open_attempt');
  end if;

  if v_attempt.provider_token is not null then
    if v_attempt.provider <> p_provider
       or (v_attempt.provider_environment is distinct from p_provider_environment
           and not (v_attempt.provider = 'dpo' and v_attempt.provider_environment is null)) then
      return jsonb_build_object('ok', false, 'error', 'payment_provider_mismatch');
    end if;
    if v_attempt.status not in ('pending', 'unknown') then
      return jsonb_build_object('ok', false, 'error', 'no_open_attempt');
    end if;
    return jsonb_build_object('ok', true, 'claimed', false,
      'provider', v_attempt.provider, 'providerEnvironment', v_attempt.provider_environment,
      'providerToken', v_attempt.provider_token, 'paymentUrl', v_attempt.provider_payment_url);
  end if;

  if v_attempt.status <> 'created' or v_attempt.payment_claim_id is not null then
    return jsonb_build_object('ok', false, 'error', 'payment_in_progress');
  end if;

  update store_payment_attempts set
    provider = p_provider, provider_environment = p_provider_environment,
    payment_claim_id = p_claim_id, status = 'unknown', updated_at = now()
    where id = v_attempt.id;
  return jsonb_build_object('ok', true, 'claimed', true,
    'provider', p_provider, 'providerEnvironment', p_provider_environment);
end;
$$;

-- New provider-aware attachment. The original DPO signature below delegates
-- here without a claim; that path can only touch never-claimed DPO attempts.
create or replace function store_attach_payment(
  p_reference text,
  p_provider_token text,
  p_company_ref text,
  p_provider text,
  p_provider_environment text,
  p_payment_url text,
  p_claim_id uuid
)
returns jsonb
language plpgsql
as $$
declare
  v_order store_orders;
  v_attempt store_payment_attempts;
  v_legacy boolean := p_claim_id is null and p_provider = 'dpo'
    and p_provider_environment is null and p_payment_url is null;
begin
  if p_provider is null or p_provider not in ('dpo', 'pesapal') then
    return jsonb_build_object('ok', false, 'error', 'invalid_provider');
  end if;
  if p_provider_token is null or btrim(p_provider_token) = '' then
    return jsonb_build_object('ok', false, 'error', 'invalid_provider_token');
  end if;
  if not v_legacy and (p_claim_id is null or p_provider_environment is null
      or p_provider_environment not in ('sandbox', 'live')
      or p_payment_url is null or btrim(p_payment_url) = '') then
    return jsonb_build_object('ok', false, 'error', 'invalid_payment_attachment');
  end if;

  select * into v_order from store_orders where reference = p_reference for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'unknown_order');
  end if;
  select * into v_attempt from store_payment_attempts where order_id = v_order.id
    order by created_at desc, id desc limit 1 for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'no_open_attempt');
  end if;

  if v_attempt.provider_token is not null then
    if v_attempt.provider = p_provider and v_attempt.provider_token = p_provider_token
       and (v_legacy and v_attempt.payment_claim_id is null
            or not v_legacy and v_attempt.payment_claim_id = p_claim_id
               and v_attempt.provider_environment = p_provider_environment
               and v_attempt.provider_payment_url = p_payment_url) then
      return jsonb_build_object('ok', true, 'reference', p_reference, 'alreadyAttached', true);
    end if;
    return jsonb_build_object('ok', false, 'error', 'payment_already_attached');
  end if;

  if v_order.status <> 'pending_payment' then
    return jsonb_build_object('ok', false, 'error', 'order_not_payable', 'status', v_order.status);
  end if;
  if v_legacy then
    if v_attempt.provider <> 'dpo' or v_attempt.payment_claim_id is not null
       or v_attempt.status not in ('created', 'pending') then
      return jsonb_build_object('ok', false, 'error', 'payment_claim_mismatch');
    end if;
  elsif v_attempt.payment_claim_id is distinct from p_claim_id
      or v_attempt.provider <> p_provider
      or v_attempt.provider_environment is distinct from p_provider_environment
      or v_attempt.status <> 'unknown' then
    return jsonb_build_object('ok', false, 'error', 'payment_claim_mismatch');
  end if;

  update store_payment_attempts set status = 'pending',
    provider_token = p_provider_token, company_ref = p_company_ref,
    provider_payment_url = p_payment_url, updated_at = now()
    where id = v_attempt.id;
  return jsonb_build_object('ok', true, 'reference', p_reference);
exception when unique_violation then
  return jsonb_build_object('ok', false, 'error', 'provider_token_in_use');
end;
$$;

create or replace function store_attach_payment(
  p_reference text,
  p_provider_token text,
  p_company_ref text
)
returns jsonb
language sql
as $$
  select store_attach_payment(p_reference, p_provider_token, p_company_ref,
    'dpo', null, null, null::uuid);
$$;

create or replace function store_reference_for_provider_token(
  p_provider_token text,
  p_provider text
)
returns text
language sql
stable
as $$
  select o.reference
  from store_payment_attempts pa
  join store_orders o on o.id = pa.order_id
  where pa.provider_token = p_provider_token and pa.provider = p_provider
  order by pa.created_at desc, pa.id desc limit 1;
$$;

create or replace function store_reference_for_provider_token(p_provider_token text)
returns text
language sql
stable
as $$
  select store_reference_for_provider_token(p_provider_token, 'dpo');
$$;

create or replace function store_payment_context(p_reference text)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'ok', true, 'reference', o.reference, 'orderStatus', o.status,
    'currency', o.currency, 'totalMinor', o.total_minor,
    'contactName', o.contact_name, 'contactEmail', o.contact_email,
    'contactPhone', o.contact_phone, 'language', o.language,
    'holdExpiresAt', o.hold_expires_at, 'attemptStatus', pa.status,
    'provider', pa.provider, 'providerEnvironment', pa.provider_environment,
    'providerPaymentUrl', pa.provider_payment_url,
    'providerToken', pa.provider_token, 'companyRef', pa.company_ref,
    'items', (select coalesce(jsonb_agg(jsonb_build_object(
      'title', oi.experience_title, 'optionCode', oi.option_code,
      'optionName', oi.option_name, 'date', oi.local_date, 'time', oi.local_time,
      'guests', oi.guests, 'totalMinor', oi.total_minor
    ) order by oi.local_date, oi.local_time), '[]'::jsonb)
      from store_order_items oi where oi.order_id = o.id)
  ) || store_payment_summary(o.id)
  from store_orders o
  join lateral (
    select * from store_payment_attempts where order_id = o.id
    order by created_at desc, id desc limit 1
  ) pa on true where o.reference = p_reference;
$$;

create or replace function store_payments_to_reconcile(
  p_older_than_minutes int default 5,
  p_limit int default 25
)
returns jsonb
language sql
stable
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'reference', candidate.reference, 'attemptStatus', candidate.status,
    'provider', candidate.provider, 'providerEnvironment', candidate.provider_environment,
    'providerToken', candidate.provider_token, 'updatedAt', candidate.updated_at
  ) order by candidate.updated_at, candidate.id), '[]'::jsonb)
  from (
    select o.reference, pa.*
    from store_payment_attempts pa join store_orders o on o.id = pa.order_id
    where ((pa.status in ('pending', 'unknown') and o.status = 'pending_payment')
            or pa.status = 'paid_acknowledgement_pending')
      and pa.provider_token is not null
      and pa.updated_at <= now() - make_interval(mins => greatest(p_older_than_minutes, 0))
    order by pa.updated_at, pa.id
    limit greatest(p_limit, 1)
  ) candidate;
$$;

-- Keep the existing booking/outbox finalization flow and correct its
-- per-departure late-payment capacity accounting.
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

  -- Check the whole order's demand per departure. Add back only this order's
  -- live holds because store_seats_available already subtracts them. This also
  -- catches partially expired holds and duplicate cart lines for one departure.
  for v_item in
    select oi.departure_id, sum(oi.guests)::int as guests,
           (array_agg(oi.id order by oi.id))[1] as id,
           coalesce((select sum(h.seats) from store_capacity_holds h
             where h.order_id = v_order.id
               and h.departure_id = oi.departure_id
               and h.status = 'active' and h.expires_at > now()), 0)::int as held_seats
    from store_order_items oi where oi.order_id = v_order.id
    group by oi.departure_id
    order by oi.departure_id
  loop
    if store_seats_available(v_item.departure_id) + v_item.held_seats < v_item.guests then
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
  ) || store_payment_summary(o.id)
  from store_orders o
  where o.reference = p_reference;
$$;

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
  ) || store_payment_summary(v_order.id);
end;
$$;

-- A provider can reverse a settled payment or confirm a payment after a
-- definitive failure/expiry released capacity. Flag those exceptional states
-- for manual review without changing bookings, holds or receipt entries. The
-- normal non-paid transition remains protected.
create or replace function store_flag_payment_review(
  p_reference text,
  p_provider_amounts jsonb default null
)
returns jsonb
language plpgsql
as $$
declare
  v_order store_orders;
  v_attempt_id uuid;
begin
  select * into v_order from store_orders where reference = p_reference for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'unknown_order');
  end if;
  if v_order.status = 'requires_review' then
    return jsonb_build_object('ok', true, 'reference', p_reference, 'alreadyFlagged', true);
  end if;
  if v_order.status not in ('paid', 'payment_failed', 'expired') then
    return jsonb_build_object('ok', false, 'error', 'order_not_reviewable', 'status', v_order.status);
  end if;
  select id into v_attempt_id from store_payment_attempts
    where order_id = v_order.id and status in ('paid', 'paid_acknowledgement_pending', 'failed', 'expired')
    order by created_at desc, id desc limit 1 for update;
  if v_attempt_id is null then
    return jsonb_build_object('ok', false, 'error', 'no_reviewable_attempt');
  end if;
  update store_orders set status = 'requires_review', updated_at = now() where id = v_order.id;
  update store_payment_attempts set status = 'verification_failed',
    provider_amounts = coalesce(p_provider_amounts, provider_amounts), updated_at = now()
    where id = v_attempt_id;
  return jsonb_build_object('ok', true, 'reference', p_reference, 'status', 'requires_review');
end;
$$;
