-- Store concurrency checks (HANDOFF.md Phase 4: "concurrent attempts for the
-- final available places", "repeated callbacks … cannot create duplicates").
--
-- Uses dblink to fire genuinely concurrent sessions at the database. Run on a
-- SCRATCH database after migrations + seed (never production — it writes):
--
--   set store.test_conninfo = 'host=… port=… dbname=… user=… password=…';
--   \i supabase/concurrency.sql
--
-- Without store.test_conninfo it falls back to a local same-database
-- connection, which works on typical scratch setups with trust/local auth.
-- Every check raises on failure; clean exit ⇔ the races behave correctly.

create extension if not exists dblink;

create temp table conc_ctx (key text primary key, val text);

-- Dedicated test departure: capacity 3, tomorrow 07:07 (no template collision).
do $$
declare v_exp uuid; v_dep uuid;
begin
  select id into v_exp from store_experiences where source_key = 'spice-tour';
  insert into store_departures (
    experience_id, starts_at, ends_at, local_date, local_time,
    capacity_total, status, booking_cutoff_at
  ) values (
    v_exp,
    ((current_date + 1) || ' 07:07')::timestamp at time zone 'Africa/Dar_es_Salaam',
    ((current_date + 1) || ' 11:07')::timestamp at time zone 'Africa/Dar_es_Salaam',
    current_date + 1, '07:07', 3, 'scheduled', now() + interval '12 hours'
  )
  on conflict (experience_id, starts_at) do update set capacity_total = 3
  returning id into v_dep;
  insert into conc_ctx values ('dep', v_dep::text);
end $$;

-- Helper: connection string for the racing sessions.
create or replace function pg_temp.conc_conninfo()
returns text
language sql
stable
as $$
  select coalesce(
    nullif(current_setting('store.test_conninfo', true), ''),
    format('dbname=%s', current_database())
  );
$$;

-- The setup above must be COMMITTED before other sessions can see the test
-- departure. Plain psql autocommits per statement; programmatic runners that
-- send whole files as one implicit transaction must split on this marker.
-- @commit

-- 1. Two concurrent checkouts race for the last seats: exactly one wins ------
do $$
declare
  v_conninfo text := pg_temp.conc_conninfo();
  v_date text := (current_date + 1)::text;
  v_sql text;
  v_a jsonb; v_b jsonb;
  v_ok int := 0; v_conflict int := 0;
  v_orders int;
begin
  perform dblink_connect('conc_a', v_conninfo);
  perform dblink_connect('conc_b', v_conninfo);

  -- Each session wants 2 of the 3 seats on the same departure.
  v_sql := format(
    $q$select store_api_checkout(
         jsonb_build_array(jsonb_build_object(
           'id', 'race', 'sourceKey', 'spice-tour', 'optionCode', 'shared',
           'guests', 2, 'date', %L, 'time', '07:07')),
         jsonb_build_object('name', 'Race %s', 'email', 'race@example.com'),
         'en', 15, null)::text$q$,
    v_date, 'X');

  perform dblink_send_query('conc_a', v_sql);
  perform dblink_send_query('conc_b', v_sql);

  select result::jsonb into v_a from dblink_get_result('conc_a') as t(result text);
  perform * from dblink_get_result('conc_a') as t(result text); -- drain
  select result::jsonb into v_b from dblink_get_result('conc_b') as t(result text);
  perform * from dblink_get_result('conc_b') as t(result text); -- drain

  perform dblink_disconnect('conc_a');
  perform dblink_disconnect('conc_b');

  if (v_a->>'ok')::boolean then v_ok := v_ok + 1; end if;
  if (v_b->>'ok')::boolean then v_ok := v_ok + 1; end if;
  if v_a->>'error' = 'availability_conflict' then v_conflict := v_conflict + 1; end if;
  if v_b->>'error' = 'availability_conflict' then v_conflict := v_conflict + 1; end if;

  if v_ok <> 1 or v_conflict <> 1 then
    raise exception 'race must produce exactly one winner and one conflict (ok=%, conflict=%, a=%, b=%)',
      v_ok, v_conflict, v_a, v_b;
  end if;

  if store_seats_available((select val from conc_ctx where key = 'dep')::uuid) <> 1 then
    raise exception 'exactly 1 seat must remain after the race, got %',
      store_seats_available((select val from conc_ctx where key = 'dep')::uuid);
  end if;

  select count(*) into v_orders from store_orders where contact_email = 'race@example.com';
  if v_orders <> 1 then
    raise exception 'exactly one race order may exist, found %', v_orders;
  end if;

  insert into conc_ctx values ('winner',
    coalesce(nullif(v_a->>'reference', ''), v_b->>'reference'));
end $$;

-- @commit

-- 2. Concurrent finalize replays cannot duplicate bookings -------------------
do $$
declare
  v_conninfo text := pg_temp.conc_conninfo();
  v_ref text := (select val from conc_ctx where key = 'winner');
  v_sql text;
  v_a jsonb; v_b jsonb;
  v_bookings int;
begin
  if v_ref is null then raise exception 'missing winner reference'; end if;

  perform dblink_connect('fin_a', v_conninfo);
  perform dblink_connect('fin_b', v_conninfo);

  v_sql := format('select store_finalize_paid_order(%L)::text', v_ref);
  perform dblink_send_query('fin_a', v_sql);
  perform dblink_send_query('fin_b', v_sql);

  select result::jsonb into v_a from dblink_get_result('fin_a') as t(result text);
  perform * from dblink_get_result('fin_a') as t(result text);
  select result::jsonb into v_b from dblink_get_result('fin_b') as t(result text);
  perform * from dblink_get_result('fin_b') as t(result text);

  perform dblink_disconnect('fin_a');
  perform dblink_disconnect('fin_b');

  if not (v_a->>'ok')::boolean or not (v_b->>'ok')::boolean then
    raise exception 'both concurrent finalizes must succeed (a=%, b=%)', v_a, v_b;
  end if;
  if not ((v_a->>'alreadyFinalized')::boolean is true
          or (v_b->>'alreadyFinalized')::boolean is true) then
    raise exception 'one finalize must observe alreadyFinalized (a=%, b=%)', v_a, v_b;
  end if;

  select count(*) into v_bookings
  from store_bookings b join store_orders o on o.id = b.order_id
  where o.reference = v_ref;
  if v_bookings <> 1 then
    raise exception 'concurrent finalize duplicated bookings: %', v_bookings;
  end if;

  if (select status from store_orders where reference = v_ref) <> 'paid' then
    raise exception 'winner order must be paid';
  end if;
end $$;

select 'store concurrency test passed' as result;
