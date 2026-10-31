-- Load the approved group and pickup prices for the three online pilots
-- (STORE_GROUP_PICKUP_RATES.md). Run only on the approved store database, in
-- the Supabase SQL editor, after the rates are approved in writing.
--
-- 1. Replace every null below with the approved amount in US dollars, e.g.
--    135.00. Group amounts are the total for the whole group, not per person.
--    A pickup amount of 0.00 means pickup is included in that area.
-- 2. Run the complete file with dry_run true (the default). Nothing is saved:
--    the script stops with an error message listing exactly what it would
--    store, plus any amounts worth a second look.
-- 3. Check that list, set dry_run to false and run the complete file again.
--    The table at the end shows the saved prices.
--
-- The script refuses to save while any amount is missing, negative or has more
-- than two decimals, while any group amount is zero, and while any active
-- online pilot option would stay without prices. Running it again with changed amounts updates them in place.
-- Orders already placed keep the prices saved with them. Never use the
-- fictional amounts from group-pickup-pricing-regression.sql.

do $load$
declare
  dry_run constant boolean := true;
  v_problems text;
  v_summary text;
  v_warnings text;
begin
  set local search_path = public;
  set local lock_timeout = '5s';

  create temporary table dp_group_rates (
    source_key text, option_code text, guests int, amount_usd numeric
  ) on commit drop;
  insert into dp_group_rates values
    -- Safari Blue, shared group: whole-group total for 1 to 6 guests
    ('safari-blue', 'shared',  1, null),
    ('safari-blue', 'shared',  2, null),
    ('safari-blue', 'shared',  3, null),
    ('safari-blue', 'shared',  4, null),
    ('safari-blue', 'shared',  5, null),
    ('safari-blue', 'shared',  6, null),
    -- Safari Blue, private group
    ('safari-blue', 'private', 1, null),
    ('safari-blue', 'private', 2, null),
    ('safari-blue', 'private', 3, null),
    ('safari-blue', 'private', 4, null),
    ('safari-blue', 'private', 5, null),
    ('safari-blue', 'private', 6, null),
    -- Spice Tour, shared group
    ('spice-tour',  'shared',  1, null),
    ('spice-tour',  'shared',  2, null),
    ('spice-tour',  'shared',  3, null),
    ('spice-tour',  'shared',  4, null),
    ('spice-tour',  'shared',  5, null),
    ('spice-tour',  'shared',  6, null),
    -- Spice Tour, private group
    ('spice-tour',  'private', 1, null),
    ('spice-tour',  'private', 2, null),
    ('spice-tour',  'private', 3, null),
    ('spice-tour',  'private', 4, null),
    ('spice-tour',  'private', 5, null),
    ('spice-tour',  'private', 6, null),
    -- Historical City Tour, shared group
    ('stone-town',  'shared',  1, null),
    ('stone-town',  'shared',  2, null),
    ('stone-town',  'shared',  3, null),
    ('stone-town',  'shared',  4, null),
    ('stone-town',  'shared',  5, null),
    ('stone-town',  'shared',  6, null),
    -- Historical City Tour, private group
    ('stone-town',  'private', 1, null),
    ('stone-town',  'private', 2, null),
    ('stone-town',  'private', 3, null),
    ('stone-town',  'private', 4, null),
    ('stone-town',  'private', 5, null),
    ('stone-town',  'private', 6, null);

  create temporary table dp_pickup_rates (
    source_key text, option_code text, zone_code text, amount_usd numeric
  ) on commit drop;
  insert into dp_pickup_rates values
    -- Charge per car for each pickup area; 0.00 means pickup is included
    ('safari-blue', 'shared',  'stone-town', null),
    ('safari-blue', 'shared',  'north',      null),
    ('safari-blue', 'shared',  'east',       null),
    ('safari-blue', 'shared',  'south',      null),
    ('safari-blue', 'private', 'stone-town', null),
    ('safari-blue', 'private', 'north',      null),
    ('safari-blue', 'private', 'east',       null),
    ('safari-blue', 'private', 'south',      null),
    ('spice-tour',  'shared',  'stone-town', null),
    ('spice-tour',  'shared',  'north',      null),
    ('spice-tour',  'shared',  'east',       null),
    ('spice-tour',  'shared',  'south',      null),
    ('spice-tour',  'private', 'stone-town', null),
    ('spice-tour',  'private', 'north',      null),
    ('spice-tour',  'private', 'east',       null),
    ('spice-tour',  'private', 'south',      null),
    ('stone-town',  'shared',  'stone-town', null),
    ('stone-town',  'shared',  'north',      null),
    ('stone-town',  'shared',  'east',       null),
    ('stone-town',  'shared',  'south',      null),
    ('stone-town',  'private', 'stone-town', null),
    ('stone-town',  'private', 'north',      null),
    ('stone-town',  'private', 'east',       null),
    ('stone-town',  'private', 'south',      null);

  -- ---------------------------------------------------------------------------
  -- Nothing below needs editing.
  -- ---------------------------------------------------------------------------

  -- Every amount entered, as whole cents, and each option, guest count and
  -- area listed exactly once.
  select string_agg(problem, E'\n' order by problem) into v_problems from (
    select format('%s %s, group of %s: %s', source_key, option_code, guests,
      case when amount_usd is null then 'no amount entered'
           when amount_usd <= 0 then 'group amount must be above 0'
           else 'use at most two decimals' end) as problem
    from dp_group_rates
    where amount_usd is null or amount_usd <= 0 or amount_usd <> round(amount_usd, 2)
    union all
    select format('%s %s, pickup %s: %s', source_key, option_code, zone_code,
      case when amount_usd is null then 'no amount entered'
           when amount_usd < 0 then 'pickup amount cannot be negative'
           else 'use at most two decimals' end)
    from dp_pickup_rates
    where amount_usd is null or amount_usd < 0 or amount_usd <> round(amount_usd, 2)
    union all
    select format('%s %s, group of %s: listed %s times', source_key, option_code, guests, count(*))
    from dp_group_rates group by source_key, option_code, guests having count(*) > 1
    union all
    select format('%s %s, pickup %s: listed %s times', source_key, option_code, zone_code, count(*))
    from dp_pickup_rates group by source_key, option_code, zone_code having count(*) > 1
    union all
    select format('%s %s, group of %s: guests must be 1 to 6', source_key, option_code, guests)
    from dp_group_rates where guests is null or guests not between 1 and 6
    union all
    select format('%s %s, pickup %s: area must be stone-town, north, east or south',
      source_key, option_code, zone_code)
    from dp_pickup_rates where zone_code is null or zone_code not in ('stone-town', 'north', 'east', 'south')
    union all
    -- Listed options must exist and sell in US dollars.
    select format('%s %s: no active option with that code', r.source_key, r.option_code)
    from (select source_key, option_code from dp_group_rates
          union select source_key, option_code from dp_pickup_rates) r
    where not exists (
      select 1 from store_experience_options o
      join store_experiences e on e.id = o.experience_id
      where e.source_key = r.source_key and o.code = r.option_code and o.active)
    union all
    select format('%s %s: option sells in %s, these amounts are USD', e.source_key, o.code, o.currency)
    from store_experience_options o join store_experiences e on e.id = o.experience_id
    where o.active and o.currency <> 'USD'
      and (e.source_key, o.code) in (select source_key, option_code from dp_group_rates)
    union all
    -- Every online pilot option gets all six group totals and four areas.
    select format('%s %s: needs all six group amounts and all four pickup areas', e.source_key, o.code)
    from store_experience_options o join store_experiences e on e.id = o.experience_id
    where e.source_key in ('safari-blue', 'spice-tour', 'stone-town')
      and e.status = 'active' and o.active and o.booking_mode = 'instant'
      and ((select count(distinct guests) from dp_group_rates g
            where g.source_key = e.source_key and g.option_code = o.code and g.guests between 1 and 6) <> 6
        or (select count(distinct zone_code) from dp_pickup_rates p
            where p.source_key = e.source_key and p.option_code = o.code
              and p.zone_code in ('stone-town', 'north', 'east', 'south')) <> 4)
  ) problems;

  if v_problems is not null then
    raise exception E'Nothing was saved. Fix these first:\n%', v_problems;
  end if;

  -- Prices worth a second look: a larger group costing less in total than a
  -- smaller one, or a private group costing less than the shared one.
  select string_agg(warning, E'\n' order by warning) into v_warnings from (
    select format('%s %s: %s guests (%s) cost less than %s guests (%s)',
      a.source_key, a.option_code, b.guests, b.amount_usd, a.guests, a.amount_usd) as warning
    from dp_group_rates a join dp_group_rates b
      on b.source_key = a.source_key and b.option_code = a.option_code and b.guests = a.guests + 1
    where b.amount_usd < a.amount_usd
    union all
    select format('%s, %s guests: private (%s) costs less than shared (%s)',
      p.source_key, p.guests, p.amount_usd, s.amount_usd)
    from dp_group_rates p join dp_group_rates s
      on s.source_key = p.source_key and s.guests = p.guests
      and p.option_code = 'private' and s.option_code = 'shared'
    where p.amount_usd < s.amount_usd
  ) warnings;

  lock table store_option_group_prices, store_option_pickup_prices in share row exclusive mode;

  insert into store_option_group_prices (option_id, guests, amount_minor, currency, active)
  select o.id, r.guests, (r.amount_usd * 100)::bigint, 'USD', true
  from dp_group_rates r
  join store_experiences e on e.source_key = r.source_key
  join store_experience_options o on o.experience_id = e.id and o.code = r.option_code
  on conflict (option_id, guests) do update
    set amount_minor = excluded.amount_minor, currency = excluded.currency,
        active = true, updated_at = now()
    where (store_option_group_prices.amount_minor, store_option_group_prices.currency,
           store_option_group_prices.active)
      is distinct from (excluded.amount_minor, excluded.currency, true);

  insert into store_option_pickup_prices (option_id, zone_code, amount_minor, currency, active)
  select o.id, r.zone_code, (r.amount_usd * 100)::bigint, 'USD', true
  from dp_pickup_rates r
  join store_experiences e on e.source_key = r.source_key
  join store_experience_options o on o.experience_id = e.id and o.code = r.option_code
  on conflict (option_id, zone_code) do update
    set amount_minor = excluded.amount_minor, currency = excluded.currency,
        active = true, updated_at = now()
    where (store_option_pickup_prices.amount_minor, store_option_pickup_prices.currency,
           store_option_pickup_prices.active)
      is distinct from (excluded.amount_minor, excluded.currency, true);

  if dry_run then
    select string_agg(line, E'\n' order by line) into v_summary from (
      select format('%s %s | group 1-6: %s | pickup: %s',
        g.source_key, g.option_code,
        (select string_agg(to_char(amount_usd, 'FM999990.00'), ', ' order by guests)
          from dp_group_rates where source_key = g.source_key and option_code = g.option_code),
        (select string_agg(zone_code || ' ' || to_char(amount_usd, 'FM999990.00'), ', '
            order by array_position(array['stone-town', 'north', 'east', 'south'], zone_code))
          from dp_pickup_rates where source_key = g.source_key and option_code = g.option_code)) as line
      from (select distinct source_key, option_code from dp_group_rates) g
    ) lines;
    raise exception E'Dry run: nothing was saved. Would store (USD):\n%\n%',
      v_summary,
      coalesce(E'\nCheck these before saving:\n' || v_warnings, E'\nNo amounts flagged.')
      using hint = 'If this is right, set dry_run to false and run the whole file again.';
  end if;

  if v_warnings is not null then
    raise notice E'Saved. Amounts worth a second look:\n%', v_warnings;
  end if;
end
$load$;

-- Saved prices in USD: whole-group totals by guest count, then the per-car
-- pickup charge by area. An empty cell means that combination has no price.
select e.title as trip, o.code as option,
  (max(g.amount_minor) filter (where g.guests = 1) / 100.0)::numeric(12, 2) as "1 guest",
  (max(g.amount_minor) filter (where g.guests = 2) / 100.0)::numeric(12, 2) as "2 guests",
  (max(g.amount_minor) filter (where g.guests = 3) / 100.0)::numeric(12, 2) as "3 guests",
  (max(g.amount_minor) filter (where g.guests = 4) / 100.0)::numeric(12, 2) as "4 guests",
  (max(g.amount_minor) filter (where g.guests = 5) / 100.0)::numeric(12, 2) as "5 guests",
  (max(g.amount_minor) filter (where g.guests = 6) / 100.0)::numeric(12, 2) as "6 guests",
  (select (amount_minor / 100.0)::numeric(12, 2) from store_option_pickup_prices
    where option_id = o.id and zone_code = 'stone-town' and active) as "pickup Stone Town",
  (select (amount_minor / 100.0)::numeric(12, 2) from store_option_pickup_prices
    where option_id = o.id and zone_code = 'north' and active) as "pickup North",
  (select (amount_minor / 100.0)::numeric(12, 2) from store_option_pickup_prices
    where option_id = o.id and zone_code = 'east' and active) as "pickup East",
  (select (amount_minor / 100.0)::numeric(12, 2) from store_option_pickup_prices
    where option_id = o.id and zone_code = 'south' and active) as "pickup South"
from store_experience_options o
join store_experiences e on e.id = o.experience_id
left join store_option_group_prices g on g.option_id = o.id and g.active
where e.source_key in ('safari-blue', 'spice-tour', 'stone-town') and o.active
group by e.title, e.source_key, o.id, o.code
order by e.source_key, o.code;
