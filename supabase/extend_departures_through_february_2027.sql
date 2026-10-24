-- Run only on the approved store database after reviewing its live templates.
-- Extend configured daily schedules through 28 February 2027. This does not
-- approve supplier inventory, configure prices, or create request-only times.
-- Existing departures (including closed/cancelled ones) are never rewritten.
-- Safe to repeat. At/past the end date the generator is NOT called, because
-- store_seed_departures otherwise forces at least one day for a zero horizon.
-- Run the complete file. On any error, ROLLBACK before retrying in the editor.

begin;
set local timezone = 'Africa/Dar_es_Salaam';
set local search_path = public, extensions;
set local lock_timeout = '5s';
set local statement_timeout = '120s';

-- Hold only departure writes during the short extension/preservation check.
-- Checkout/payment tables remain available; no settings are refreshed.
lock table store_departures in share row exclusive mode;

create temporary table dp_departure_extension_run on commit drop as
select current_date as start_date, date '2027-02-28' as end_date,
  0::integer as created_departures;

create temporary table dp_departure_extension_original on commit drop as
select id, to_jsonb(d) as snapshot from store_departures d;

-- Match the existing generator exactly: active templates/experiences, daily,
-- current capacity/duration and the minimum active-option cutoff (or 1200).
-- Retain expected values only to check newly inserted rows, not to change old
-- rows when operations previously closed them or adjusted their inventory.
create temporary table dp_departure_extension_expected on commit drop as
select t.experience_id,
  current_date + day_offset as local_date,
  t.local_time, t.capacity_total,
  ((current_date + day_offset) || ' ' || t.local_time)::timestamp
    at time zone e.timezone as starts_at,
  (((current_date + day_offset) || ' ' || t.local_time)::timestamp
    at time zone e.timezone) + make_interval(mins => t.duration_minutes) as ends_at,
  (((current_date + day_offset) || ' ' || t.local_time)::timestamp
    at time zone e.timezone) - make_interval(mins => coalesce(o.cutoff_minutes, 1200))
    as booking_cutoff_at
from store_departure_templates t
join store_experiences e on e.id = t.experience_id and e.status = 'active'
join lateral (
  select min(booking_cutoff_minutes) as cutoff_minutes
  from store_experience_options where experience_id = t.experience_id and active
) o on true
cross join generate_series(1, greatest(date '2027-02-28' - current_date, 0)) day_offset
where t.active;

do $extend$
declare v_days integer; v_created integer := 0;
begin
  select end_date - start_date into v_days from dp_departure_extension_run;

  -- Do not create a second wall-clock slot if an existing manual row has an
  -- inconsistent starts_at. Resolve that existing data separately, preserving it.
  if exists (
    select 1 from dp_departure_extension_expected x
    join store_departures d on d.experience_id = x.experience_id
      and d.local_date = x.local_date and d.local_time = x.local_time
    where d.starts_at <> x.starts_at
  ) then
    raise exception 'STOP: an existing wall-clock slot has a different starts_at';
  end if;

  if v_days > 0 then
    v_created := store_seed_departures(v_days);
    update dp_departure_extension_run set created_departures = v_created;
  end if;
  raise notice 'Departure extension through 2027-02-28: % new rows (horizon % days)',
    v_created, v_days;
end;
$extend$;

do $verify$
begin
  if exists (
    select 1 from dp_departure_extension_original b
    left join store_departures d on d.id = b.id
    where d.id is null or to_jsonb(d) is distinct from b.snapshot
  ) then
    raise exception 'STOP: a pre-existing departure changed; rolling back';
  end if;

  if exists (
    select 1 from dp_departure_extension_expected x
    left join store_departures d on d.experience_id = x.experience_id
      and d.starts_at = x.starts_at
    where d.id is null
  ) then
    raise exception 'STOP: a configured departure slot is missing; rolling back';
  end if;

  if exists (
    select 1 from store_departures d
    left join dp_departure_extension_original b on b.id = d.id
    left join dp_departure_extension_expected x on x.experience_id = d.experience_id
      and x.starts_at = d.starts_at
    where b.id is null and (
      x.experience_id is null or d.status <> 'scheduled'
      or d.local_date is distinct from x.local_date
      or d.local_time is distinct from x.local_time
      or d.capacity_total is distinct from x.capacity_total
      or d.ends_at is distinct from x.ends_at
      or d.booking_cutoff_at is distinct from x.booking_cutoff_at
      or d.supplier_ref is not null
    )
  ) then
    raise exception 'STOP: a new departure differs from its template; rolling back';
  end if;

  if (select count(*) from store_departures d
      left join dp_departure_extension_original b on b.id = d.id where b.id is null)
     <> (select created_departures from dp_departure_extension_run) then
    raise exception 'STOP: generator count differs from inserted rows; rolling back';
  end if;

end;
$verify$;

commit;

-- The SQL editor shows this final result. Insertion count is in the NOTICE.
select jsonb_build_object(
  'endDate', '2027-02-28',
  'timezone', 'Africa/Dar_es_Salaam',
  'status', 'verified',
  'preexistingDeparturesUnchanged', true,
  'scope', 'departure inserts from existing daily templates only',
  'allExpectedSlotsPresent', true
) as departure_extension_result;
