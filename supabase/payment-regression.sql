-- Provider/deposit regression checks. Run against a SCRATCH database after all
-- migrations + seed.sql (never production). Each assertion raises on failure.
-- All fixtures are rolled back; real concurrent claims are in concurrency.sql.
begin;
create temp table payment_test_ctx (key text primary key, val text) on commit drop;

do $$
declare v_exp uuid; v_dep uuid;
begin
  select id into v_exp from store_experiences where source_key = 'spice-tour';
  insert into store_departures (experience_id, starts_at, local_date, local_time,
    capacity_total, status, booking_cutoff_at)
  values (v_exp, ((current_date + 12) || ' 07:08')::timestamp at time zone 'Africa/Dar_es_Salaam',
    current_date + 12, '07:08', 100, 'scheduled', now() + interval '11 days')
  returning id into v_dep;
  insert into payment_test_ctx values ('departure', v_dep::text);
end $$;

-- Full legacy checkout and new deposit checkout retain the same trip total.
do $$
declare v jsonb; v_full jsonb; v_replay jsonb; v_items jsonb; ref text; tok text;
begin
  v_items := jsonb_build_array(jsonb_build_object('id', 'deposit', 'sourceKey', 'spice-tour',
    'optionCode', 'shared', 'guests', 2, 'date', (current_date + 12)::text, 'time', '07:08'));
  v_full := store_api_checkout(v_items,
    '{"name":"Legacy Guest","email":"legacy@regression.example"}', 'en', 15, null);
  if not (v_full->>'ok')::boolean then raise exception 'legacy checkout failed: %', v_full; end if;
  insert into payment_test_ctx values ('legacy', v_full->>'reference');
  v := store_payment_context(v_full->>'reference');
  if v->>'paymentPlan' <> 'full' or (v->>'chargeMinor')::bigint <> (v->>'totalMinor')::bigint
     or (v->>'balanceMinor')::bigint <> 0 or v->>'provider' <> 'dpo' then
    raise exception 'legacy full payment changed: %', v;
  end if;

  v := store_api_checkout(v_items,
    '{"name":"Deposit Guest","email":"deposit@regression.example","phone":"+255123456789"}',
    'en', 15, 'payment-regression-deposit', 'deposit_20');
  if not (v->>'ok')::boolean then raise exception 'deposit checkout failed: %', v; end if;
  ref := v->>'reference'; tok := v->>'accessToken';
  insert into payment_test_ctx values ('deposit', ref), ('depositToken', tok);
  if v->>'paymentPlan' <> 'deposit_20' or (v->>'depositPercent')::int <> 20
     or (v->>'totalMinor')::bigint <> (v_full->>'totalMinor')::bigint
     or (v->>'chargeMinor')::bigint <> (v->>'totalMinor')::bigint / 5
     or (v->>'depositMinor')::bigint <> (v->>'chargeMinor')::bigint
     or (v->>'balanceMinor')::bigint <> (v->>'totalMinor')::bigint - (v->>'chargeMinor')::bigint then
    raise exception 'deposit price contract wrong: %', v;
  end if;
  v_replay := store_api_checkout(v_items, '{}', 'en', 15, 'payment-regression-deposit', 'deposit_20');
  if v_replay->>'reference' <> ref or not (v_replay->>'idempotentReplay')::boolean
     or v_replay->>'chargeMinor' <> v->>'chargeMinor' then
    raise exception 'deposit replay changed charge/order: %', v_replay;
  end if;
  v_replay := store_api_checkout(v_items, '{}', 'en', 15, 'payment-regression-deposit', 'full');
  if v_replay->>'error' <> 'payment_plan_mismatch' then
    raise exception 'replay must not change payment plan: %', v_replay;
  end if;

  -- Amounts not divisible by five round up exactly one cent.
  update store_orders set total_minor = 10001 where reference = ref;
  v := store_set_new_payment_plan(ref, 'deposit_20');
  if (v->>'chargeMinor')::bigint <> 2001 or (v->>'balanceMinor')::bigint <> 8000 then
    raise exception 'deposit rounding must be ceil(total/5): %', v;
  end if;
end $$;

-- A remote submission can be claimed once. Its token, provider, environment,
-- and redirect can be attached only by that claim, and cannot be overwritten.
do $$
declare v jsonb; ref text := (select val from payment_test_ctx where key = 'deposit');
  claim uuid := gen_random_uuid(); wrong uuid := gen_random_uuid();
begin
  insert into payment_test_ctx values ('claim', claim::text);
  v := store_begin_payment(ref, 'pesapal', 'sandbox', claim);
  if not (v->>'ok')::boolean or not (v->>'claimed')::boolean then
    raise exception 'Pesapal claim failed: %', v;
  end if;
  v := store_begin_payment(ref, 'pesapal', 'sandbox', wrong);
  if v->>'error' <> 'payment_in_progress' then raise exception 'duplicate creation must be blocked: %', v; end if;
  v := store_set_new_payment_plan(ref, 'full');
  if v->>'error' <> 'payment_plan_locked' then raise exception 'claimed plan must be immutable: %', v; end if;
  v := store_attach_payment(ref, 'PESAPAL-TOKEN-REGRESSION', ref, 'pesapal', 'sandbox',
    'https://cybqa.pesapal.com/checkout/regression', wrong);
  if v->>'error' <> 'payment_claim_mismatch' then raise exception 'wrong claim attached token: %', v; end if;
  v := store_attach_payment(ref, 'PESAPAL-TOKEN-REGRESSION', ref, 'pesapal', 'sandbox',
    'https://cybqa.pesapal.com/checkout/regression', claim);
  if not (v->>'ok')::boolean then raise exception 'Pesapal attachment failed: %', v; end if;
  v := store_attach_payment(ref, 'PESAPAL-TOKEN-REGRESSION', ref, 'pesapal', 'sandbox',
    'https://cybqa.pesapal.com/checkout/regression', claim);
  if not (v->>'alreadyAttached')::boolean then raise exception 'same attach must replay: %', v; end if;
  v := store_attach_payment(ref, 'OTHER-TOKEN', ref, 'pesapal', 'sandbox',
    'https://cybqa.pesapal.com/checkout/other', claim);
  if v->>'error' <> 'payment_already_attached' then raise exception 'token overwrite allowed: %', v; end if;
  v := store_attach_payment(ref, 'OTHER-TOKEN', ref);
  if v->>'error' <> 'payment_already_attached' then raise exception 'legacy caller changed provider/token: %', v; end if;
  v := store_begin_payment(ref, 'pesapal', 'sandbox', wrong);
  if not (v->>'ok')::boolean or (v->>'claimed')::boolean
     or v->>'paymentUrl' <> 'https://cybqa.pesapal.com/checkout/regression' then
    raise exception 'attached redirect must be reusable: %', v;
  end if;
  v := store_begin_payment(ref, 'pesapal', 'live', wrong);
  if v->>'error' <> 'payment_provider_mismatch' then raise exception 'environment change allowed: %', v; end if;
  v := store_payment_context(ref);
  if v->>'provider' <> 'pesapal' or v->>'providerEnvironment' <> 'sandbox'
     or v->>'contactEmail' <> 'deposit@regression.example'
     or v->>'contactPhone' <> '+255123456789' or (v->>'chargeMinor')::bigint <> 2001 then
    raise exception 'provider billing context wrong: %', v;
  end if;
  if store_reference_for_provider_token('PESAPAL-TOKEN-REGRESSION', 'pesapal') <> ref
     or store_reference_for_provider_token('PESAPAL-TOKEN-REGRESSION') is not null then
    raise exception 'provider token namespace lookup failed';
  end if;
end $$;

-- Old DPO attachment remains available, idempotent and immutable; the same
-- token string can independently belong to a different provider.
do $$
declare v jsonb; ref text := (select val from payment_test_ctx where key = 'legacy');
begin
  v := store_attach_payment(ref, 'PESAPAL-TOKEN-REGRESSION', ref);
  if not (v->>'ok')::boolean then raise exception 'legacy DPO attach failed: %', v; end if;
  v := store_attach_payment(ref, 'PESAPAL-TOKEN-REGRESSION', ref);
  if not (v->>'alreadyAttached')::boolean then raise exception 'legacy replay failed: %', v; end if;
  v := store_attach_payment(ref, 'DPO-REPLACEMENT', ref);
  if v->>'error' <> 'payment_already_attached' then raise exception 'legacy token overwrite allowed: %', v; end if;
  if store_reference_for_provider_token('PESAPAL-TOKEN-REGRESSION') <> ref then
    raise exception 'legacy lookup must select DPO only';
  end if;
end $$;

-- The reconciliation limit applies before aggregate, and preserves provider
-- identity. Finalized deposits book normally but never claim fully paid.
do $$
declare v jsonb; ctx jsonb; ref text := (select val from payment_test_ctx where key = 'deposit');
  tok text := (select val from payment_test_ctx where key = 'depositToken');
begin
  update store_payment_attempts set updated_at = now() - interval '3 days'
    where order_id = (select id from store_orders where reference = ref);
  v := store_payments_to_reconcile(0, 1);
  if jsonb_array_length(v) <> 1 or v->0->>'reference' <> ref
     or v->0->>'provider' <> 'pesapal' or v->0->>'providerEnvironment' <> 'sandbox' then
    raise exception 'reconcile limit/provider failed: %', v;
  end if;
  v := store_finalize_paid_order(ref);
  if not (v->>'ok')::boolean then raise exception 'deposit finalize failed: %', v; end if;
  v := store_finalize_paid_order(ref);
  if not (v->>'alreadyFinalized')::boolean then raise exception 'finalize replay failed: %', v; end if;
  if (select count(*) from store_bookings b join store_orders o on o.id = b.order_id where o.reference = ref) <> 1 then
    raise exception 'deposit finalize duplicated bookings';
  end if;
  v := store_api_order(ref, tok);
  if v->>'paymentStatus' <> 'deposit_paid' or (v->>'balanceMinor')::bigint <> 8000
     or v->'items'->0->>'bookingStatus' <> 'confirmed' then
    raise exception 'public deposit order inaccurate: %', v;
  end if;
  ctx := store_order_for_notification(ref);
  if ctx->>'paymentStatus' <> 'deposit_paid' or ctx->>'chargeMinor' <> v->>'chargeMinor'
     or ctx->>'balanceMinor' <> v->>'balanceMinor' then raise exception 'notification deposit inaccurate: %', ctx; end if;
  v := store_api_order(ref, 'wrong-token');
  if v->>'error' <> 'not_found' then raise exception 'deposit fields bypassed token gate: %', v; end if;
end $$;

-- Partial expiry must check summed demand: two lines of four guests cannot
-- finalize against six remaining seats, even when one four-seat hold survives.
do $$
declare v_exp uuid; v_dep uuid; v jsonb; ref text; competitor text;
begin
  select id into v_exp from store_experiences where source_key = 'spice-tour';
  insert into store_departures (experience_id, starts_at, local_date, local_time,
    capacity_total, status, booking_cutoff_at)
  values (v_exp, ((current_date + 12) || ' 07:09')::timestamp at time zone 'Africa/Dar_es_Salaam',
    current_date + 12, '07:09', 10, 'scheduled', now() + interval '11 days') returning id into v_dep;
  v := store_api_checkout(jsonb_build_array(
    jsonb_build_object('id','a','sourceKey','spice-tour','optionCode','shared','guests',4,'date',(current_date+12)::text,'time','07:09'),
    jsonb_build_object('id','b','sourceKey','spice-tour','optionCode','shared','guests',4,'date',(current_date+12)::text,'time','07:09')),
    '{"name":"Late Guest","email":"late@regression.example"}', 'en', 15, null, 'deposit_20');
  if not (v->>'ok')::boolean then raise exception 'late fixture checkout failed: %', v; end if;
  ref := v->>'reference';
  update store_capacity_holds set expires_at = now() - interval '1 minute'
    where id = (select h.id from store_capacity_holds h join store_orders o on o.id=h.order_id
      where o.reference=ref order by h.id limit 1);
  v := store_api_checkout(jsonb_build_array(
    jsonb_build_object('id','c','sourceKey','spice-tour','optionCode','shared','guests',4,'date',(current_date+12)::text,'time','07:09')),
    '{"name":"Competitor","email":"competitor@regression.example"}', 'en', 15, null);
  if not (v->>'ok')::boolean then raise exception 'competitor checkout failed: %', v; end if;
  competitor := v->>'reference';
  v := store_finalize_paid_order(competitor);
  if not (v->>'ok')::boolean then raise exception 'competitor finalize failed: %', v; end if;
  v := store_finalize_paid_order(ref);
  if v->>'error' <> 'capacity_lost'
     or (select status from store_orders where reference=ref) <> 'requires_review'
     or exists (select 1 from store_bookings b join store_orders o on o.id=b.order_id where o.reference=ref) then
    raise exception 'partial expiry oversold capacity: %', v;
  end if;
end $$;

-- Staff quotes apply the same integer deposit and preserve acceptance replay.
do $$
declare v jsonb; ref text; tok text; item uuid; exp uuid;
begin
  v := store_api_request_checkout('[{"id":"rq","sourceKey":"prison-island","optionCode":"request","guests":2,"requestedDates":"Any morning"}]',
    '{"name":"Request Deposit","email":"request-deposit@regression.example"}', 'en', 'request-deposit-regression', 'deposit_20');
  if not (v->>'ok')::boolean then raise exception 'request fixture failed: %', v; end if;
  ref := v->>'reference';
  select oi.id into item from store_order_items oi join store_orders o on o.id=oi.order_id where o.reference=ref;
  select id into exp from store_experiences where source_key='prison-island';
  insert into store_departures (experience_id, starts_at, local_date, local_time, capacity_total, status, booking_cutoff_at)
  values (exp, ((current_date+12)||' 07:11')::timestamp at time zone 'Africa/Dar_es_Salaam',current_date+12,'07:11',8,'scheduled',now()+interval '11 days');
  v := store_staff_quote(ref, jsonb_build_array(jsonb_build_object('itemId',item,'date',(current_date+12)::text,'time','07:11','totalMinor',10001)), null, 72);
  if not (v->>'ok')::boolean then raise exception 'staff quote failed: %', v; end if;
  select nb.payload->>'accessToken' into tok from store_notification_outbox nb join store_orders o on o.id=nb.order_id
    where o.reference=ref and nb.kind='quote_ready';
  v := store_api_order(ref,tok);
  if v->>'paymentPlan'<>'deposit_20' or (v->>'chargeMinor')::bigint<>2001 or (v->>'balanceMinor')::bigint<>8000 then
    raise exception 'quoted order must show deposit before acceptance: %',v;
  end if;
  v := store_order_for_notification(ref);
  if (v->>'chargeMinor')::bigint<>2001 or (v->>'balanceMinor')::bigint<>8000 then
    raise exception 'quote notification must show deposit before acceptance: %',v;
  end if;
  v := store_api_accept_quote(ref,tok,1440,'deposit_20');
  if not (v->>'ok')::boolean or (v->>'chargeMinor')::bigint<>2001 or (v->>'balanceMinor')::bigint<>8000 then
    raise exception 'quote deposit acceptance failed: %', v;
  end if;
  v := store_api_accept_quote(ref,tok,1440,'deposit_20');
  if not (v->>'alreadyAccepted')::boolean or (v->>'chargeMinor')::bigint<>2001 then
    raise exception 'quote acceptance replay changed deposit: %', v;
  end if;
  v := store_api_accept_quote(ref,tok,1440,'full');
  if v->>'error'<>'payment_plan_mismatch' then raise exception 'accepted deposit changed to full: %',v; end if;
end $$;

-- Historical request/quote callers retain full-payment terms when the new
-- acceptance endpoint uses the plan on the authorized order snapshot.
do $$
declare v jsonb; ref text; tok text; old_tok text; item uuid;
begin
  v := store_api_request_checkout('[{"id":"legacy-rq","sourceKey":"prison-island","optionCode":"request","guests":2}]',
    '{"name":"Historical Quote","email":"legacy-quote@regression.example"}', 'en', 'legacy-quote-regression');
  if not (v->>'ok')::boolean then raise exception 'historical request failed: %',v; end if;
  ref:=v->>'reference'; old_tok:=v->>'accessToken';
  select oi.id into item from store_order_items oi join store_orders o on o.id=oi.order_id where o.reference=ref;
  v:=store_staff_quote(ref,jsonb_build_array(jsonb_build_object('itemId',item,'date',(current_date+12)::text,'time','07:11','totalMinor',10001)),null,72);
  if not (v->>'ok')::boolean then raise exception 'historical quote failed: %',v; end if;
  select nb.payload->>'accessToken' into tok from store_notification_outbox nb join store_orders o on o.id=nb.order_id
    where o.reference=ref and nb.kind='quote_ready';
  v:=store_api_order(ref,old_tok);
  if v->>'error'<>'not_found' then raise exception 'quote must preserve token rotation: %',v; end if;
  v:=store_api_order(ref,tok);
  if v->>'paymentPlan'<>'full' or (v->>'chargeMinor')::bigint<>10001 or (v->>'balanceMinor')::bigint<>0 then
    raise exception 'historical quote terms changed: %',v;
  end if;
  v:=store_api_accept_quote(ref,tok,1440,v->>'paymentPlan');
  if not (v->>'ok')::boolean or (v->>'chargeMinor')::bigint<>10001 or v->>'paymentPlan'<>'full' then
    raise exception 'historical quote acceptance changed charge: %',v;
  end if;
  v:=store_api_accept_quote(ref,tok,1440,'full');
  if not (v->>'alreadyAccepted')::boolean or (v->>'chargeMinor')::bigint<>10001 then
    raise exception 'historical quote replay changed charge: %',v;
  end if;
end $$;

-- A verified post-payment reversal flags review while preserving existing
-- booking codes, capacity consumption and receipt entries.
do $$
declare v jsonb; ref text := (select val from payment_test_ctx where key='deposit');
  bookings_before int; notifications_before int;
begin
  select count(*) into bookings_before from store_bookings b join store_orders o on o.id=b.order_id where o.reference=ref;
  select count(*) into notifications_before from store_notification_outbox nb join store_orders o on o.id=nb.order_id where o.reference=ref;
  v := store_flag_payment_review(ref,'{"provider":"pesapal","statusCode":3}');
  if not (v->>'ok')::boolean or (select status from store_orders where reference=ref)<>'requires_review' then
    raise exception 'post-payment reversal was not flagged: %',v;
  end if;
  v := store_flag_payment_review(ref,'{"provider":"pesapal","statusCode":3}');
  if not (v->>'alreadyFlagged')::boolean then raise exception 'reversal replay failed: %',v; end if;
  if (select count(*) from store_bookings b join store_orders o on o.id=b.order_id where o.reference=ref)<>bookings_before
     or (select count(*) from store_notification_outbox nb join store_orders o on o.id=nb.order_id where o.reference=ref)<>notifications_before
     or exists (select 1 from store_bookings b join store_orders o on o.id=b.order_id where o.reference=ref and b.status<>'confirmed') then
    raise exception 'reversal changed confirmed bookings/notifications';
  end if;
end $$;

-- Late provider confirmation after definitive failure/expiry never restores
-- released capacity, automatically confirms trips, or adds receipt entries.
do $$
declare v jsonb; ref text; outcome text; claim uuid;
  hold_snapshot jsonb; notifications_before int;
begin
  foreach outcome in array array['failed','expired'] loop
    v:=store_api_checkout(jsonb_build_array(jsonb_build_object('id','late-terminal','sourceKey','spice-tour','optionCode','shared',
      'guests',1,'date',(current_date+12)::text,'time','07:08')),
      '{"name":"Late Terminal","email":"late-terminal@regression.example"}', 'en',15,null,'deposit_20');
    if not (v->>'ok')::boolean then raise exception 'late terminal fixture failed: %',v; end if;
    ref:=v->>'reference'; claim:=gen_random_uuid();
    v:=store_begin_payment(ref,'pesapal','sandbox',claim);
    if not (v->>'claimed')::boolean then raise exception 'late terminal claim failed: %',v; end if;
    v:=store_attach_payment(ref,'LATE-TERMINAL-'||outcome,ref,'pesapal','sandbox','https://cybqa.pesapal.com/checkout/late-'||outcome,claim);
    if not (v->>'ok')::boolean then raise exception 'late terminal attach failed: %',v; end if;
    v:=store_mark_payment(ref,outcome);
    if not (v->>'ok')::boolean then raise exception 'terminal transition failed: %',v; end if;
    select jsonb_agg(jsonb_build_object('id',h.id,'status',h.status,'expiresAt',h.expires_at) order by h.id)
      into hold_snapshot from store_capacity_holds h join store_orders o on o.id=h.order_id where o.reference=ref;
    select count(*) into notifications_before from store_notification_outbox nb join store_orders o on o.id=nb.order_id where o.reference=ref;
    v:=store_flag_payment_review(ref,'{"provider":"pesapal","statusCode":1}');
    if not (v->>'ok')::boolean or (select status from store_orders where reference=ref)<>'requires_review' then
      raise exception 'late completed payment must require review: %',v;
    end if;
    if exists (select 1 from store_bookings b join store_orders o on o.id=b.order_id where o.reference=ref)
       or (select count(*) from store_notification_outbox nb join store_orders o on o.id=nb.order_id where o.reference=ref)<>notifications_before
       or (select jsonb_agg(jsonb_build_object('id',h.id,'status',h.status,'expiresAt',h.expires_at) order by h.id)
         from store_capacity_holds h join store_orders o on o.id=h.order_id where o.reference=ref) is distinct from hold_snapshot then
      raise exception 'late confirmation changed bookings, holds, or notifications for %',outcome;
    end if;
  end loop;
end $$;

rollback;
select 'store payment regression test passed' as result;
