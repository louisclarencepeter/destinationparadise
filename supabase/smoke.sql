-- Store schema smoke test. Run against a scratch database AFTER applying
-- migrations + seed.sql (never against production — it writes orders):
--
--   psql "$DATABASE_URL" -v ON_ERROR_STOP=1 \
--     -f supabase/migrations/20260721120000_store_schema.sql \
--     -f supabase/seed.sql -f supabase/smoke.sql
--
-- Every check raises an exception on failure, so a clean exit means the
-- atomic checkout, conflict, idempotency, finalize, token-auth and expiry
-- paths all behave as specified in HANDOFF.md.

create temp table smoke_ctx (key text primary key, val text);

-- 1. Catalog ----------------------------------------------------------------
do $$
declare v jsonb;
begin
  v := store_api_catalog();
  if jsonb_array_length(v) <> 6 then
    raise exception 'catalog: expected 6 experiences (3 instant + 3 request), got %', jsonb_array_length(v);
  end if;
  if (select count(*) from jsonb_array_elements(v) e
        where e->'options' @> '[{"code":"shared"}]'::jsonb) <> 3 then
    raise exception 'catalog: expected 3 experiences with shared options';
  end if;
  if (select count(*) from jsonb_array_elements(v) e
        where e->'options' @> '[{"code":"request"}]'::jsonb) <> 3 then
    raise exception 'catalog: expected 3 request-only experiences';
  end if;
end $$;

-- 2. Availability: untouched departures sell at full capacity ---------------
do $$
declare v jsonb; d date := current_date + 2;
begin
  v := store_api_availability('spice-tour', d, d);
  if v ? 'error' then raise exception 'availability error: %', v->>'error'; end if;
  if (v->'days'->(d::text)->'times'->0->>'seats')::int <> 16 then
    raise exception 'availability: expected 16 seats, got %',
      v->'days'->(d::text)->'times'->0->>'seats';
  end if;
end $$;

-- 3. Quote ------------------------------------------------------------------
do $$
declare v jsonb; d text := (current_date + 2)::text;
begin
  v := store_api_quote(jsonb_build_array(
    jsonb_build_object('id', 'q1', 'sourceKey', 'spice-tour', 'optionCode', 'shared',
                       'guests', 2, 'date', d, 'time', '09:00')));
  if v->'quotes'->0->>'status' <> 'available' then
    raise exception 'quote: expected available, got %', v->'quotes'->0->>'status';
  end if;
  if (v->>'subtotalMinor')::bigint <> 9000 then
    raise exception 'quote: expected 9000 minor, got %', v->>'subtotalMinor';
  end if;
end $$;

-- 4. Atomic checkout happy path ---------------------------------------------
do $$
declare v jsonb; d text := (current_date + 2)::text;
begin
  v := store_api_checkout(
    jsonb_build_array(
      jsonb_build_object('id', 'a', 'sourceKey', 'spice-tour', 'optionCode', 'shared',
                         'guests', 2, 'date', d, 'time', '09:00'),
      jsonb_build_object('id', 'b', 'sourceKey', 'safari-blue', 'optionCode', 'private',
                         'guests', 2, 'date', d, 'time', '08:30')),
    jsonb_build_object('name', 'Smoke Guest', 'email', 'smoke@example.com', 'phone', '+255 700 000 001'),
    'en', 15, 'smoke-idem-key-0001');
  if not (v->>'ok')::boolean then raise exception 'checkout failed: %', v; end if;
  -- 2×4500 + (2×9500 + 18000) = 46000
  if (v->>'totalMinor')::bigint <> 46000 then
    raise exception 'checkout: expected 46000 minor, got %', v->>'totalMinor';
  end if;
  insert into smoke_ctx values ('ref', v->>'reference'), ('token', v->>'accessToken');
end $$;

-- Holds active and availability reduced.
do $$
declare v jsonb; d date := current_date + 2; seats int;
begin
  if (select count(*) from store_capacity_holds h
        join store_orders o on o.id = h.order_id
        where o.reference = (select val from smoke_ctx where key = 'ref')
          and h.status = 'active') <> 2 then
    raise exception 'checkout: expected 2 active holds';
  end if;
  v := store_api_availability('spice-tour', d, d);
  seats := (select (t->>'seats')::int from jsonb_array_elements(v->'days'->(d::text)->'times') t
             where t->>'time' = '09:00');
  if seats <> 14 then raise exception 'availability after hold: expected 14, got %', seats; end if;
end $$;

-- 5. All-or-nothing conflict: demand more seats than remain -----------------
do $$
declare v jsonb; d text := (current_date + 2)::text; orders_before int; orders_after int;
begin
  orders_before := (select count(*) from store_orders);
  v := store_api_checkout(
    jsonb_build_array(
      jsonb_build_object('id', 'ok-item', 'sourceKey', 'stone-town', 'optionCode', 'shared',
                         'guests', 2, 'date', d, 'time', '09:30'),
      jsonb_build_object('id', 'greedy', 'sourceKey', 'spice-tour', 'optionCode', 'shared',
                         'guests', 15, 'date', d, 'time', '09:00')),
    jsonb_build_object('name', 'Conflict Guest', 'email', 'conflict@example.com'),
    'en', 15, null);
  if (v->>'ok')::boolean then raise exception 'conflict checkout must fail'; end if;
  if v->>'error' <> 'availability_conflict' then
    raise exception 'expected availability_conflict, got %', v->>'error';
  end if;
  if v->'conflicts'->0->>'id' <> 'greedy' then
    raise exception 'conflict must name the offending item, got %', v->'conflicts';
  end if;
  orders_after := (select count(*) from store_orders);
  if orders_after <> orders_before then
    raise exception 'conflicting checkout must write no orders';
  end if;
end $$;

-- 6. Idempotent replay returns the same order, creates nothing new ----------
do $$
declare v jsonb; d text := (current_date + 2)::text; n int;
begin
  v := store_api_checkout(
    jsonb_build_array(jsonb_build_object('id', 'a', 'sourceKey', 'spice-tour',
      'optionCode', 'shared', 'guests', 2, 'date', d, 'time', '09:00')),
    jsonb_build_object('name', 'Smoke Guest', 'email', 'smoke@example.com'),
    'en', 15, 'smoke-idem-key-0001');
  if v->>'reference' <> (select val from smoke_ctx where key = 'ref') then
    raise exception 'idempotent replay must return the original order';
  end if;
  if not (v->>'idempotentReplay')::boolean then
    raise exception 'expected idempotentReplay marker';
  end if;
  n := (select count(*) from store_orders where contact_email = 'smoke@example.com');
  if n <> 1 then raise exception 'replay must not create a second order (found %)', n; end if;
end $$;

-- 7. Finalize: paid order mints one booking per item, idempotently ----------
do $$
declare v jsonb; ref text := (select val from smoke_ctx where key = 'ref');
begin
  v := store_finalize_paid_order(ref);
  if not (v->>'ok')::boolean then raise exception 'finalize failed: %', v; end if;
  if jsonb_array_length(v->'bookings') <> 2 then
    raise exception 'expected 2 bookings, got %', v->'bookings';
  end if;

  if (select count(*) from store_bookings b join store_orders o on o.id = b.order_id
        where o.reference = ref and b.code like 'SP-%') <> 1
     or (select count(*) from store_bookings b join store_orders o on o.id = b.order_id
        where o.reference = ref and b.code like 'SB-%') <> 1 then
    raise exception 'booking codes must use experience prefixes';
  end if;
  if (select status from store_orders where reference = ref) <> 'paid' then
    raise exception 'order must be paid after finalize';
  end if;
  if exists (select 1 from store_capacity_holds h join store_orders o on o.id = h.order_id
              where o.reference = ref and h.status <> 'consumed') then
    raise exception 'all holds must be consumed after finalize';
  end if;
  if (select count(*) from store_notification_outbox nb join store_orders o on o.id = nb.order_id
        where o.reference = ref) <> 2 then
    raise exception 'expected receipt + confirmations in outbox';
  end if;

  -- Replay must not duplicate bookings.
  v := store_finalize_paid_order(ref);
  if not (v->>'alreadyFinalized')::boolean then raise exception 'expected alreadyFinalized'; end if;
  if (select count(*) from store_bookings b join store_orders o on o.id = b.order_id
        where o.reference = ref) <> 2 then
    raise exception 'finalize replay duplicated bookings';
  end if;
end $$;

-- Confirmed bookings keep seats consumed after holds are gone.
do $$
declare v jsonb; d date := current_date + 2; seats int;
begin
  v := store_api_availability('spice-tour', d, d);
  seats := (select (t->>'seats')::int from jsonb_array_elements(v->'days'->(d::text)->'times') t
             where t->>'time' = '09:00');
  if seats <> 14 then raise exception 'post-finalize seats: expected 14, got %', seats; end if;
end $$;

-- 8. Order read is token-gated ----------------------------------------------
do $$
declare v jsonb;
  ref text := (select val from smoke_ctx where key = 'ref');
  tok text := (select val from smoke_ctx where key = 'token');
begin
  v := store_api_order(ref, tok);
  if not (v->>'ok')::boolean then raise exception 'order read with valid token failed'; end if;
  if (select count(*) from jsonb_array_elements(v->'items') i where i->>'bookingCode' is null) <> 0 then
    raise exception 'order read must include booking codes after finalize';
  end if;
  v := store_api_order(ref, repeat('0', 48));
  if (v->>'ok')::boolean then raise exception 'order read must reject a wrong token'; end if;
end $$;

-- 9. Expiry: expired holds release seats; abandoned orders expire -----------
do $$
declare v jsonb; d text := (current_date + 3)::text; dd date := current_date + 3;
  seats int; ref2 text;
begin
  v := store_api_checkout(
    jsonb_build_array(jsonb_build_object('id', 'x', 'sourceKey', 'stone-town',
      'optionCode', 'shared', 'guests', 4, 'date', d, 'time', '14:30')),
    jsonb_build_object('name', 'Expiry Guest', 'email', 'expiry@example.com'),
    'en', 15, null);
  if not (v->>'ok')::boolean then raise exception 'expiry checkout failed: %', v; end if;
  ref2 := v->>'reference';

  -- Backdate the hold + order far past expiry.
  update store_capacity_holds h set expires_at = now() - interval '2 hours'
    from store_orders o where o.id = h.order_id and o.reference = ref2;
  update store_orders set hold_expires_at = now() - interval '2 hours' where reference = ref2;

  -- Availability must ignore the expired hold even BEFORE cleanup runs.
  v := store_api_availability('stone-town', dd, dd);
  seats := (select (t->>'seats')::int from jsonb_array_elements(v->'days'->(dd::text)->'times') t
             where t->>'time' = '14:30');
  if seats <> 12 then raise exception 'expired hold must not block seats (got %)', seats; end if;

  perform store_release_expired_holds();
  if (select count(*) from store_capacity_holds h join store_orders o on o.id = h.order_id
        where o.reference = ref2 and h.status = 'expired') <> 1 then
    raise exception 'cleanup must flag the expired hold';
  end if;
  if (select status from store_orders where reference = ref2) <> 'expired' then
    raise exception 'abandoned pending order must expire';
  end if;
end $$;

-- 10. Late payment cannot oversell: capacity lost → requires_review ---------
do $$
declare v jsonb; d text := (current_date + 4)::text; refa text; refb text;
begin
  -- Order A holds 10 of stone-town 16:30's 12 seats…
  v := store_api_checkout(
    jsonb_build_array(jsonb_build_object('id', 'a', 'sourceKey', 'stone-town',
      'optionCode', 'shared', 'guests', 6, 'date', d, 'time', '16:30')),
    jsonb_build_object('name', 'Late Payer', 'email', 'late@example.com'), 'en', 15, null);
  if not (v->>'ok')::boolean then raise exception 'late-pay checkout A failed: %', v; end if;
  refa := v->>'reference';

  -- …then A's hold expires…
  update store_capacity_holds h set expires_at = now() - interval '1 hour'
    from store_orders o where o.id = h.order_id and o.reference = refa;

  -- …and order B books and PAYS for 8 of the 12 seats.
  v := store_api_checkout(
    jsonb_build_array(jsonb_build_object('id', 'b', 'sourceKey', 'stone-town',
      'optionCode', 'shared', 'guests', 8, 'date', d, 'time', '16:30')),
    jsonb_build_object('name', 'Fast Payer', 'email', 'fast@example.com'), 'en', 15, null);
  if not (v->>'ok')::boolean then raise exception 'late-pay checkout B failed: %', v; end if;
  refb := v->>'reference';
  v := store_finalize_paid_order(refb);
  if not (v->>'ok')::boolean then raise exception 'finalize B failed: %', v; end if;

  -- A's late payment now finds only 4 seats for its 6 guests: never oversell.
  v := store_finalize_paid_order(refa);
  if (v->>'ok')::boolean then raise exception 'late finalize must not oversell'; end if;
  if v->>'error' <> 'capacity_lost' then raise exception 'expected capacity_lost, got %', v; end if;
  if (select status from store_orders where reference = refa) <> 'requires_review' then
    raise exception 'late order must be routed to requires_review';
  end if;
end $$;

-- 11. Payment attach + provider-event dedupe + definitive failure ------------
do $$
declare v jsonb; d text := (current_date + 5)::text; ref text; dd date := current_date + 5; seats int;
begin
  v := store_api_checkout(
    jsonb_build_array(jsonb_build_object('id', 'p1', 'sourceKey', 'spice-tour',
      'optionCode', 'shared', 'guests', 3, 'date', d, 'time', '14:00')),
    jsonb_build_object('name', 'Pay Guest', 'email', 'pay@example.com'), 'en', 15, null);
  if not (v->>'ok')::boolean then raise exception 'payment checkout failed: %', v; end if;
  ref := v->>'reference';
  insert into smoke_ctx values ('payref', ref);

  v := store_attach_payment(ref, 'TOKEN-SMOKE-1', ref);
  if not (v->>'ok')::boolean then raise exception 'attach failed: %', v; end if;
  if (select pa.status from store_payment_attempts pa join store_orders o on o.id = pa.order_id
        where o.reference = ref) <> 'pending' then
    raise exception 'attempt must be pending after attach';
  end if;
  if store_reference_for_provider_token('TOKEN-SMOKE-1') <> ref then
    raise exception 'token → reference lookup failed';
  end if;

  v := store_payment_context(ref);
  if (v->>'totalMinor')::bigint <> 13500 or v->>'attemptStatus' <> 'pending' then
    raise exception 'payment context wrong: %', v;
  end if;

  v := store_record_provider_event('dpo', 'evt-smoke-1', ref, '{"kind":"callback"}'::jsonb);
  if not (v->>'new')::boolean then raise exception 'first event must be new'; end if;
  v := store_record_provider_event('dpo', 'evt-smoke-1', ref, '{"kind":"callback"}'::jsonb);
  if (v->>'new')::boolean then raise exception 'duplicate event must dedupe'; end if;

  -- Declined payment: order fails and the seats come straight back.
  v := store_mark_payment(ref, 'failed', '{"code":"901"}'::jsonb);
  if not (v->>'ok')::boolean then raise exception 'mark failed errored: %', v; end if;
  if (select status from store_orders where reference = ref) <> 'payment_failed' then
    raise exception 'order must be payment_failed';
  end if;
  if exists (select 1 from store_capacity_holds h join store_orders o on o.id = h.order_id
              where o.reference = ref and h.status = 'active') then
    raise exception 'declined payment must release holds';
  end if;
  v := store_api_availability('spice-tour', dd, dd);
  seats := (select (t->>'seats')::int from jsonb_array_elements(v->'days'->(dd::text)->'times') t
             where t->>'time' = '14:00');
  if seats <> 16 then raise exception 'released seats must be sellable again (got %)', seats; end if;
end $$;

-- 12. Paid flow with acknowledgement retry + outbox lifecycle ----------------
do $$
declare v jsonb; d text := (current_date + 6)::text; ref text; outbox_id uuid;
begin
  v := store_api_checkout(
    jsonb_build_array(jsonb_build_object('id', 'p2', 'sourceKey', 'stone-town',
      'optionCode', 'private', 'guests', 2, 'date', d, 'time', '09:30')),
    jsonb_build_object('name', 'Ack Guest', 'email', 'ack@example.com'), 'en', 15, null);
  if not (v->>'ok')::boolean then raise exception 'ack checkout failed: %', v; end if;
  ref := v->>'reference';

  perform store_attach_payment(ref, 'TOKEN-SMOKE-2', ref);
  v := store_finalize_paid_order(ref);
  if not (v->>'ok')::boolean then raise exception 'ack finalize failed: %', v; end if;

  -- Provider acknowledgement failed → paid_acknowledgement_pending, order stays paid.
  perform store_mark_payment_ack(ref, false);
  if (select pa.status from store_payment_attempts pa join store_orders o on o.id = pa.order_id
        where o.reference = ref order by pa.created_at desc limit 1) <> 'paid_acknowledgement_pending' then
    raise exception 'expected paid_acknowledgement_pending';
  end if;
  if (select status from store_orders where reference = ref) <> 'paid' then
    raise exception 'ack failure must not touch the paid order';
  end if;

  -- Reconciliation worklist sees it (no age filter dodge: pass 0 minutes).
  v := store_payments_to_reconcile(0, 50);
  if not exists (select 1 from jsonb_array_elements(v) e where e->>'reference' = ref) then
    raise exception 'ack-pending attempt must appear in reconciliation list';
  end if;

  perform store_mark_payment_ack(ref, true);
  if (select pa.status from store_payment_attempts pa join store_orders o on o.id = pa.order_id
        where o.reference = ref order by pa.created_at desc limit 1) <> 'paid' then
    raise exception 'ack retry must restore paid';
  end if;

  -- Outbox: due rows exist for this order, marking works both ways.
  v := store_outbox_due(50);
  if (select count(*) from jsonb_array_elements(v) e where e->>'reference' = ref) <> 2 then
    raise exception 'expected 2 due outbox rows for %', ref;
  end if;
  outbox_id := (select (e->>'id')::uuid from jsonb_array_elements(v) e
                 where e->>'reference' = ref limit 1);
  perform store_outbox_mark(outbox_id, false);
  if (select attempts from store_notification_outbox where id = outbox_id) <> 1 then
    raise exception 'failed outbox mark must bump attempts';
  end if;
  perform store_outbox_mark(outbox_id, true);
  if (select status from store_notification_outbox where id = outbox_id) <> 'sent' then
    raise exception 'outbox row must be sent';
  end if;
end $$;

-- 13. mark_payment never regresses a finalized order -------------------------
do $$
declare v jsonb; ref text := (select val from smoke_ctx where key = 'ref');
begin
  v := store_mark_payment(ref, 'failed', null);
  if v->>'skipped' is null then raise exception 'finalized order must be skip-protected: %', v; end if;
  if (select status from store_orders where reference = ref) <> 'paid' then
    raise exception 'paid order must stay paid';
  end if;
end $$;

-- 14. Health snapshot counts the states the earlier sections created --------
do $$
declare v jsonb;
begin
  v := store_health_snapshot(0);
  -- Section 10 parked one order in requires_review.
  if (v->>'requiresReviewOrders')::int < 1 then
    raise exception 'health: expected requires_review orders, got %', v;
  end if;
  -- Sections 7 and 12 finalized paid orders.
  if (v->>'paidOrdersLast24h')::int < 2 then
    raise exception 'health: expected paid orders in window, got %', v;
  end if;
  if v->>'failedOutbox' is null or v->>'stuckPendingAttempts' is null
     or v->>'stuckAcknowledgements' is null or v->>'overdueOutbox' is null
     or v->>'activeHolds' is null then
    raise exception 'health: snapshot missing keys: %', v;
  end if;
end $$;

-- 15. Request cart lifecycle: submit → staff quote → accept → finalize ------
do $$
declare v jsonb; d text := (current_date + 8)::text; ref text; tok text;
  item_req uuid; item_inst uuid; exp_pi uuid;
begin
  -- Mixed cart: one request item (prison-island) + one instant rider (spice-tour).
  v := store_api_request_checkout(
    jsonb_build_array(
      jsonb_build_object('id', 'r1', 'sourceKey', 'prison-island', 'optionCode', 'request',
                         'guests', 4, 'requestedDates', 'Any morning around ' || d),
      jsonb_build_object('id', 'i1', 'sourceKey', 'spice-tour', 'optionCode', 'shared',
                         'guests', 2, 'date', d, 'time', '09:00')),
    jsonb_build_object('name', 'Request Guest', 'email', 'request@example.com'),
    'en', 'smoke-req-key-0001');
  if not (v->>'ok')::boolean then raise exception 'request checkout failed: %', v; end if;
  ref := v->>'reference'; tok := v->>'accessToken';

  if (select status from store_orders where reference = ref) <> 'awaiting_availability' then
    raise exception 'request order must await availability';
  end if;
  if exists (select 1 from store_capacity_holds h join store_orders o on o.id = h.order_id
              where o.reference = ref) then
    raise exception 'request checkout must take NO holds';
  end if;
  if (select count(*) from store_notification_outbox nb join store_orders o on o.id = nb.order_id
        where o.reference = ref and nb.kind in ('request_received', 'request_team_alert')) <> 2 then
    raise exception 'request emails must be queued';
  end if;

  -- Idempotent replay.
  v := store_api_request_checkout(
    jsonb_build_array(jsonb_build_object('id', 'r1', 'sourceKey', 'prison-island',
      'optionCode', 'request', 'guests', 4)),
    jsonb_build_object('name', 'Request Guest', 'email', 'request@example.com'),
    'en', 'smoke-req-key-0001');
  if v->>'reference' <> ref then raise exception 'request replay must return original order'; end if;

  select id into item_req from store_order_items oi
    where oi.order_id = (select id from store_orders where reference = ref)
      and oi.item_kind = 'request';
  select id into item_inst from store_order_items oi
    where oi.order_id = (select id from store_orders where reference = ref)
      and oi.item_kind = 'instant';

  -- Accept before quote must fail.
  v := store_api_accept_quote(ref, tok);
  if (v->>'ok')::boolean then raise exception 'accept before quote must fail'; end if;

  -- Staff quote without a departure for the request item → clear error.
  v := store_staff_quote(ref, jsonb_build_array(jsonb_build_object(
    'itemId', item_req, 'date', d, 'time', '10:10', 'totalMinor', 20000)), null, 72);
  if v->>'error' <> 'no_departure' then raise exception 'expected no_departure, got %', v; end if;

  -- Staff create the departure, then quote both items.
  select id into exp_pi from store_experiences where source_key = 'prison-island';
  insert into store_departures (experience_id, starts_at, ends_at, local_date, local_time,
                                capacity_total, status, booking_cutoff_at)
  values (exp_pi, (d || ' 10:10')::timestamp at time zone 'Africa/Dar_es_Salaam', null,
          d::date, '10:10', 8, 'scheduled', now() + interval '6 days')
  on conflict do nothing;

  v := store_staff_quote(ref,
    jsonb_build_array(
      jsonb_build_object('itemId', item_req, 'date', d, 'time', '10:10', 'totalMinor', 20000,
                         'note', 'Private boat confirmed'),
      jsonb_build_object('itemId', item_inst, 'date', d, 'time', '09:00', 'totalMinor', 9000)),
    'All confirmed with suppliers', 72);
  if not (v->>'ok')::boolean then raise exception 'staff quote failed: %', v; end if;
  if (v->>'totalMinor')::bigint <> 29000 then
    raise exception 'quote total wrong: %', v->>'totalMinor';
  end if;
  if (select status from store_orders where reference = ref) <> 'quoted' then
    raise exception 'order must be quoted';
  end if;

  -- Quoting rotated the token: the old link must be dead, the new one lives
  -- transiently in the quote_ready outbox payload until redacted after send.
  v := store_api_order(ref, tok);
  if (v->>'ok')::boolean then raise exception 'old token must die on quote rotation'; end if;
  select nb.payload->>'accessToken' into tok
    from store_notification_outbox nb join store_orders o on o.id = nb.order_id
    where o.reference = ref and nb.kind = 'quote_ready';
  if tok is null then raise exception 'quote_ready payload must carry the new token'; end if;

  -- Guest accepts: atomic holds + pending_payment.
  v := store_api_accept_quote(ref, tok);
  if not (v->>'ok')::boolean then raise exception 'accept failed: %', v; end if;
  if (select count(*) from store_capacity_holds h join store_orders o on o.id = h.order_id
        where o.reference = ref and h.status = 'active') <> 2 then
    raise exception 'accept must hold both items';
  end if;
  if (select status from store_orders where reference = ref) <> 'pending_payment' then
    raise exception 'accepted order must be pending_payment';
  end if;

  -- Accept replay is idempotent.
  v := store_api_accept_quote(ref, tok);
  if not (v->>'alreadyAccepted')::boolean then raise exception 'accept replay must be idempotent'; end if;

  -- Wrong token cannot accept.
  v := store_api_accept_quote(ref, repeat('0', 48));
  if (v->>'ok')::boolean then raise exception 'accept must reject bad tokens'; end if;

  -- Finalize mints codes for both kinds (PI- prefix proves request items book).
  v := store_finalize_paid_order(ref);
  if not (v->>'ok')::boolean then raise exception 'request finalize failed: %', v; end if;
  if (select count(*) from store_bookings b join store_orders o on o.id = b.order_id
        where o.reference = ref and b.code like 'PI-%') <> 1 then
    raise exception 'request item must get its own PI- booking code';
  end if;

  v := store_api_order(ref, tok);
  if (select count(*) from jsonb_array_elements(v->'items') i
        where i->>'bookingCode' is not null) <> 2 then
    raise exception 'order read must show both booking codes';
  end if;

  -- Sender-side redaction removes the raw token from every guest-facing row.
  perform store_outbox_redact(nb.id)
    from store_notification_outbox nb join store_orders o on o.id = nb.order_id
    where o.reference = ref and nb.payload ? 'accessToken';
  if exists (select 1 from store_notification_outbox nb join store_orders o on o.id = nb.order_id
              where o.reference = ref and nb.payload ? 'accessToken') then
    raise exception 'redaction must strip tokens from outbox payloads';
  end if;
end $$;

select 'store smoke test passed' as result;
