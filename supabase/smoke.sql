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
  if jsonb_array_length(v) <> 3 then
    raise exception 'catalog: expected 3 experiences, got %', jsonb_array_length(v);
  end if;
  if (select count(*) from jsonb_array_elements(v) e
        where e->'options' @> '[{"code":"shared"}]'::jsonb) <> 3 then
    raise exception 'catalog: every experience needs a shared option';
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

select 'store smoke test passed' as result;
