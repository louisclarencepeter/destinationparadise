# Group and pickup rate setup

The new automatic-price flow is prepared locally. Monetary rates are not yet
approved or configured. Do not use the synthetic test prices as merchant prices.

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

## Business inputs

Complete this for **each excursion and each shared/private option**. Give total
USD prices for the group, not per-person prices. Clarify any exclusions or child
pricing before activating a combination; the current engine counts passengers
equally and has no child-rate rule.

| Passengers | Whole-group excursion total, USD |
| --- | --- |
| 1 | Awaiting merchant rate |
| 2 | Awaiting merchant rate |
| 3 | Awaiting merchant rate |
| 4 | Awaiting merchant rate |
| 5 | Awaiting merchant rate |
| 6 | Awaiting merchant rate |

| Pickup area | Supplement for one car, USD |
| --- | --- |
| Stone Town | Awaiting merchant rate; explicitly use 0 if included |
| North coast | Awaiting merchant rate |
| East coast | Awaiting merchant rate |
| South coast | Awaiting merchant rate |

Confirm the geographical coverage and whether the agreed supplement includes
return transport. Unclear locations should use the other/not-sure option and
receive a quote. No automatic upper-price threshold has been agreed; the current
quote rule is based on passengers, pickup eligibility and approved configuration.

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
