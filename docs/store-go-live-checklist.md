# Store go-live checklist

Compiled 29 October 2026. What has to happen before the online store takes
real deposits on yournexttriptoparadise.com. The store code is finished and on
staging; everything left is a decision, a payment-provider step or production
setup. Work through the phases in order. Tick an item (`[x]`) in a pull request
when it is done, with the date and who did it.

Sources: [the Pesapal launch guide](pesapal-store-launch.md),
[the operations guide](store-ops.md) and
[the rate worksheet](../STORE_GROUP_PICKUP_RATES.md). Pesapal, Supabase and
Netlify states are as those documents last recorded them
(30 September – 1 October 2026).

**Start here:** 1.1 (prices) and 2.1 (sandbox payment) hold up everything
after them.

## Already done

- The store flow works on staging: cart, pickup details, the 20% deposit and
  the embedded Pesapal checkout, in English, German and Polish.
- Staging only takes Pesapal sandbox payments. Production has the store
  switched off.
- Booking terms and policies are updated in all three languages. They still
  need sign-off (1.5).
- Browser tests cover buying, editing trips, sold-out departures, quote-only
  trips and all three languages. They run on every pull request.
- The booking calendar runs to 28 February 2028.
- Pull request #168 (`development` → `main`) passes every check as of
  29 October 2026.

## 1. Decide (business)

- [ ] **1.1 Approve the group and pickup prices.** For each of the six options
  (Safari Blue, Spice Tour and Historical City Tour, each shared and private):
  a whole-group price for 1 to 6 guests, and a per-car pickup charge for Stone
  Town, North, East and South coast. That makes 36 group prices and 24 pickup
  charges. Also say whether pickup includes the return trip and how children
  are priced. Until then, checkout shows the price as unavailable and takes no
  payment. Worksheet: [`STORE_GROUP_PICKUP_RATES.md`](../STORE_GROUP_PICKUP_RATES.md).
- [ ] **1.2 Review the Safari Blue private price.** The USD 640 private Safari
  Blue price on the site is only an estimate. Match it to the approved rate, or
  change the copy.
- [ ] **1.3 Confirm departures with suppliers.** Departure times, seats per
  departure and booking cutoffs for the three trips. Live dates currently end
  on 28 February 2027.
- [ ] **1.4 Approve the 2028 date extension.**
  `supabase/extend_departures_through_february_2028.sql` adds departures up to
  28 February 2028, the calendar's last day. It needs a go-ahead before it runs
  (3.3).
- [ ] **1.5 Sign off the booking terms.** The deposit, cancellation and refund
  wording in English, German and Polish: 20% deposit online and 80% on the day.
  Cancellation is free more than 48 hours before, 50% at 24–48 hours, and 100%
  under 24 hours or for a no-show.
- [ ] **1.6 Decide how the balance is collected.** Who takes the 80% balance on
  the day, and whether by cash, card or mobile money. Guests read this in the
  booking terms, so the two must match.

## 2. Prove payments

The sandbox needs one completed payment. After that, the live Pesapal account
is set up.

- [ ] **2.1 Complete a sandbox payment** (business). On staging, accept
  Pesapal's sandbox terms and pay test order `DP-2026-343480` with the sandbox
  card (USD 50.01 deposit). Passes when the order shows the deposit as paid, a
  booking code is issued and USD 200.00 is shown as due. No sandbox payment has
  reached "paid" yet.
- [ ] **2.2 Test the payment failure cases** (developer). Failed, cancelled,
  delayed and duplicate notifications and returns. These must hold: a wrong
  reference, amount or currency goes to review and issues no booking; a late
  payment can't overbook a departure; paying twice reuses the same checkout and
  never charges twice.
- [ ] **2.3 Finish Pesapal onboarding** (business). Step 4 of 4 in the Pesapal
  dashboard, withdrawal setup, is still open. Finish it so collected deposits
  can be paid out to the bank.
- [ ] **2.4 Register the live payment notification address** (developer). With
  the live consumer key and secret, register
  `https://yournexttriptoparadise.com/api/payments/pesapal/ipn` through
  Pesapal's RegisterIPNURL. Keep the returned ID for `PESAPAL_IPN_ID`. Don't
  reuse the invoicing listener's ID.

## 3. Set up production (developer)

- [ ] **3.1 Check the production database.** Confirm which Supabase project
  production uses (staging uses `destination-paradise-store`). Apply every file
  in `supabase/migrations` in order. The migrations add a unique index on
  `(provider, provider_token)`. Before it goes on, look for duplicate pairs and
  resolve each against its real payment. Never delete rows to get past it.
- [ ] **3.2 Load the approved prices.** Put the prices from 1.1 into
  `store_option_group_prices` and `store_option_pickup_prices` with
  [`supabase/load_group_pickup_rates.sql`](../supabase/load_group_pickup_rates.sql):
  enter the amounts in US dollars, do a dry run, then save. A zero pickup
  charge means pickup is included. With no row, the guest is asked to request a
  quote.
- [ ] **3.3 Run the 2028 date extension.** Once 1.4 is approved, run the script
  in the Supabase SQL editor. It is safe to rerun, and existing departures stay
  unchanged.
- [ ] **3.4 Set the production environment variables.** In Netlify's
  production context. Keep secrets scoped to Functions, and never give a secret
  a `VITE_` prefix. The store goes live with the first production build after
  these are set.
  - `SUPABASE_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `STORE_API_ENABLED=true`
  - `STORE_RUNTIME_ENVIRONMENT=production`
  - `STORE_PAYMENT_PROVIDER=pesapal`
  - `PESAPAL_ENABLED=true`
  - `PESAPAL_ENVIRONMENT=live`
  - `PESAPAL_CONSUMER_KEY`
  - `PESAPAL_CONSUMER_SECRET`
  - `PESAPAL_IPN_ID` (from 2.4)
  - `STORE_PUBLIC_ORIGIN=https://yournexttriptoparadise.com`
  - `STORE_DEV_FAKE_PAYMENT=false`
  - `VITE_STORE_ENABLED=true`
  - `VITE_STORE_API=live`
  - `RESEND_API_KEY`
- [ ] **3.5 Verify the production mail key.** Nobody has confirmed the saved
  `RESEND_API_KEY` since an earlier Netlify command-line change. If in doubt,
  enter it again from Resend.
- [ ] **3.6 Test real emails.** Make one controlled order. Passes when the guest
  receipt and the team notice to info@yournexttriptoparadise.com both arrive,
  with booking codes and the balance due. Don't run the email queue against the
  sandbox test order.
- [ ] **3.7 Check store alerts.** Make sure `SENTRY_DSN` is set for Functions.
  The hourly health check then reports orders waiting for review, stuck
  payments and failed emails.

## 4. Release

Only after phases 1–3 are complete.

- [ ] **4.1 Review what's shipping** (developer). #168 merges `development`
  into `main`. It also carries dependency and mobile app updates. Agree that
  scope before release.
- [ ] **4.2 Approve the release** (business). An explicit go-ahead, once
  everything in phases 1–3 is ticked.
- [ ] **4.3 Merge #168 and deploy** (developer). CI must pass (verify, mobile,
  e2e). Netlify then builds production with the store switched on.
- [ ] **4.4 Check the live store** (developer). On yournexttriptoparadise.com:
  the store page and its navigation link show, prices load, the calendar has
  dates, and checkout opens the live Pesapal form.
- [ ] **4.5 Make one real booking** (business). Staff book a low-priced trip and
  pay a real deposit. Passes when the server confirms the payment, a booking
  code is issued and both emails arrive. Refund it through Pesapal afterwards.
- [ ] **4.6 Watch the first week** (developer). Scheduled jobs run in
  production: hold cleanup every 15 minutes, payment reconciliation every 10,
  emails every 5, and a weekly date top-up. Each day, compare Pesapal's
  dashboard with the store's orders.

## If the store has to come down

To hide the store from new guests, set `VITE_STORE_ENABLED=false` in production
and redeploy. Leave `STORE_API_ENABLED` on, so payments already in progress
still confirm and guests can still open their orders.
