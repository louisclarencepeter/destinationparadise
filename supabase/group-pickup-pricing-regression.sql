-- SCRATCH DATABASE ONLY, after all migrations + seed.sql. These fictional
-- rates test mechanics, not approved business prices. All fixtures roll back.
begin;
create temp table group_pickup_ctx (key text primary key, val text) on commit drop;

-- 1. Configuration starts empty, indexed by option, with default-deny RLS.
do $$
declare v_table text; v_role text;
begin
  if exists (select 1 from store_option_group_prices)
     or exists (select 1 from store_option_pickup_prices) then
    raise exception 'run these tests before inserting any pricing configuration';
  end if;
  foreach v_table in array array['store_option_group_prices', 'store_option_pickup_prices'] loop
    if not (select relrowsecurity from pg_class where oid = v_table::regclass)
       or exists (select 1 from pg_policy where polrelid = v_table::regclass) then
      raise exception 'pricing table must have default-deny RLS: %', v_table;
    end if;
    if not exists (select 1 from pg_index i join pg_attribute a
      on a.attrelid = i.indrelid and a.attname = 'option_id'
      where i.indrelid = v_table::regclass and i.indisprimary and i.indkey[0] = a.attnum) then
      raise exception 'pricing option lookup/FK must have a leading primary-key index: %', v_table;
    end if;
    foreach v_role in array array['anon', 'authenticated'] loop
      if exists (select 1 from pg_roles where rolname = v_role) then
        if has_table_privilege(v_role, v_table, 'SELECT,INSERT,UPDATE,DELETE') then
          raise exception 'browser role has direct pricing privileges: %, %', v_role, v_table;
        end if;
        if has_function_privilege(v_role, 'store_price_option_with_pickup(uuid,int,text,text)', 'EXECUTE')
           or has_function_privilege(v_role, 'store_api_checkout_before_group_pickup(jsonb,jsonb,text,int,text)', 'EXECUTE') then
          raise exception 'browser role can bypass the private checkout/pricing helper: %', v_role;
        end if;
      end if;
    end loop;
    if exists (select 1 from pg_roles where rolname = 'service_role') then
      if not has_table_privilege('service_role', v_table, 'INSERT')
         or not has_table_privilege('service_role', v_table, 'UPDATE') then
        raise exception 'service role cannot configure approved pricing: %', v_table;
      end if;
    end if;
  end loop;
end $$;

-- Dedicated departures avoid the existing smoke/payment/concurrency fixtures.
do $$
declare exp uuid; shared uuid; private uuid; dep uuid;
begin
  select id into exp from store_experiences where source_key = 'spice-tour';
  select id into shared from store_experience_options where experience_id = exp and code = 'shared';
  select id into private from store_experience_options where experience_id = exp and code = 'private';
  insert into group_pickup_ctx values ('shared', shared::text), ('private', private::text);
  insert into store_departures (experience_id, starts_at, local_date, local_time,
    capacity_total, status, booking_cutoff_at)
  values (exp, ((current_date + 15) || ' 06:13')::timestamp at time zone 'Africa/Dar_es_Salaam',
    current_date + 15, '06:13', 30, 'scheduled', now() + interval '14 days') returning id into dep;
  insert into group_pickup_ctx values ('departure', dep::text);
  insert into store_departures (experience_id, starts_at, local_date, local_time,
    capacity_total, status, booking_cutoff_at)
  values (exp, ((current_date + 15) || ' 06:14')::timestamp at time zone 'Africa/Dar_es_Salaam',
    current_date + 15, '06:14', 30, 'scheduled', now() + interval '14 days');
end $$;

-- 2. Missing pickup, unapproved rates, seven guests and other areas cannot
-- create an order, payment attempt, hold or notification, even via old RPCs.
do $$
declare item jsonb; v jsonb; items jsonb; variant jsonb;
  orders_before int; holds_before int; attempts_before int; outbox_before int;
begin
  item := jsonb_build_object('id','unpriced','sourceKey','spice-tour','optionCode','shared',
    'guests',2,'date',(current_date+15)::text,'time','06:13');
  v := store_evaluate_item(item);
  if v->>'status' <> 'pickup_required' then raise exception 'old carts must select pickup: %', v; end if;
  item := item || '{"pickupZone":"north","accommodation":"Regression Hotel"}';
  v := store_evaluate_item(item);
  if v->>'status' <> 'quote_required' then raise exception 'missing rates fell back to linear pricing: %', v; end if;
  v := store_api_quote(jsonb_build_array(item));
  if v->'quotes'->0->>'status' <> 'quote_required' or (v->>'subtotalMinor')::bigint <> 0 then
    raise exception 'unpriced quote must have no payable subtotal: %', v;
  end if;
  orders_before := (select count(*) from store_orders);
  holds_before := (select count(*) from store_capacity_holds);
  attempts_before := (select count(*) from store_payment_attempts);
  outbox_before := (select count(*) from store_notification_outbox);
  for variant in select value from jsonb_array_elements(jsonb_build_array(
    item, item - 'pickupZone', item - 'accommodation',
    item || '{"pickupZone":"other"}', item || '{"guests":7}'
  )) loop
    items := jsonb_build_array(variant);
    v := store_api_checkout(items, '{"name":"Blocked","email":"blocked@regression.example"}',
      'en',15,null,'deposit_20');
    if (v->>'ok')::boolean or v->>'error' <> 'availability_conflict' then
      raise exception 'ineligible selection reached checkout: %', v;
    end if;
  end loop;
  if (select count(*) from store_orders) <> orders_before
     or (select count(*) from store_capacity_holds) <> holds_before
     or (select count(*) from store_payment_attempts) <> attempts_before
     or (select count(*) from store_notification_outbox) <> outbox_before then
    raise exception 'blocked pricing wrote commercial state';
  end if;
end $$;

-- Fictional, exact whole-group totals. Shared/private use different rows;
-- pickup is charged once per car, including an explicitly configured zero.
insert into store_option_group_prices (option_id, guests, amount_minor)
select (select val::uuid from group_pickup_ctx where key='shared'), guests, amount
from (values (1,13000),(2,20001),(3,26000),(4,30000),(5,34000),(6,36000)) v(guests,amount);
insert into store_option_group_prices (option_id, guests, amount_minor)
values ((select val::uuid from group_pickup_ctx where key='private'),2,30001),
       ((select val::uuid from group_pickup_ctx where key='private'),4,42000);
insert into store_option_pickup_prices (option_id, zone_code, amount_minor)
select (select val::uuid from group_pickup_ctx where key='shared'), zone, amount
from (values ('stone-town',0),('north',5000),('east',6000),('south',7000)) v(zone,amount);
insert into store_option_pickup_prices (option_id, zone_code, amount_minor)
select (select val::uuid from group_pickup_ctx where key='private'), zone, amount
from (values ('stone-town',0),('north',8000),('east',9000),('south',10000)) v(zone,amount);

-- 3. Catalog exposes only mode-specific monetary maps, never hotel details.
do $$
declare catalog jsonb; shared jsonb; private jsonb; opt uuid;
begin
  catalog := store_api_catalog();
  select o into shared from jsonb_array_elements(catalog) e,
    jsonb_array_elements(e->'options') o where e->>'sourceKey'='spice-tour' and o->>'code'='shared';
  select o into private from jsonb_array_elements(catalog) e,
    jsonb_array_elements(e->'options') o where e->>'sourceKey'='spice-tour' and o->>'code'='private';
  if shared->>'pickupPricingRequired'<>'true' or (shared->>'instantMaxGuests')::int<>6
     or (shared->'groupPrices'->>'2')::bigint<>20001
     or (private->'groupPrices'->>'2')::bigint<>30001
     or (shared->'pickupPrices'->>'north')::bigint<>5000
     or (shared->'pickupPrices'->>'stone-town')::bigint<>0
     or shared->'pickupPrices' ? 'other'
     or catalog::text like '%Regression Hotel%' or catalog::text like '%accommodation%' then
    raise exception 'catalog pricing contract/PII boundary failed: %', catalog;
  end if;
  opt := (select val::uuid from group_pickup_ctx where key='shared');
  begin
    insert into store_option_group_prices(option_id,guests,amount_minor) values(opt,7,10000);
    raise exception 'seven-person rate should be rejected';
  exception when check_violation then null; end;
  begin
    insert into store_option_group_prices(option_id,guests,amount_minor) values(opt,2,10000);
    raise exception 'duplicate mode/group rate should be rejected';
  exception when unique_violation then null; end;
  begin
    insert into store_option_pickup_prices(option_id,zone_code,amount_minor,currency) values(opt,'north',10000,'TZS');
    raise exception 'non-USD configuration should be rejected';
  exception when check_violation then null; end;
end $$;

-- 4. Exact group total + one pickup, positive USD only, no legacy supplement.
do $$
declare v jsonb; opt uuid := (select val::uuid from group_pickup_ctx where key='shared');
begin
  v := store_price_option_with_pickup(opt,2,'north','  Regression Hotel  ');
  if (v->>'totalMinor')::bigint<>25001 or jsonb_array_length(v->'lines')<>2
     or v->'lines'->0->>'type'<>'group_price' or (v->'lines'->0->>'guests')::int<>2
     or (v->'lines'->0->>'quantity')::int<>1
     or (v->'lines'->1->>'amountMinor')::bigint<>5000
     or (v->'lines'->1->>'quantity')::int<>1
     or v->'lines'->1->>'zoneCode'<>'north'
     or v->'lines'->1->>'accommodation'<>'Regression Hotel' then
    raise exception 'whole-group/per-car price is incorrect: %',v;
  end if;
  v := store_price_option_with_pickup((select val::uuid from group_pickup_ctx where key='private'),2,'north','Regression Hotel');
  if (v->>'totalMinor')::bigint<>38001 then raise exception 'mode-specific price added legacy private supplement: %',v; end if;
  v := store_price_option_with_pickup(opt,6,'stone-town','Regression Hotel');
  if (v->>'totalMinor')::bigint<>36000 or (v->'lines'->1->>'amountMinor')::bigint<>0 then
    raise exception 'zero configured pickup must remain included in breakdown: %',v;
  end if;
  update store_option_group_prices set amount_minor=0 where option_id=opt and guests=1;
  if store_price_option_with_pickup(opt,1,'stone-town','Regression Hotel') is not null then
    raise exception 'zero whole booking must require quote';
  end if;
  update store_option_group_prices set amount_minor=9223372036854775807 where option_id=opt and guests=1;
  if store_price_option_with_pickup(opt,1,'north','Regression Hotel') is not null then
    raise exception 'combined amount overflowing bigint must require quote';
  end if;
  update store_option_group_prices set amount_minor=9007199254740992 where option_id=opt and guests=1;
  if store_price_option_with_pickup(opt,1,'stone-town','Regression Hotel') is not null then
    raise exception 'integer cents above JavaScript exact range must require quote';
  end if;
  update store_option_group_prices set amount_minor=9007199254735991 where option_id=opt and guests=1;
  v := store_price_option_with_pickup(opt,1,'north','Regression Hotel');
  if (v->>'totalMinor')::bigint<>9007199254740991 then
    raise exception 'maximum exact integer cents should remain valid: %',v;
  end if;
  update store_option_group_prices set amount_minor=13000, active=false where option_id=opt and guests=1;
  if store_price_option_with_pickup(opt,1,'north','Regression Hotel') is not null then raise exception 'inactive group rate was used'; end if;
  update store_option_group_prices set active=true where option_id=opt and guests=1;
  update store_option_pickup_prices set active=false where option_id=opt and zone_code='south';
  if store_price_option_with_pickup(opt,2,'south','Regression Hotel') is not null then raise exception 'inactive pickup rate was used'; end if;
  update store_option_pickup_prices set active=true where option_id=opt and zone_code='south';
end $$;

-- 5. Eligibility adds pickup guards while retaining existing option/departure
-- validation, capacity accounting and cutoff checks for priced selections.
do $$
declare item jsonb; v jsonb; dep uuid := (select val::uuid from group_pickup_ctx where key='departure');
begin
  item := jsonb_build_object('id','priced','sourceKey','spice-tour','optionCode','shared',
    'guests',2,'date',(current_date+15)::text,'time','06:13',
    'pickupZone','north','accommodation','Regression Hotel');
  v := store_evaluate_item(item);
  if v->>'status'<>'available' or v->>'pickup'<>'North Zanzibar — Regression Hotel'
     or (v->'price'->>'totalMinor')::bigint<>25001 then raise exception 'priced evaluation incorrect: %',v; end if;
  if store_evaluate_item(item||'{"guests":0}')->>'status'<>'invalid_guests'
     or store_evaluate_item(item||'{"sourceKey":"missing"}')->>'status'<>'unknown_experience'
     or store_evaluate_item(item||'{"optionCode":"missing"}')->>'status'<>'unknown_option'
     or store_evaluate_item(item||'{"pickupZone":"other"}')->>'status'<>'quote_required'
     or store_evaluate_item(item||'{"pickupZone":"invalid"}')->>'status'<>'pickup_required'
     or store_evaluate_item(item||'{"accommodation":"  "}')->>'status'<>'pickup_required'
     or store_evaluate_item(item||jsonb_build_object('accommodation',repeat('h',201)))->>'status'<>'pickup_required'
     or store_evaluate_item(item||'{"time":"06:15"}')->>'status'<>'unknown_departure' then
    raise exception 'base or pickup selection validation was lost';
  end if;
  update store_departures set status='closed' where id=dep;
  if store_evaluate_item(item)->>'status'<>'departed' then raise exception 'closed departure became bookable'; end if;
  update store_departures set status='scheduled',booking_cutoff_at=now()-interval '1 second' where id=dep;
  if store_evaluate_item(item)->>'status'<>'departed' then raise exception 'cutoff departure became bookable'; end if;
  update store_departures set booking_cutoff_at=now()+interval '14 days',capacity_total=1 where id=dep;
  if store_evaluate_item(item)->>'status'<>'insufficient_seats' then raise exception 'insufficient seats ignored'; end if;
  update store_departures set capacity_total=30 where id=dep;
end $$;

-- 6. Same departure is one group across modes, zones and hotels. Other
-- departure rows remain independent; all-or-nothing checkout writes nothing.
do $$
declare a jsonb; b jsonb; c jsonb; items jsonb; v jsonb; orders_before int; holds_before int;
begin
  a := jsonb_build_object('id','split-a','sourceKey','spice-tour','optionCode','shared',
    'guests',4,'date',(current_date+15)::text,'time','06:13','pickupZone','north','accommodation','Hotel A');
  b := a || '{"id":"split-b","optionCode":"private","pickupZone":"south","accommodation":"Hotel B"}';
  c := a || '{"id":"independent","guests":2,"time":"06:14","accommodation":"Regression Hotel"}';
  items := jsonb_build_array(a,b,c);
  v := store_api_quote(items);
  if v->'quotes'->0->>'status'<>'quote_required' or v->'quotes'->1->>'status'<>'quote_required'
     or v->'quotes'->2->>'status'<>'available' or (v->>'subtotalMinor')::bigint<>25001 then
    raise exception 'splitting one car into rows bypassed aggregate guard: %',v;
  end if;
  orders_before := (select count(*) from store_orders); holds_before := (select count(*) from store_capacity_holds);
  v := store_api_checkout(items,'{"name":"Split","email":"split@regression.example"}','en',15,null,'deposit_20');
  if (v->>'ok')::boolean or jsonb_array_length(v->'conflicts')<>2
     or (select count(*) from store_orders)<>orders_before or (select count(*) from store_capacity_holds)<>holds_before then
    raise exception 'oversized trip wrote an order/hold or named wrong rows: %',v;
  end if;
  items := jsonb_build_array(a||'{"guests":2}',b||'{"guests":2}');
  v := store_api_quote(items);
  if v->'quotes'->0->>'status'<>'quote_required' or v->'quotes'->1->>'status'<>'quote_required'
     or (v->>'subtotalMinor')::bigint<>0 then
    raise exception 'smaller duplicate groups must not receive two tiers/pickup charges: %',v;
  end if;
  v := store_api_checkout(items,'{"name":"Duplicate","email":"duplicate@regression.example"}','en',15,null,'deposit_20');
  if (v->>'ok')::boolean or (select count(*) from store_orders)<>orders_before
     or (select count(*) from store_capacity_holds)<>holds_before then
    raise exception 'smaller duplicate groups bypassed checkout guard: %',v;
  end if;
  items := jsonb_build_array(a||'{"guests":6}',c||'{"guests":6}');
  v := store_api_checkout(items,'{"name":"Two Trips","email":"two-trips@regression.example"}','en',15,null,'deposit_20');
  if not (v->>'ok')::boolean or (v->>'totalMinor')::bigint<>82000
     or (select count(*) from store_order_items i join store_orders o on o.id=i.order_id where o.reference=v->>'reference')<>2 then
    raise exception 'six guests on independent departures should be allowed: %',v;
  end if;
end $$;

-- 7. Quote/checkout agreement, exact 20% rounding and immutable price/pickup
-- snapshots survive catalog changes and old/malformed payload replay.
do $$
declare items jsonb; v jsonb; quote jsonb; order_view jsonb; notice jsonb; ref text; tok text;
begin
  items := jsonb_build_array(jsonb_build_object('id','snapshot','sourceKey','spice-tour','optionCode','shared',
    'guests',2,'date',(current_date+15)::text,'time','06:13','pickupZone','north','accommodation','Regression Hotel'));
  quote := store_api_quote(items);
  v := store_api_checkout(items,'{"name":"Snapshot","email":"snapshot@regression.example"}',
    'en',15,'group-pickup-snapshot','deposit_20');
  if not (v->>'ok')::boolean or v->>'totalMinor'<>quote->>'subtotalMinor'
     or (v->>'totalMinor')::bigint<>25001 or (v->>'chargeMinor')::bigint<>5001
     or (v->>'balanceMinor')::bigint<>20000
     or v->'items'->0->'priceLines' is distinct from quote->'quotes'->0->'price'->'lines' then
    raise exception 'quote/deposit snapshot incorrect: %',v;
  end if;
  ref:=v->>'reference'; tok:=v->>'accessToken';
  insert into group_pickup_ctx values('reference',ref),('token',tok);
  order_view:=store_api_order(ref,tok); notice:=store_order_for_notification(ref);
  if order_view->'items'->0->'priceLines' is distinct from quote->'quotes'->0->'price'->'lines'
     or notice->'items'->0->'priceLines' is distinct from order_view->'items'->0->'priceLines'
     or notice->'items'->0->>'pickup'<>'North Zanzibar — Regression Hotel' then
    raise exception 'private order/email lost immutable breakdown: %, %',order_view,notice;
  end if;
  update store_option_group_prices set amount_minor=24001 where option_id=(select val::uuid from group_pickup_ctx where key='shared') and guests=2;
  update store_option_pickup_prices set amount_minor=6000 where option_id=(select val::uuid from group_pickup_ctx where key='shared') and zone_code='north';
  v:=store_api_order(ref,tok);
  if v is distinct from order_view or store_order_for_notification(ref) is distinct from notice then
    raise exception 'catalog edit repriced existing order';
  end if;
  v:=store_api_checkout('[{"id":"old-cart","sourceKey":"spice-tour","optionCode":"shared","guests":99}]',
    '{}','en',15,'group-pickup-snapshot','deposit_20');
  if not (v->>'idempotentReplay')::boolean or v->>'reference'<>ref or (v->>'chargeMinor')::bigint<>5001 then
    raise exception 'new pickup/group guard invalidated existing replay: %',v;
  end if;
  if store_api_order(ref,'wrong')->>'error'<>'not_found' then raise exception 'pickup details bypassed order token gate'; end if;
end $$;

-- 8. Provider claim/attach/finalize still uses the saved deposit, and replay
-- cannot duplicate bookings, holds or receipts after pricing configuration edits.
do $$
declare ref text := (select val from group_pickup_ctx where key='reference');
  tok text := (select val from group_pickup_ctx where key='token'); claim uuid:=gen_random_uuid(); v jsonb;
begin
  v:=store_payment_context(ref);
  if (v->>'totalMinor')::bigint<>25001 or (v->>'chargeMinor')::bigint<>5001 then raise exception 'payment repriced saved group: %',v; end if;
  v:=store_begin_payment(ref,'pesapal','sandbox',claim);
  if not (v->>'claimed')::boolean then raise exception 'group payment claim failed: %',v; end if;
  v:=store_attach_payment(ref,'GROUP-PICKUP-REGRESSION',ref,'pesapal','sandbox','https://cybqa.pesapal.com/checkout/group-regression',claim);
  if not (v->>'ok')::boolean then raise exception 'group payment attach failed: %',v; end if;
  v:=store_finalize_paid_order(ref);
  if not (v->>'ok')::boolean then raise exception 'group deposit finalize failed: %',v; end if;
  v:=store_finalize_paid_order(ref);
  if not (v->>'alreadyFinalized')::boolean
     or (select count(*) from store_bookings b join store_orders o on o.id=b.order_id where o.reference=ref)<>1
     or (select count(*) from store_notification_outbox n join store_orders o on o.id=n.order_id where o.reference=ref)<>2 then
    raise exception 'group finalize duplicated bookings or receipts: %',v;
  end if;
  v:=store_order_for_notification(ref);
  if v->>'paymentStatus'<>'deposit_paid' or (v->>'balanceMinor')::bigint<>20000
     or (v->'items'->0->'priceLines'->0->>'amountMinor')::bigint<>20001
     or (v->'items'->0->'priceLines'->1->>'amountMinor')::bigint<>5000 then
    raise exception 'paid receipt/refund basis changed from sale snapshot: %',v;
  end if;
  if store_api_order(ref,tok)->'items'->0->>'bookingCode' is null then raise exception 'confirmed group lost booking code'; end if;
end $$;

-- 9. Nonpilot instant pricing and the two-argument legacy helper are unchanged.
do $$
declare exp uuid; opt uuid; v jsonb; legacy jsonb;
begin
  insert into store_experiences(source_key,slug,code,title,meeting_point)
  values('regression-nonpilot','regression-nonpilot','NPG','Nonpilot Regression','Original meeting point') returning id into exp;
  insert into store_experience_options(experience_id,code,name,max_guests)
  values(exp,'shared','Shared',12) returning id into opt;
  insert into store_option_prices(option_id,kind,amount_minor) values(opt,'per_person_adult',1000),(opt,'party_supplement',500);
  insert into store_departures(experience_id,starts_at,local_date,local_time,capacity_total,booking_cutoff_at)
  values(exp,((current_date+15)||' 06:13')::timestamp at time zone 'Africa/Dar_es_Salaam',current_date+15,'06:13',20,now()+interval '14 days');
  v:=store_evaluate_item(jsonb_build_object('sourceKey','regression-nonpilot','optionCode','shared',
    'guests',8,'date',(current_date+15)::text,'time','06:13'));
  if v->>'status'<>'available' or (v->'price'->>'totalMinor')::bigint<>8500
     or v->>'pickup'<>'Original meeting point' then raise exception 'nonpilot pricing/pickup changed: %',v; end if;
  legacy:=store_price_option((select val::uuid from group_pickup_ctx where key='private'),2);
  if (legacy->>'totalMinor')::bigint<>18000 then raise exception 'legacy per-person/private helper changed: %',legacy; end if;
end $$;

-- 10. Separate, individually exact pilot fares cannot combine into a cart
-- total/deposit that loses integer precision in the JSON/JavaScript boundary.
do $$
declare opt uuid := (select val::uuid from group_pickup_ctx where key='shared');
  item jsonb; items jsonb; v jsonb; orders_before int; holds_before int; attempts_before int;
begin
  update store_option_group_prices set amount_minor=4503599627370496 where option_id=opt and guests=1;
  item:=jsonb_build_object('id','large-one','sourceKey','spice-tour','optionCode','shared',
    'guests',1,'date',(current_date+15)::text,'time','06:13','pickupZone','north','accommodation','Regression Hotel');
  if store_evaluate_item(item)->>'status'<>'available' then raise exception 'safe individual fare should remain eligible'; end if;
  items:=jsonb_build_array(item,item||'{"id":"large-two","time":"06:14"}');
  v:=store_api_quote(items);
  if v->'quotes'->0->>'status'<>'quote_required' or v->'quotes'->1->>'status'<>'quote_required'
     or (v->>'subtotalMinor')::bigint<>0 then
    raise exception 'combined unsafe integer cents reached quote subtotal: %',v;
  end if;
  orders_before:=(select count(*) from store_orders);
  holds_before:=(select count(*) from store_capacity_holds);
  attempts_before:=(select count(*) from store_payment_attempts);
  v:=store_api_checkout(items,'{"name":"Large Cart","email":"large-cart@regression.example"}',
    'en',15,null,'deposit_20');
  if (v->>'ok')::boolean or v->>'error'<>'availability_conflict'
     or (select count(*) from store_orders)<>orders_before
     or (select count(*) from store_capacity_holds)<>holds_before
     or (select count(*) from store_payment_attempts)<>attempts_before then
    raise exception 'unsafe combined amount wrote an order, hold or attempt: %',v;
  end if;
  update store_option_group_prices set amount_minor=13000 where option_id=opt and guests=1;
end $$;

-- 11. Deterministically change rates between the quote guard and the original
-- atomic checkout body. Its now-unsafe total must abort the entire operation,
-- including both newly created commercial rows and the injected rate edit.
do $test$
declare definition text; item jsonb; items jsonb; v jsonb;
  orders_before int; holds_before int; attempts_before int; caught boolean:=false;
  opt uuid:=(select val::uuid from group_pickup_ctx where key='shared');
begin
  definition:=pg_get_functiondef('store_api_checkout_before_group_pickup(jsonb,jsonb,text,integer,text)'::regprocedure);
  execute replace(definition,'CREATE OR REPLACE FUNCTION public.store_api_checkout_before_group_pickup(',
    'CREATE OR REPLACE FUNCTION pg_temp.group_pickup_actual_checkout(');
  execute $sql$
    create or replace function store_api_checkout_before_group_pickup(
      p_items jsonb, p_contact jsonb, p_language text default 'en',
      p_hold_minutes int default 15, p_idempotency_key text default null
    ) returns jsonb language plpgsql as $body$
    begin
      update store_option_group_prices set amount_minor=4503599627370496
        where guests=1 and option_id=(select o.id from store_experience_options o
          join store_experiences e on e.id=o.experience_id
          where e.source_key='spice-tour' and o.code='shared');
      return pg_temp.group_pickup_actual_checkout(p_items,p_contact,p_language,p_hold_minutes,p_idempotency_key);
    end;
    $body$;
  $sql$;
  item:=jsonb_build_object('id','race-one','sourceKey','spice-tour','optionCode','shared',
    'guests',1,'date',(current_date+15)::text,'time','06:13','pickupZone','north','accommodation','Regression Hotel');
  items:=jsonb_build_array(item,item||'{"id":"race-two","time":"06:14"}');
  orders_before:=(select count(*) from store_orders);
  holds_before:=(select count(*) from store_capacity_holds);
  attempts_before:=(select count(*) from store_payment_attempts);
  begin
    v:=store_api_checkout(items,'{"name":"Price Race","email":"price-race@regression.example"}',
      'en',15,null,'deposit_20');
  exception when raise_exception then
    if sqlerrm<>'configured pilot cart amount exceeds exact integer cents' then raise; end if;
    caught:=true;
  end;
  execute definition;
  if not caught or (select count(*) from store_orders)<>orders_before
     or (select count(*) from store_capacity_holds)<>holds_before
     or (select count(*) from store_payment_attempts)<>attempts_before
     or (select amount_minor from store_option_group_prices where option_id=opt and guests=1)<>13000 then
    raise exception 'unsafe administrative rate race failed to roll back all state: %',v;
  end if;
end $test$;

rollback;
select 'store group/pickup pricing regression passed (11 assertion groups)' as result;
