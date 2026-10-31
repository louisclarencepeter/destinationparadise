# Group and pickup rate setup

The new automatic-price flow is prepared locally. Rates were agreed on
31 October 2026 (below) and are not yet loaded into the store database. Do not
use the synthetic test prices as merchant prices.

The pilot products are Safari Blue (`safari-blue`), Spice Tour (`spice-tour`) and
Historical City Tour (`stone-town`). Each shared/private option has its own
whole-group totals for 1–6 passengers, plus a pickup supplement charged once per
car. The quoted total is the group price plus that supplement. The deposit is
20% of the combined total, rounded up once to a USD cent; the balance is the
exact remainder.

Groups of 7 or more, other/unknown pickup areas and duplicate selections for the
same excursion departure need a separate Book Now enquiry. Trips without
approved online rates can stay in Your trip, but payment
is blocked until the server confirms prices for every selection. The Store
does not automatically send these guests to Book Now.
Guests must choose an area and give their accommodation; Stone Town is never
assumed. Old saved carts keep their items and ask for missing pickup details
before a new payment. Existing orders retain their original amounts and plans.

## Agreed rates — 31 October 2026

Whole-group totals in USD for **each excursion and each shared/private option**,
not per-person prices. Shared options keep the published per-person prices
(USD 95, 45 and 25 per seat). Private options follow group-size discounts seen
in the market. Safari Blue private is Safari Blue Ltd's own charter rate (USD 550
for 2, plus USD 85 per extra guest) plus about 15%.

| Option | 1 | 2 | 3 | 4 | 5 | 6 |
| --- | --- | --- | --- | --- | --- | --- |
| Safari Blue, shared | 95 | 190 | 285 | 380 | 475 | 570 |
| Safari Blue, private | 640 | 640 | 740 | 840 | 940 | 1040 |
| Spice Tour, shared | 45 | 90 | 135 | 180 | 225 | 270 |
| Spice Tour, private | 90 | 130 | 165 | 200 | 235 | 270 |
| Historical City Tour, shared | 25 | 50 | 75 | 100 | 125 | 150 |
| Historical City Tour, private | 50 | 70 | 90 | 110 | 130 | 150 |

Pickup is charged once per car in USD, the same for shared and private. Each
charge covers the car to the start and back to the hotel. Stone Town pickup is
included (0) for all three; Safari Blue's other areas cost more because it leaves
from Fumba, beyond Stone Town.

| Excursion | Stone Town | North coast | East coast | South coast |
| --- | --- | --- | --- | --- |
| Safari Blue | 0 | 110 | 100 | 80 |
| Spice Tour | 0 | 80 | 80 | 70 |
| Historical City Tour | 0 | 80 | 80 | 70 |

For example, Safari Blue shared for 2 guests from the north coast is 190 + 110 =
USD 300: a USD 60 deposit online and USD 240 on the day.

Still open before activation:

- **Child pricing.** Not decided. The engine counts every passenger equally and
  has no child-rate rule, so online prices treat children as full guests.
  Safari Blue Ltd charges USD 45 for ages 6–14.
- **Coverage.** Confirm which locations each pickup area covers. Unclear
  locations should use the other/not-sure option and receive a quote.

No automatic upper-price threshold has been agreed; the current quote rule is
based on passengers, pickup eligibility and approved configuration.

These rates are not in the store database yet. A dry run of
[`supabase/load_group_pickup_rates.sql`](supabase/load_group_pickup_rates.sql)
with these amounts passed on a scratch database built from the migrations and
seed. It has not been run on the store database.

## Storage and activation

After explicit approval to deploy this scope, apply migrations in chronological
order, including `20260930160000_store_group_pickup_pricing.sql`. It creates empty
`store_option_group_prices` and `store_option_pickup_prices` tables. It does not
replace the legacy per-person price rows or rewrite existing order snapshots.

For an approved option, store integer **USD cents** in `amount_minor`, using its
existing `store_experience_options.id`. The group table key is `(option_id,
guests)`; the pickup key is `(option_id, zone_code)`. Pickup zone codes are
`stone-town`, `north`, `east`, `south`. Shared/private tables must each be populated
explicitly. A zero pickup row means included pickup; an absent or inactive row
means quote required. Inactive group rows also require a quote. Only service-role
operations can write these tables; guests cannot supply or change prices.

To load or change approved rates, use
[`supabase/load_group_pickup_rates.sql`](supabase/load_group_pickup_rates.sql) in
the Supabase SQL editor. Enter the amounts in US dollars and run it once as a dry
run, which saves nothing and lists what it would store. Then set `dry_run` to
false and run it again. It refuses incomplete, negative or sub-cent amounts and
flags a larger group costing less than a smaller one, or a private group costing
less than the shared one.

The public catalog exposes configured maps. Quote and checkout independently
check them again, and the order stores the exact group price, pickup amount,
hotel, zone and readable pickup summary. Staff and guest email amounts come from
the stored snapshot. A changed checkout amount must be reviewed before payment.

Approved rates alone do not approve inventory, dates, supplier capacity or
merchant/payment activation. Those remain separate launch checks in
`docs/pesapal-store-launch.md`.

## Local validation

Run the root test suite, lint, typecheck and store-enabled live-API build. In a
disposable database, apply all migrations and run
`supabase/group-pickup-pricing-regression.sql`; do not run its test inserts on the
merchant database. Existing financial suites should also cover deposits,
inventory locking, provider callbacks and historical payment replay.

Browser review should cover shared/private mode, 1–6 group tiers, each pickup
area, missing hotel/zone, 7+ and other-area enquiries, old-cart edits, stale rates,
sold-out departures, exact deposits, and EN/DE/PL desktop/mobile layout. The
general enquiry preserves exact passenger counts through 24 and keeps personal
details out of URLs. Its existing server message limit remains 8,000 characters;
an unusually large multi-trip message should be checked before sending.
