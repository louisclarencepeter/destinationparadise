# Pesapal store launch

Updated 30 September 2026. Work is prepared on `development`; production remains
disabled until the user approves the specific release.

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
- Request and mixed carts still wait for staff availability and a quote before
  any payment. The accepted quote uses the same deposit plan.

## Verified external state

The signed-in Pesapal dashboard for **Destination Paradise Ltd**, Tanzania,
`info@yournexttriptoparadise.com`, showed business verification, beneficiary
setup, and received payments completed (3 of 4 onboarding steps). Withdrawal
completion is a separate step and was not performed during this work.

Existing consumer key and secret are present in **Account Settings → Developer
Settings**. No secret is copied into source, logs, or this document. The only
registered IPN inspected was Pesapal's invoicing listener; the store needs its
own listener and matching notification ID.

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
- Real Pesapal sandbox payments, new IPN registration, live database migration,
  and provider-driven emails have **not** been performed. Prepared email tests
  use a mocked sender; no customer/team messages were sent.

Before applying the new unique index to an existing database, audit duplicate
nonnull `(provider, provider_token)` values. Do not remove records to force the
migration through; resolve any duplicate against its actual provider payment.

The local checkout also contains unrelated pre-existing Threads changes.
`development` is ahead of `main` in dependency/mobile updates. Scope the release
diff explicitly; do not include those changes under payment launch approval.

## Environment setup

Keep sandbox and live configurations separate. Configure credentials through
the provider's secure settings UI. Never prefix a secret with `VITE_`.

| Variable | Purpose |
| --- | --- |
| `SUPABASE_URL` | Restored store project URL |
| `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_SECRET_KEY`) | Functions-only database access |
| `STORE_API_ENABLED=true` | Enable store functions |
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
