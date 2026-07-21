-- Payment plumbing for the DPO integration (HANDOFF.md Phase 3).
-- Provider-agnostic on purpose: these functions speak internal states only;
-- all DPO vocabulary stays in the Netlify adapter (_dpo.mjs).

-- ---------------------------------------------------------------------------
-- Attach a created provider transaction to the order's payment attempt.
-- ---------------------------------------------------------------------------

create or replace function store_attach_payment(
  p_reference text,
  p_provider_token text,
  p_company_ref text
)
returns jsonb
language plpgsql
as $$
declare
  v_order store_orders;
  v_updated int;
begin
  select * into v_order from store_orders where reference = p_reference for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'unknown_order');
  end if;
  if v_order.status <> 'pending_payment' then
    return jsonb_build_object('ok', false, 'error', 'order_not_payable', 'status', v_order.status);
  end if;

  update store_payment_attempts
    set status = 'pending',
        provider_token = p_provider_token,
        company_ref = p_company_ref,
        updated_at = now()
    where order_id = v_order.id and status in ('created', 'pending');
  get diagnostics v_updated = row_count;
  if v_updated = 0 then
    return jsonb_build_object('ok', false, 'error', 'no_open_attempt');
  end if;

  return jsonb_build_object('ok', true, 'reference', v_order.reference);
end;
$$;

-- ---------------------------------------------------------------------------
-- Payment context for the verify pipeline (service-role only, like all RPC).
-- ---------------------------------------------------------------------------

create or replace function store_payment_context(p_reference text)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'ok', true,
    'reference', o.reference,
    'orderStatus', o.status,
    'currency', o.currency,
    'totalMinor', o.total_minor,
    'contactName', o.contact_name,
    'contactEmail', o.contact_email,
    'contactPhone', o.contact_phone,
    'language', o.language,
    'holdExpiresAt', o.hold_expires_at,
    'attemptStatus', pa.status,
    'providerToken', pa.provider_token,
    'companyRef', pa.company_ref,
    'items', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'title', oi.experience_title,
        'optionCode', oi.option_code,
        'optionName', oi.option_name,
        'date', oi.local_date,
        'time', oi.local_time,
        'guests', oi.guests,
        'totalMinor', oi.total_minor
      ) order by oi.local_date, oi.local_time), '[]'::jsonb)
      from store_order_items oi where oi.order_id = o.id
    )
  )
  from store_orders o
  join lateral (
    select * from store_payment_attempts
    where order_id = o.id
    order by created_at desc
    limit 1
  ) pa on true
  where o.reference = p_reference;
$$;

-- Reverse lookup for provider callbacks that carry only the transaction token.
create or replace function store_reference_for_provider_token(p_provider_token text)
returns text
language sql
stable
as $$
  select o.reference
  from store_payment_attempts pa
  join store_orders o on o.id = pa.order_id
  where pa.provider_token = p_provider_token
  order by pa.created_at desc
  limit 1;
$$;

-- ---------------------------------------------------------------------------
-- Provider-event dedupe: repeated callbacks/retries insert once and report
-- whether this delivery is new (HANDOFF: retries cannot create duplicates).
-- ---------------------------------------------------------------------------

create or replace function store_record_provider_event(
  p_provider text,
  p_event_key text,
  p_reference text,
  p_payload jsonb
)
returns jsonb
language plpgsql
as $$
declare
  v_order_id uuid;
  v_inserted int;
begin
  select id into v_order_id from store_orders where reference = p_reference;
  insert into store_provider_events (provider, event_key, order_id, payload)
  values (p_provider, p_event_key, v_order_id, p_payload)
  on conflict (event_key) do nothing;
  get diagnostics v_inserted = row_count;
  return jsonb_build_object('ok', true, 'new', v_inserted > 0);
end;
$$;

-- ---------------------------------------------------------------------------
-- Non-paid outcome transitions. Definitive failures release the capacity
-- immediately; ambiguous outcomes keep holds and route to review.
--   p_status ∈ ('pending','unknown','failed','expired','verification_failed','requires_review')
-- ---------------------------------------------------------------------------

create or replace function store_mark_payment(
  p_reference text,
  p_status text,
  p_provider_amounts jsonb default null
)
returns jsonb
language plpgsql
as $$
declare
  v_order store_orders;
begin
  if p_status not in ('pending', 'unknown', 'failed', 'expired', 'verification_failed', 'requires_review') then
    return jsonb_build_object('ok', false, 'error', 'invalid_status');
  end if;

  select * into v_order from store_orders where reference = p_reference for update;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'unknown_order');
  end if;
  -- Never regress a finalized order.
  if v_order.status in ('paid', 'refunded', 'partially_refunded') then
    return jsonb_build_object('ok', true, 'reference', p_reference, 'skipped', 'order_finalized');
  end if;

  update store_payment_attempts
    set status = case when p_status = 'requires_review' then 'verification_failed' else p_status end,
        provider_amounts = coalesce(p_provider_amounts, provider_amounts),
        updated_at = now()
    where order_id = v_order.id
      and status in ('created', 'pending', 'unknown');

  if p_status in ('failed', 'expired') then
    update store_orders
      set status = case when p_status = 'failed' then 'payment_failed' else 'expired' end,
          updated_at = now()
      where id = v_order.id;
    -- Definitive rejection: free the seats now (HANDOFF availability rules).
    update store_capacity_holds set status = 'released'
      where order_id = v_order.id and status = 'active';
  elsif p_status in ('verification_failed', 'requires_review') then
    update store_orders set status = 'requires_review', updated_at = now()
      where id = v_order.id;
  end if;

  return jsonb_build_object('ok', true, 'reference', p_reference, 'status', p_status);
end;
$$;

-- ---------------------------------------------------------------------------
-- Acknowledgement bookkeeping around finalize:
--  * finalize succeeded but the provider ack call failed → 'paid_acknowledgement_pending'
--    (order/bookings stay paid; reconciliation retries the ack only)
--  * ack retry succeeded → back to 'paid'
-- ---------------------------------------------------------------------------

create or replace function store_mark_payment_ack(
  p_reference text,
  p_acknowledged boolean
)
returns jsonb
language plpgsql
as $$
declare
  v_order_id uuid;
begin
  select id into v_order_id from store_orders where reference = p_reference;
  if v_order_id is null then
    return jsonb_build_object('ok', false, 'error', 'unknown_order');
  end if;

  if p_acknowledged then
    update store_payment_attempts set status = 'paid', updated_at = now()
      where order_id = v_order_id and status = 'paid_acknowledgement_pending';
  else
    update store_payment_attempts set status = 'paid_acknowledgement_pending', updated_at = now()
      where order_id = v_order_id and status = 'paid';
  end if;
  return jsonb_build_object('ok', true);
end;
$$;

-- ---------------------------------------------------------------------------
-- Reconciliation worklist: stale in-flight attempts to re-verify, plus
-- pending acknowledgements to retry (HANDOFF "Delayed or exceptional payments").
-- ---------------------------------------------------------------------------

create or replace function store_payments_to_reconcile(
  p_older_than_minutes int default 5,
  p_limit int default 25
)
returns jsonb
language sql
stable
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'reference', o.reference,
    'attemptStatus', pa.status,
    'providerToken', pa.provider_token,
    'updatedAt', pa.updated_at
  ) order by pa.updated_at), '[]'::jsonb)
  from store_payment_attempts pa
  join store_orders o on o.id = pa.order_id
  where (
      (pa.status in ('pending', 'unknown') and o.status = 'pending_payment')
      or pa.status = 'paid_acknowledgement_pending'
    )
    and pa.provider_token is not null
    and pa.updated_at <= now() - make_interval(mins => greatest(p_older_than_minutes, 0))
  limit greatest(p_limit, 1);
$$;

-- ---------------------------------------------------------------------------
-- Full order snapshot for outbox emails (service-role only; unlike
-- store_api_order this is not token-gated because it never leaves the
-- functions layer).
-- ---------------------------------------------------------------------------

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
    'createdAt', o.created_at,
    'items', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'title', oi.experience_title,
        'optionName', oi.option_name,
        'date', oi.local_date,
        'time', oi.local_time,
        'guests', oi.guests,
        'pickup', oi.pickup,
        'totalMinor', oi.total_minor,
        'bookingCode', b.code
      ) order by oi.local_date, oi.local_time), '[]'::jsonb)
      from store_order_items oi
      left join store_bookings b on b.order_item_id = oi.id
      where oi.order_id = o.id
    )
  )
  from store_orders o
  where o.reference = p_reference;
$$;

-- ---------------------------------------------------------------------------
-- Notification outbox worklist + state transitions for the email sender.
-- ---------------------------------------------------------------------------

create or replace function store_outbox_due(p_limit int default 10)
returns jsonb
language sql
stable
as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id', nb.id,
    'kind', nb.kind,
    'reference', o.reference,
    'attempts', nb.attempts
  ) order by nb.created_at), '[]'::jsonb)
  from store_notification_outbox nb
  join store_orders o on o.id = nb.order_id
  where nb.status = 'pending' and nb.next_attempt_at <= now()
  limit greatest(p_limit, 1);
$$;

create or replace function store_outbox_mark(
  p_id uuid,
  p_sent boolean
)
returns jsonb
language plpgsql
as $$
begin
  if p_sent then
    update store_notification_outbox
      set status = 'sent', attempts = attempts + 1, updated_at = now()
      where id = p_id;
  else
    update store_notification_outbox
      set attempts = attempts + 1,
          status = case when attempts + 1 >= 8 then 'failed' else 'pending' end,
          -- Exponential-ish backoff capped at 6h.
          next_attempt_at = now() + least(make_interval(mins => (2 ^ least(attempts, 8))::int * 5), interval '6 hours'),
          updated_at = now()
      where id = p_id;
  end if;
  return jsonb_build_object('ok', true);
end;
$$;
