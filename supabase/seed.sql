-- Pilot catalog seed (HANDOFF.md Phase 2). Idempotent — safe to re-run.
--
-- Prices are USD cents and mirror the editorial display prices; capacities,
-- cutoffs and times are the Phase 1 placeholder rules and MUST be confirmed
-- with operations (Phase 0 / "Business decisions required before live
-- payment") before real checkout is enabled.

-- Experiences ---------------------------------------------------------------

insert into store_experiences (source_key, slug, code, title, meeting_point, location)
values
  ('safari-blue', 'safari-blue', 'SB', 'Safari Blue',
   'Hotel pickup from south-coast and Stone Town areas, 07:15–07:45.', 'Fumba, Zanzibar'),
  ('spice-tour', 'spice-tour', 'SP', 'Spice Tour',
   'Hotel pickup from Stone Town and west-coast areas, 30 minutes before start.', 'Spice belt, Zanzibar'),
  ('stone-town', 'stone-town', 'ST', 'Historical City Tour',
   'Meet at the Old Fort forecourt, or Stone Town hotel pickup on request.', 'Stone Town, Zanzibar')
on conflict (source_key) do update
  set title = excluded.title,
      meeting_point = excluded.meeting_point,
      location = excluded.location,
      updated_at = now();

-- Options (shared / private per experience) ---------------------------------

insert into store_experience_options
  (experience_id, code, name, booking_mode, capacity_mode, min_guests, max_guests, duration_minutes, booking_cutoff_minutes)
select e.id, v.code, v.name, 'instant', 'per_seat', 1, v.max_guests, v.duration_minutes, 1200
from store_experiences e
join (values
  ('safari-blue', 'shared',  'Shared group',  8,  480),
  ('safari-blue', 'private', 'Private group', 8,  480),
  ('spice-tour',  'shared',  'Shared group',  10, 240),
  ('spice-tour',  'private', 'Private group', 10, 240),
  ('stone-town',  'shared',  'Shared group',  8,  180),
  ('stone-town',  'private', 'Private group', 8,  180)
) as v(source_key, code, name, max_guests, duration_minutes)
  on v.source_key = e.source_key
on conflict (experience_id, code) do update
  set name = excluded.name,
      max_guests = excluded.max_guests,
      duration_minutes = excluded.duration_minutes,
      updated_at = now();

-- Prices (USD cents) --------------------------------------------------------

insert into store_option_prices (option_id, kind, amount_minor, currency)
select o.id, v.kind, v.amount_minor, 'USD'
from store_experience_options o
join store_experiences e on e.id = o.experience_id
join (values
  ('safari-blue', 'shared',  'per_person_adult',  9500),
  ('safari-blue', 'private', 'per_person_adult',  9500),
  ('safari-blue', 'private', 'party_supplement', 18000),
  ('spice-tour',  'shared',  'per_person_adult',  4500),
  ('spice-tour',  'private', 'per_person_adult',  4500),
  ('spice-tour',  'private', 'party_supplement',  9000),
  ('stone-town',  'shared',  'per_person_adult',  5500),
  ('stone-town',  'private', 'per_person_adult',  5500),
  ('stone-town',  'private', 'party_supplement',  7000)
) as v(source_key, option_code, kind, amount_minor)
  on v.source_key = e.source_key and v.option_code = o.code
on conflict (option_id, kind) do update
  set amount_minor = excluded.amount_minor;

-- Departure templates (times + capacity per physical slot) ------------------

insert into store_departure_templates (experience_id, local_time, capacity_total, duration_minutes)
select e.id, v.local_time, v.capacity_total, v.duration_minutes
from store_experiences e
join (values
  ('safari-blue', '08:30', 20, 480),
  ('safari-blue', '09:30', 20, 480),
  ('spice-tour',  '09:00', 16, 240),
  ('spice-tour',  '14:00', 16, 240),
  ('stone-town',  '09:30', 12, 180),
  ('stone-town',  '14:30', 12, 180),
  ('stone-town',  '16:30', 12, 180)
) as v(source_key, local_time, capacity_total, duration_minutes)
  on v.source_key = e.source_key
on conflict (experience_id, local_time) do update
  set capacity_total = excluded.capacity_total,
      duration_minutes = excluded.duration_minutes;

-- Generate the rolling departure window (next 60 days) ----------------------

select store_seed_departures(60);
