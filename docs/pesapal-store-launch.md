# Pesapal store launch

Updated 30 September 2026. The approved payment changes are deployed to the
`development` staging site for Pesapal sandbox testing. Production remains
disabled; staging approval does not authorize a production release.

## Agreed payment model

- New store bookings collect a **20% deposit** online; the **80% balance is due
  on the day**. The full trip price remains the order total.
- Round the deposit up to the next minor unit (`ceil(totalMinor / 5)`). The
  balance is the exact full price minus that deposit.
- The payment attempt stores the amount actually charged, independently of
  the full trip price. Verification compares that deposit, currency, and order
  reference with Pesapal's server response.
- Public order and receipt data distinguish `deposit_paid` from a fully paid
  order. Internal `paid` means the required checkout payment was settled and
  bookings finalized; it does not remove the remaining balance.
- Existing full-payment and DPO attempts keep their original amounts/provider.
- Historical request orders still wait for staff availability and a quote
  before any payment. The accepted quote retains its stored payment plan.

## Prepared shopping-flow correction — 1 October 2026

The local Store changes keep online departures in a shopping cart: select
guests, pickup details, date/time, add one or several trips, continue shopping,
then pay one combined 20% deposit in the embedded Pesapal checkout. Book Now
remains the separate enquiry/payment-link flow. Enquiry-only products no longer
enter new Store carts; older cart rows remain visible, without being paid or
silently removed. Missing online prices keep the trip in the cart and disable
payment rather than redirecting checkout to Book Now.

After the user's approval, the store inventory was extended on 1 October 2026
through 28 February 2027: 1,050 departures were added across the seven existing
daily times, and the transaction verified that all pre-existing rows remained
unchanged. An independent query confirmed 300 Safari Blue, 300 Spice Tour and
450 Stone Town departures in the extended range. The frontend calendar change
is prepared locally through the same final date.
The live group and pickup rate tables remain empty across all six pilot
options, so real payments still require the approved amounts in
[the rate worksheet](../STORE_GROUP_PICKUP_RATES.md). These shopping changes are
local pending review; this section does not record a frontend deployment.
Use [the operations guide](store-ops.md) for the reviewed date script.

## Verified external state

The signed-in Pesapal dashboard for **Destination Paradise Ltd**, Tanzania,
`info@yournexttriptoparadise.com`, showed business verification, beneficiary
setup, and received payments completed (3 of 4 onboarding steps). Withdrawal
completion is a separate step and was not performed during this work.

Existing consumer key and secret are present in **Account Settings → Developer
Settings**. No secret is copied into source, logs, or this document. The only
live registered IPN inspected was Pesapal's invoicing listener. A separate
sandbox store listener is now registered for the staging callback; it does not
change the live invoicing listener or configure production payments.

Supabase project `destination-paradise-store` (`hskhpsdociwikywfnsvf`, Louis Dev,
eu-central-1) was paused, with data retained. It was restored through the
authenticated dashboard. Staging catalog and availability APIs now return HTTP
200. The catalog contains all six instant/request experiences, but the checked
Safari Blue, Spice Tour, and Stone Town windows (1 October–29 November 2026)
contain **no departures**. Operational inventory must be refreshed and approved
before selling those dates.

Production Netlify had no store, database, or Pesapal variables. Branch/deploy
preview contexts had store flags, Supabase credentials, and simulated payment.
An enabled frontend alone cannot establish working payments.

## Local validation

- Store-off production build: 124/124 routes prerendered.
- Store-enabled live-mode build: 125/125 routes prerendered, including `/store`.
- Lint and typecheck passed; all 320 repository tests passed against the
  current lockfile.
- Fresh local PostgreSQL 18: all five migrations, existing smoke tests, deposit
  and provider regressions, four real concurrent races, and migration
  reapplication passed. The scratch database was stopped afterward.
- In-app browser: catalog → date/time → cart → checkout → simulated deposit
  confirmation. A USD 90 trip showed USD 18 deposit and USD 72 balance.
  Desktop/mobile, EN/DE/PL, reduced motion, and private-page analytics checked.
  The request flow also reached awaiting availability without payment. Cached
  live confirmations refresh authoritative status, transient polling recovers,
  and existing pending payments can resume without creating another order.
- Provider-driven email delivery has **not** been tested. Prepared email tests
  use a mocked sender; no customer/team messages were sent. Real staging
  deployment and provider/database progress are recorded separately below.

## Approved staging deployment — 30 September 2026

- Approved scope: the prepared Pesapal/deposit changes on `development`, for
  sandbox testing only. Commit `a1fba25049c272e6aa58d3cb97228927f809845f`.
- Staging URL: <https://development--destinationparadisezanzibar.netlify.app>.
  Deployment `6abcb05e2ab645165aacb796` is ready. It rebuilds the same commit
  after establishing an explicitly blank, development-branch-only
  `RESEND_API_KEY` override. Fake payments are explicitly disabled there.
- Functions use the official public Tanzania demo credentials and
  `PESAPAL_ENVIRONMENT=sandbox`. Sandbox notification ID
  `5a0a9dad-f5d9-4769-9933-d9d7f6f0067e` points to the staging
  `/api/payments/pesapal/ipn`. No live credentials were copied from the merchant
  dashboard. New payment variables are scoped to Functions and development.
- Migration `20260930090000` was applied transactionally and recorded in
  Supabase migration history. Existing orders (3), attempts (3), holds (3),
  bookings (3), and notification rows (9) retained their previous fingerprints.
  All 13 expected RPC signatures, eight new column shapes, unique provider
  token index, RLS and service-role permissions passed postflight checks.
  Existing orders/attempts remain full-payment DPO records.
- Catalog returns HTTP 200. Unauthorized order reads return 404 with
  `no-store` and `no-referrer`; invalid IPNs return 400; an empty provider
  return safely redirects to `/store`. Simulated payment is unavailable.
- Isolated synthetic order `DP-2026-343480`: USD 250.01 full price,
  USD 50.01 deposit, USD 200.00 balance. Its catalog option is inactive and its
  departure is closed in the same transaction that created the order; it was
  never publicly bookable. No existing inventory was changed. The staging
  order page offers the exact USD 50.01 deposit and Pesapal's sandbox card
  form confirms that amount. Final submission is pending the user's acceptance
  of Pesapal's terms. Only official sandbox card data was entered.
  Before submission, a direct provider status check returned HTTP 200 with
  embedded status 500, code 0 and `payment_details_not_found`, while reporting
  USD 50.01 and the matching merchant reference. The store IPN returned 500 for
  retry and retained an unknown attempt/pending order, active hold, zero bookings
  and zero notifications. This is unpaid-state evidence, not a successful
  settlement check; the paid callback still needs to pass after submission.
- GitHub CI [run 36679323054](https://github.com/louisclarencepeter/destinationparadise/actions/runs/36679323054)
  failed before website checks at Expo's mobile dependency compatibility gate:
  `expo`57.0.25→57.0.26, `expo-constants`57.0.19→57.0.20,
  `expo-router`57.0.23→57.0.24. The mobile lockfile and CI workflow are unchanged
  from the previous passing commit. A focused correction is being prepared
  locally and passes Expo compatibility, content snapshot, typecheck, 91 mobile
  tests, and iOS/Android/web exports on Node22.23.3. The three direct updates
  require only `@expo/ui`57.0.21 and `expo-modules-core`57.0.20 transitive patches.
  It requires approval before staging deployment; no device runtime check is
  claimed.
- Production published deploy remains `6aaba506a3afed000851cd80`, commit
  `680ba9a697152762ea8aaf8ba8dc550e5eef09ab`, branch `main`. No production
  release or store activation has been performed.

Additional production gate: Netlify does not guarantee the build-only
`CONTEXT` variable inside Functions. A focused correction is prepared locally:
`STORE_RUNTIME_ENVIRONMENT=staging` or `development` explicitly permits test
modes; absent, unknown, or production values block sandbox/fake payments and
HTTP localhost callbacks. Live Pesapal and existing DPO behavior remain under
their current credentials/provider controls. Targeted store tests, lint and
typecheck pass; the full root suite also passes all 343 tests. This hardening is
outside the already approved staging commit
and needs approval before staging deployment or production activation.

Do not run the notification outbox during sandbox tests. Suppress only the
isolated QA order's queued messages after terminal settlement, preserving the
records and marking them undelivered. Failed suppressed QA rows remain visible
to health counts and must be documented before enabling production monitoring.

Saved mail credentials need verification before any future production build.
The first Netlify CLI command attempting an empty development mail key reused
the existing context values instead of creating a branch override. Those
values are masked secrets, and the public API does not document whether
roundtripping them preserves their underlying credentials. Unchanged value
IDs and suffixes do not prove integrity. The staging override was corrected
through `setEnvVarValue` and verified empty; production's current deployed
functions retain their existing deployment-time environment. Do not claim the
saved production mail key was verified or deploy production until it is.

Before applying the new unique index to an existing database, audit duplicate
nonnull `(provider, provider_token)` values. Do not remove records to force the
migration through; resolve any duplicate against its actual provider payment.

The local checkout also contains unrelated pre-existing Threads changes.
`development` is ahead of `main` in dependency/mobile updates. Scope the release
diff explicitly; do not include those changes under payment launch approval.

## Embedded checkout approved for development — 30 September 2026

Pesapal checkout now opens inside the private `/store/order/:reference` page.
The guest sees the full trip price, 20% deposit and remaining balance above the
provider form. Card and mobile-money details still go directly to Pesapal.
The API3 `TOP_WINDOW` return remains in place: its server callback verifies
payment before the authenticated order page can confirm a booking.

Checkout, staff-quote acceptance and pending-order continuation use the same
validated provider handoff. Provider URLs are removed from navigation history
and kept out of browser order caches; continuation reuses the existing order.
Historical DPO redirects, full-payment records and request-to-book behavior
remain supported. Loading, reload, manual status checks and an explicit
same-tab fallback are available in EN/DE/PL. Failed status checks retain the
form; a slower manual response cannot overwrite a newer terminal poll result.

The frame uses a compact viewport height (420–520px desktop, 420–560px mobile)
instead of reserving 1000–1600px for every method. Longer card forms scroll inside
the same iframe; a translated hint explains this. Local 1293×925 and 390×844
checks confirmed the shorter mobile-money form no longer leaves a screen of
blank space, and card fields, unaccepted terms and Proceed remain reachable by
keyboard without reloading the form. The focused payment-frame and locale
checks pass (36 tests), along with lint and typecheck after this layout fix.

Local verification used synthetic API responses on loopback, with the existing
Pesapal sandbox form embedded for rendering checks. This did not create another
remote order or submit a card payment. The sandbox card option displays exactly
USD 50.01; the local page displays USD 250.01 total and USD 200.00 balance.
Desktop 1280×720 and mobile 390×844 checks covered provider controls, keyboard
focus, no horizontal overflow, status-check recovery without resetting the form,
reload/resume, quote acceptance, changed-price review without payment, request
confirmation without payment, terminal-state form removal and reduced motion.
The mobile heading clears the fixed navigation. Both light and dark shells and
all three languages rendered correctly; private-page tracking scripts stayed
absent. Paid/review UI checks used simulated server snapshots and do not establish
a completed provider payment or delivered confirmation email.

Lint, typecheck and all 373 root tests pass, including 14 payment-frame tests and
deterministic stale-status regressions. The store-enabled live-API build passes
and prerenders 125/125 routes. The earlier mobile compatibility checks still apply
to its unchanged two-file patch; no device runtime or Safari/issuer challenge
check is claimed. Pesapal's sandbox logged a legacy-script TypeError and a
CardinalCommerce exception while the payment form remained usable. Provider
settlement and actual bank authentication require an HTTPS staging test.

The user approved publishing this update to the public development test site
on 30 September 2026, with a pull request to main deferred until their testing.
The approved staging scope includes embedded checkout, the explicit Functions runtime guard, the
previously prepared Expo compatibility patch, the policy/copy updates below
and these launch notes. Before an
approved staging deployment, set Functions-scoped
`STORE_RUNTIME_ENVIRONMENT=staging` on the development branch and retain its
empty mail-key override. Production merchant credentials, inventory, verified
payment settlement and the saved mail-key verification remain separate gates.

## Policy and booking-copy update — approved for development

Privacy, Terms of Service, Booking Policy and Cookies now describe the embedded
Pesapal checkout in English, German and Polish. They name the payment and booking
database providers, explain the booking/contact data shared to create a payment,
distinguish provider-entered card/mobile-money credentials from stored transaction
records, and link to Pesapal's Tanzania privacy policy and payment terms. The
cookie policy explains that our analytics preference does not control Pesapal's
or a bank's cookies and processing.

The new-store payment terms describe the combined 20% deposit, exact balance,
on-day collection before each experience, USD pricing and possible provider/bank
conversion, availability holds, server-verified confirmation and staff-arranged
refunds. Existing agreed full-payment plans and enquiry safari payment terms
remain supported. The checkout links to privacy alongside its existing terms
and booking-policy acknowledgement, and shows the currency notice even when the
website currency is USD.

The user confirmed Zanzibar cancellation charges: free more than 48 hours before,
50% from 24–48 hours and 100% below 24 hours or no-show, calculated on the full
cancelled booking price. The deposit is credited against that charge; an unpaid
part can remain due. Committed supplier costs are included in those percentages,
with no additional supplier-cost deduction. Excursion pages and their fallback
copy now match the policy. Safari/custom cancellation provisions retain the
agreed terms outside those Zanzibar rules.

Store hero, search, cart and accepted-quote text now describe a deposit and on-day
balance; historical full-payment quote text remains conditional. General enquiry
copy now refers specifically to that enquiry form when explaining card collection.
The Polish navigation subtitle says one order instead of one payment.

Validation: final lint and typecheck pass; the full 373-test root suite passed,
followed by 46 focused payment-frame and localization tests after the final copy
and checkout changes. The store-enabled live-API build prerenders 125/125 routes.
Local in-app browser checks covered checkout policy links, excursion cancellation
copy, EN/DE/PL policy text, provider-link destinations, preserved cancellation
tables, reveal behavior, 1280×720 and 390×844 layouts, and mobile table scrolling.
The local policy/checkout tab had no captured console warnings/errors or error
overlay. No payment, provider agreement acceptance, email or deployment occurred.

Official provider references checked for these disclosures:

- [Pesapal Tanzania Privacy Policy](https://www.pesapal.com/tz/privacy-policy)
- [Pesapal Tanzania Terms and Conditions](https://www.pesapal.com/tz/terms-and-conditions)
- [SubmitOrderRequest](https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/submitorderrequest)
- [GetTransactionStatus](https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/gettransactionstatus)
- [Refund Request](https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/refund-request)
- [Pesapal Tanzania personal FAQs](https://www.pesapal.com/tz/personal/faqs)

## Group-size and pickup pricing — approved for development, awaiting rates

The store now asks for the guest count, shared/private option, pickup area and
hotel/accommodation. Approved 1–6 passenger selections show the whole-group
experience price, one pickup charge per car, total, effective per-person price,
20% deposit and exact balance. Groups of 7 or more, unknown areas and missing
rate combinations open a localized, prefilled quote enquiry without payment.
The guest count remains exact through 24; existing 6+/10+ enquiry choices remain.

All three instant pilots use the new pricing engine: Safari Blue, Spice Tour and
Historical City Tour. Existing starting prices remain indicative and are marked
as such; they never supply a missing configured online rate. Pilot capacity and
pickup wording now agrees with the six-passenger online rule in EN/DE/PL, source
fallbacks and featured cards. Policy text explains the combined transport total
and revised-quote handling. Other excursions retain their existing group facts.

Migration `20260930160000_store_group_pickup_pricing.sql` creates empty approved
group/pickup rate tables. No merchant prices have been invented or seeded. See
[the rate setup worksheet](../STORE_GROUP_PICKUP_RATES.md) for the six group totals
and four per-car area supplements needed for each excursion and shared/private
option. Rate population, supplier inventory and merchant activation remain
separate approved launch operations.

Quote and checkout enforce hotel/area requirements, complete configured rates,
the passenger limit and duplicate-departure review. Splitting one group across
two cart lines cannot bypass the rule or charge pickup twice. The server saves
the group and pickup breakdown with the order; confirmations and emails use that
snapshot. Changed-rate review retains the breakdown. Unavailable departures
cannot display an enabled zero-deposit payment action. Old version-one carts
survive and prompt for missing details; existing paid/pending orders retain their
original prices, deposits and provider handoffs.

Fresh and populated local PostgreSQL validation passed 11 pricing regression
groups, including integer-cent bounds, combined-cart bounds, a rate edit during
checkout with full rollback, no-write quote cases, permissions, deposit rounding
and snapshot finalization. Existing financial/concurrency suites passed before
the migration and afterwards with nonpilot aliases for old fixtures that
intentionally contain newly prohibited oversized/duplicate pilot selections.
All 11 existing table fingerprints remained unchanged on migration/reapplication;
a historical eight-person pending Pesapal order replayed its original amount
and payment URL. No remote database changes or rate inserts were performed.

Local browser checks use an explicitly synthetic, disposable API for priced
states, and leave rates unconfigured for the review preview. The provider,
database and mail APIs are not called by that test server. Real merchant rates,
transport coverage, production inventory and bank/provider settlement still
require verification before activation.

Final validation for the prepared bundle: 501 root tests, lint and typecheck
pass; the store-enabled live-API build prerenders 125/125 routes. Mobile content
sync/check, typecheck and all 91 mobile tests pass. Its generated content changes
only two provenance hashes, with destination, guide, event, season, media and
link records preserved. Browser checks cover approved synthetic price/deposit
breakdowns, cart pickup details, sold-out payment blocking, a partial-email
quote handoff, exact seven-passenger enquiries, EN/DE/PL desktop/phone layouts
and reduced-motion reveals. No captured app warnings/errors or horizontal
overflow occurred on the checked pickup pages. Tests do not establish real
merchant settlement or mail delivery. The inherited Safari Blue private
starting-price copy (USD 640) also remains indicative and should be reviewed
alongside the actual merchant rate schedule.

## Development release preparation — 30 September 2026

The public test target is
<https://development--destinationparadisezanzibar.netlify.app>. The user's
approval covers this development deployment; a main pull request follows their
testing. Unrelated local Threads changes remain excluded from the release.

Functions-scoped `STORE_RUNTIME_ENVIRONMENT=staging` was configured specifically
for the development branch. Its explicitly empty mail-key override is retained;
Pesapal remains in sandbox and simulated payments remain disabled. The approved
pricing migration must be verified before publishing the new booking interface.
It creates empty rate tables and preserves existing booking and payment data.

A fresh CI dependency audit found newly reported issues in existing build tools.
The release also applies narrow patch corrections: the existing brace-expansion
override moves from 5.0.9 to 5.0.12 and fast-uri from 3.1.7 to 3.1.8. Existing
audit, lint, test and mobile compatibility gates remain enabled.

This section records preparation, not a completed deployment. Verify the exact
published development commit, passing CI, catalog pricing metadata and public
browser behavior before handing the test URL to the user. Approved merchant
rates and operational departures are still required for new payment bookings.

## Environment setup

Keep sandbox and live configurations separate. Configure credentials through
the provider's secure settings UI. Never prefix a secret with `VITE_`.

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Restored store project URL |
| `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_SECRET_KEY`) | Functions-only database access |
| `STORE_API_ENABLED=true` | Enable store functions |
| `STORE_RUNTIME_ENVIRONMENT=staging` or `production` | Functions-scoped runtime guard; explicit staging/development is required for test modes |
| `STORE_PAYMENT_PROVIDER=pesapal` | Select Pesapal for new attempts |
| `PESAPAL_ENABLED=true` | Enable hosted Pesapal payments |
| `PESAPAL_ENVIRONMENT=sandbox` or `live` | Explicit provider environment |
| `PESAPAL_CONSUMER_KEY` | Credentials for that provider environment |
| `PESAPAL_CONSUMER_SECRET` | Functions-only credential |
| `PESAPAL_IPN_ID` | Registered store IPN listener ID for that environment |
| `STORE_PUBLIC_ORIGIN` | Exact HTTPS staging or production origin |
| `STORE_DEV_FAKE_PAYMENT=false` | Never simulate a production payment |
| `VITE_STORE_ENABLED=true` | Build public store/navigation/sitemap |
| `VITE_STORE_API=live` | Use the real catalog, prices, and checkout |
| `RESEND_API_KEY` | Existing notification outbox sender |

Apply every committed `supabase/migrations/*.sql` in chronological order; retain
the historical migrations. Use the seed only after confirming its operational
data: pilot prices, capacity, cutoffs, pickup instructions, and departure times
are explicitly marked as placeholders. Do not replace real catalog values with
the seed or enable unconfirmed inventory. Extend approved departures with
`store_seed_departures(60)` as appropriate.

The planned store IPN path is `/api/payments/pesapal/ipn`, and the browser return
path is `/api/payments/pesapal/return`. Register the HTTPS IPN URL using
Pesapal's RegisterIPNURL endpoint and configure its returned ID in the same
environment. Verify these paths against the function route exports before
registration. Do not reuse the invoicing listener's ID.

## Required journey checks before production activation

1. Catalog and availability return approved, current departures; quotes match
   displayed prices. No fixture data may authorize a live charge.
2. A sandbox checkout sends exactly the displayed 20% deposit to Pesapal and
   shows the full price plus remaining balance throughout the journey.
3. Replay successful, failed, cancelled, delayed, and duplicate IPN/return
   events. Callback parameters trigger server verification only; they never
   establish payment success.
4. Reference, amount, and currency mismatches go to review and never issue
   bookings. Late payments cannot oversell capacity after holds expire.
5. Repeated/concurrent pay requests reuse the stored checkout; an ambiguous
   provider timeout cannot create another charge silently.
6. Confirm receipt/team emails, remaining balance, booking codes, private order
   access, request-to-book acceptance, and reconciliation. Provider data and
   order access tokens must stay out of analytics and URLs sent elsewhere.
7. Confirm supplier inventory and the deposit/cancellation/refund wording in
   EN/DE/PL, including how on-day balances will be collected.
8. Present the completed release diff and checks. Obtain explicit deployment
   approval, then integrate through `development` → `main`, pass required CI,
   deploy within that scope, and verify the public store and payment callback.

## Official API references

- [API 3.0 environments](https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/api-reference)
- [Authentication](https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/authentication)
- [RegisterIPNURL](https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/registeripnurl)
- [SubmitOrderRequest and callback/IPN fields](https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/submitorderrequest)
- [GetTransactionStatus and IPN response](https://developer.pesapal.com/how-to-integrate/e-commerce/api-30-json/gettransactionstatus)
