# Destination Paradise Multi-Trip Store Handoff

- Last updated: 2026-07-21
- Working branch: `store`
- Implementation status: Phase 1 delivered (feature-flagged store UI with fixture data; flag `dp_store_preview` in localStorage or `VITE_STORE_ENABLED=true`, disabled by default). Phase 2 delivered in code (Supabase schema + atomic checkout SQL, Netlify store API, live/fixture client switch — see "Phase 2 operations" below; requires a Supabase project + env vars to activate, everything ships dark otherwise). Phase 3 (DPO) not started; DPO onboarding in progress.
- Payment provider decision: DPO Pay by Network

## Phase 2 operations (activating the real backend)

Code paths ship dark. To bring the live store API up on a deploy context:

1. Create a Supabase project (region close to eu-central for Netlify Frankfurt).
2. Apply `supabase/migrations/20260721120000_store_schema.sql`, then
   `supabase/seed.sql` (SQL editor or `supabase db push` + `psql -f`). The seed
   is idempotent and creates the pilot catalog plus a 60-day departure window;
   re-run `select store_seed_departures(60);` any time to extend the window.
3. Optional but recommended: validate on a scratch database first —
   `psql "$SCRATCH_DB_URL" -v ON_ERROR_STOP=1 -f supabase/migrations/20260721120000_store_schema.sql -f supabase/seed.sql -f supabase/smoke.sql`
   (the smoke script exercises atomic checkout, conflicts, idempotency,
   finalize, token auth, expiry and the oversell guard; passes ⇔ prints
   `store smoke test passed`).
4. Netlify env vars (Functions scope, NEVER exposed to the browser):
   - `SUPABASE_URL` — project URL
   - `SUPABASE_SERVICE_ROLE_KEY` (or `SUPABASE_SECRET_KEY`) — service key
   - `STORE_API_ENABLED=true` — master switch for `/api/store/*` (404 otherwise)
   - `STORE_DEV_FAKE_PAYMENT=true` — preview/branch contexts ONLY; enables the
     dev-simulated payment endpoint so the journey can finalize before DPO.
     Must never be set in production.
5. Frontend build vars: `VITE_STORE_ENABLED=true` (show the store) and
   `VITE_STORE_API=live` (use `/api/store/*` instead of fixtures). Local live
   testing needs `netlify dev` so the functions run beside Vite.
6. Ops in Supabase dashboard until an admin exists: manage
   `store_departures` (capacity/status/cutoff), watch `store_orders`,
   `store_capacity_holds`, `store_bookings`; `store_notification_outbox` holds
   queued (not yet sent) receipt jobs for Phase 3.

Client contract note: the browser cart keeps its Phase 1 shape
(`experienceId/mode/guests/date/time`); the server resolves departures from
(sourceKey, date, time), re-prices in integer USD cents, and returns
per-order bearer tokens (sha256-at-rest) for the confirmation read.

## Objective

Add an Airbnb Experiences-style store to the existing Destination Paradise web app. A guest must be able to:

1. Browse experiences.
2. Select a date, departure time, and guest mix for each experience.
3. Add several independently scheduled experiences to one cart.
4. Pay once for the complete cart.
5. Receive one order receipt plus a separate booking confirmation code for every trip.

The store must be added beside the existing availability-request workflow. It must not pretend that every product has instant inventory.

## Design reference

- Local Claude Design source snapshot: `design/Destination Paradise Store.dc.html`. It references Claude runtime support files/assets that are not included locally, so it is not a standalone runnable export.
- Claude Design project: <https://claude.ai/design/p/9341ff7a-642b-46d6-87d8-0d095a80628b?file=Destination+Paradise+Store.dc.html>
- The prototype covers discovery, individual date/time/guest selection, a multi-trip cart, checkout, payment simulation, and separate confirmations.
- The `.dc.html` artifact is a visual and interaction specification. It uses Claude Design runtime elements and cannot be dropped directly into the React application.
- Treat the live Claude Design project as the authoritative interactive reference unless a complete export, including its runtime support files and assets, is added later.
- Rebuild the approved experience as accessible React components using the site's existing tokens, navigation, localization, image system, and responsive behavior.

## Confirmed and recommended decisions

### Confirmed

- DPO Pay by Network is the selected payment provider.
- A cart may contain several trips with different dates, times, and guest quantities.
- The customer makes one payment for the order.
- Every paid order item becomes its own booking and receives its own confirmation code.
- The production work remains on the `store` branch until the user requests another git action.

### Recommended launch boundary

- Launch instant booking only for an allowlist of predictable excursions with real, controlled departure inventory.
- Keep safaris, multi-day packages, retreats, transfers, private/custom routes, and uncertain supplier inventory on the current request-availability flow initially.
- Suggested pilot experiences: Safari Blue, Spice Tour, and the existing `stone-town` product titled Historical City Tour (called Stone Town Heritage Walk in the prototype), subject to final operating details.
- Do not infer that a product is instant-bookable merely because the existing content contains a numeric price.

## Current application truth

The existing application is a React 18/Vite site deployed with Netlify functions.

- `src/App.jsx` routes `/booking` and `/book-now` to the same booking request page.
- `src/pages/Booking.jsx` owns one form object and submits one product/date/guest request.
- `src/hooks/useBookingProducts.js` combines the existing packages, excursions, safaris, retreats, and transfers for the request selector.
- `netlify/functions/booking-send.mjs` validates the request and sends team/guest emails through Resend.
- No database, durable inventory, cart, order, payment attempt, or booking record currently exists.
- The current `CurrencyProvider` and `src/utils/currency.js` create rounded marketing display prices in USD/EUR/PLN. Those values are not safe as checkout prices.
- Current public excursion copy says `20% deposit, balance on the day`, while the design shows full payment. This must be resolved before live checkout.

The current enquiry flow remains useful and should not be deleted.

## Target customer journey

### Instant-bookable experience

1. Guest opens an experience detail page.
2. The page loads available departures from the server in `Africa/Dar_es_Salaam` time.
3. Guest selects a departure, adults/children, and relevant option such as shared/private.
4. The server provides an authoritative quote.
5. Guest adds the selection to the cart.
6. Guest repeats this for other experiences; every cart row keeps its own schedule and guest mix.
7. At checkout, the server re-prices all items and temporarily holds every selected departure in one database transaction.
8. If all items are still available, the server creates one pending order and one DPO transaction.
9. Guest pays on DPO's hosted checkout page.
10. The customer's browser returns and, where enabled, DPO notifies the application; the server calls `verifyToken` before accepting the payment as successful.
11. One database transaction marks the order paid, consumes all holds, and creates one booking per order item.
12. The confirmation page shows the overall order and each separate booking code.
13. Resend sends one order receipt and individual booking details.

### Request-only experience

For the first release, request-only products continue to `/booking` and do not enter the instant-payment cart.

Later, mixed or request-only carts can use this flow:

1. Create an `awaiting_availability` order without charging the guest.
2. Staff confirms all suppliers, dates, and final prices.
3. Staff proposes alternatives where necessary.
4. Once the guest accepts the final itinerary, create fresh capacity holds and one DPO payment link for the confirmed order.

This preserves the one-payment promise without charging for unavailable services.

## Product and inventory model

Use a small commerce catalog layered over the existing editorial content.

### Experience

The marketed activity, such as Safari Blue. Retain a stable ID/slug that maps to the existing content record.

Suggested fields:

- `id`
- `source_key`
- `slug`
- `title`
- `status`
- `timezone`
- `location`
- `meeting_point`
- `cancellation_policy_version`

### Experience option

The actual sellable variant, because one experience may have several commercial rules.

Suggested fields:

- `experience_id`
- `name`, such as Shared or Private
- `booking_mode`: `instant` or `request`
- `capacity_mode`: `per_seat` or `per_party`
- `min_guests` and `max_guests`
- `duration_minutes`
- `booking_cutoff_minutes`
- `currency`
- `active`

### Option price

Server-owned pricing rules for adults, children, infants, groups, private boats, pickup supplements, or other add-ons.

Store monetary values as integers in the currency's smallest supported unit. DPO's Tanzania mobile-money documentation currently describes whole-unit TZS, so currency-specific validation is required.

### Departure

A concrete bookable slot, for example:

> Safari Blue — 2026-08-18 — 08:30 — capacity 20

Suggested fields:

- `experience_option_id`
- `starts_at` and `ends_at` as timezone-aware timestamps
- `capacity_total`
- `status`: `scheduled`, `closed`, or `cancelled`
- `booking_cutoff_at`
- optional supplier/resource reference

### Capacity hold

A short reservation while the guest completes payment.

- Default target: 10–15 minutes, aligned with the DPO payment time limit.
- States: `active`, `consumed`, `released`, `expired`.
- Availability must ignore expired holds immediately; correctness must not depend on a cleanup job running first.

### Order and bookings

One order contains multiple immutable order-item snapshots. After verified payment, each order item creates one booking.

Core records:

- `orders`
- `order_items`
- `payment_attempts`
- `bookings`
- `provider_events`
- `api_idempotency_keys`
- `notification_outbox`

Each order item must snapshot the sold experience/option name, departure, guest mix, price lines, total, currency, and applicable cancellation policy. Later website edits must not change a historic paid booking.

## Availability rules

Displayed availability is:

`total capacity - confirmed bookings - active unexpired holds`

At checkout, a single Postgres transaction must:

1. Group requested capacity by departure.
2. Lock all involved departure rows in a stable order.
3. Recalculate actual availability.
4. Reject the entire checkout if any selected item is unavailable.
5. Recalculate all prices using server rules.
6. Create the pending order, immutable order items, and all capacity holds together.
7. Commit before contacting DPO so database locks remain short.

If DPO definitively rejects transaction creation, release the holds and mark the payment attempt failed. If the request times out or the result is ambiguous, mark the attempt `unknown`, retain the holds temporarily, and query DPO by `CompanyRef` before retrying. `CompanyRefUnique` protects against duplicate paid references but must not be assumed to prevent duplicate pending transactions.

The user should be shown exactly which trip needs a new date or guest quantity. Do not silently remove or replace an item.

## Recommended persistence

Use Supabase Postgres behind Netlify functions.

Reasons:

- Multi-trip capacity must be held atomically.
- Concurrent customers require transactions and row locks.
- Local storage, static files, and Netlify Blobs are not sufficient inventory authorities.
- Supabase provides a practical initial operations interface, so staff can manage departures before a custom admin is justified.

Security boundary:

- The browser must never receive the Supabase service key or DPO company token.
- The browser must not write directly to orders, payments, holds, or bookings.
- Netlify functions own all commercial writes.
- Enable row-level security and default-deny direct public access to commercial tables.
- Public order/cart access uses long, unguessable tokens; store only token hashes where practical.

## DPO Pay integration

Primary documentation:

- Overview and hosted checkout: <https://docs.dpopay.com/dpo-pay-by-network/reference/quick-start-guide>
- Create transaction token: <https://docs.dpopay.com/dpo-pay-by-network/reference/create-token>
- Verify transaction: <https://docs.dpopay.com/dpo-pay-by-network/reference/transaction-status-lookup>
- Payment methods and currencies: <https://docs.dpopay.com/dpo-pay-by-network/docs/payment-methods-currencies>
- Tanzania mobile-money guidance: <https://docs.dpopay.com/dpo-pay-by-network/docs/mno-advisory>

### Create-token mapping

Create one DPO transaction after the internal order and holds exist.

- `CompanyRef`: immutable internal order reference.
- `CompanyRefUnique`: enable duplicate-paid-reference protection.
- `PaymentAmount`: exact server-calculated amount due now.
- `PaymentCurrency`: the order currency enabled for the merchant account.
- `PTL` and `PTLtype`: align the DPO payment window with the inventory hold.
- `RedirectURL`: customer browser-return route; it does not prove successful payment.
- `BackURL`/callback: DPO currently describes this inconsistently across its documentation. Treat any return/back request only as a reconciliation trigger, always call `verifyToken`, and confirm the exact server-to-server callback method and retry behavior during onboarding.
- Customer fields: checkout contact snapshot.
- `Services`: send one DPO `Service` per order item. Every entry needs the approved DPO `ServiceType` or `ServiceTypeName`, a description, a stable `ServiceRef`, and `ServiceDate` serialized as `YYYY/MM/DD HH:MM` in Zanzibar local time.
- `Travelers`: include only the minimum required traveler data agreed with DPO and reflected in the privacy policy.

DPO supports multiple `Service` entries in one transaction. This mirrors the cart, but the internal database remains the source of truth for individual trips, prices, capacity, cancellations, and refunds.

### Payment finalization

1. Receive the customer return or a DPO callback, if DPO enables a server callback for the merchant account.
2. Treat all incoming fields as untrusted notification data.
3. Call DPO `verifyToken` with `VerifyTransaction=0` using the transaction token or company reference. This checks the transaction without marking it website-verified yet.
4. Verify the result, payment state, company reference, and the authoritative requested/final amount and currency fields against the stored payment attempt. The exact DPO response-field mapping must be confirmed in the sandbox, especially where payer currency conversion is enabled.
5. Record the requested amount/currency and all relevant DPO-returned amount/currency values. Route any underpayment, overpayment, currency mismatch, or unclear mapping to `requires_review` rather than confirming automatically.
6. Insert the provider result under a unique internal key based on the transaction token/reference and observed state so retries cannot create duplicate bookings.
7. Lock the order and stop if it is already finalized.
8. Mark the payment paid, consume holds, and create all bookings in one transaction. Confirmed capacity is derived from confirmed bookings; do not also increment a separate counter.
9. Add receipt/confirmation jobs to the notification outbox in the same transaction.
10. After the database transaction succeeds, call `verifyToken` again with `VerifyTransaction=1` to acknowledge website verification to DPO.
11. If that acknowledgement fails, set the payment attempt to `paid_acknowledgement_pending`, keep the paid order/bookings intact, and let reconciliation retry the acknowledgement; never duplicate commercial finalization.
12. Return quickly; send email after the commercial transaction is safe.
13. The browser confirmation route polls the internal order-status endpoint and never confirms from DPO query parameters alone.

### Delayed or exceptional payments

- Reconcile pending payment attempts through a scheduled Netlify function using `verifyToken`.
- If payment arrives after a hold expired, recheck all capacity atomically.
- If capacity can still be recovered, finalize normally.
- If it cannot, mark the order `requires_review`; do not oversell or silently substitute a trip.
- Resolve the customer with an approved alternative or refund process.

### Provider isolation

Place DPO-specific XML and status mapping behind a small payment adapter. The order and booking model must use internal states rather than DPO terminology. This keeps the business logic testable and prevents provider details from spreading across React components and database functions.

Proposed internal operations:

- `createCheckout(order)`
- `verifyPayment(providerReference)`
- `refundPayment(paymentAttempt, amount)`
- `mapProviderStatus(response)`

### Secrets and configuration

Keep DPO sandbox and production credentials only in Netlify environment variables. Never write them into this handoff, source code, browser storage, logs, analytics, Sentry payloads, or git history.

Expected configuration categories:

- DPO company token
- DPO API version/base endpoint
- DPO hosted payment-page endpoint
- public application origin used to construct approved return/callback URLs
- environment marker for sandbox versus production

Use separate sandbox and production contexts and reject accidental production initialization from preview deployments.

## API surface

Suggested public endpoints:

- `GET /api/store/catalog`
- `GET /api/store/availability?option=...&from=...&to=...&guests=...`
- `POST /api/store/quote`
- `POST /api/store/checkout`
- `POST /api/store/availability-request`
- `GET /api/store/orders/:reference`, authorized by a secure HTTP-only confirmation session or an `Authorization` header rather than a query-string secret
- `GET /api/payments/dpo/return` for the customer browser return
- `GET` or `POST /api/payments/dpo/callback` only after DPO confirms the account's actual callback contract

Suggested scheduled/internal operation:

- Reconcile stale `pending` DPO payment attempts and release expired holds.

The quote response should include a short-lived quote/version ID. Checkout revalidates it and clearly asks the guest to accept any price or availability change.

Order-status and confirmation responses must send `Cache-Control: no-store` and `Referrer-Policy: no-referrer`. Do not load third-party analytics, advertising pixels, or other unnecessary third-party scripts on confirmation pages.

## Frontend integration map

### Add

- `src/pages/ExperiencesStore.jsx`
- `src/pages/StoreCheckout.jsx`
- `src/pages/StoreConfirmation.jsx`
- `src/components/store/ExperienceCard.jsx`
- `src/components/store/AvailabilityCalendar.jsx`
- `src/components/store/TimeSlotPicker.jsx`
- `src/components/store/GuestPicker.jsx`
- `src/components/store/BookingPanel.jsx`
- `src/components/store/CartDrawer.jsx`
- `src/components/store/CartItem.jsx`
- `src/components/store/CheckoutSummary.jsx`
- `src/context/BookingCartContext.jsx`
- `src/hooks/useAvailability.js`
- `src/lib/storeApi.js`
- `src/data/commerceCatalog.js`
- localized store copy for English, German, and Polish

### Change

- `src/main.jsx`: mount the cart provider.
- `src/App.jsx`: add store, checkout, and non-indexed confirmation routes.
- `src/components/SiteLayout.jsx`: mount the cart drawer once at layout level.
- `src/components/SiteNav.jsx`: add the store/cart entry points.
- `src/pages/ExcursionDetail.jsx`: show availability and Add to trip for eligible options; retain request CTA for other options.
- Other product detail pages: route request-only products to the existing booking flow.
- `scripts/routes.mjs`, sitemap, and prerender rules: include public store routes and exclude private order confirmations.
- `netlify.toml`: add SPA/rewrites for checkout, confirmation, and DPO return routes so direct navigation and hosted-payment returns do not fall through to the site's 404 page.
- English, German, and Polish terms/privacy copy: cover payment processing, booking records, refunds, and retention.

### Cart behavior

- Use a reducer-based React context; another state library is not required for the first release.
- Persist a versioned cart token or minimal item selections locally for convenience.
- Never treat locally stored prices or availability as authoritative.
- Every cart item stores its own option ID, departure ID, guest quantities, and item-specific details.
- Re-fetch and re-price on cart open, quote, and checkout.
- Clearly label `Instant confirmation` versus `Request availability`.

## Netlify function integration map

Add functions for:

- catalog/availability reads
- quote creation
- atomic order and hold creation
- DPO create-token call
- DPO callback and `verifyToken` processing
- order-status reads
- pending-payment reconciliation

Reuse existing patterns for:

- allowed-source checks
- sanitization
- rate limiting where appropriate
- Sentry reporting with sensitive-data filtering
- Resend email rendering/delivery
- Netlify function path configuration

Do not use the existing in-memory request limiter as an inventory mechanism.

## Price and currency policy

- Server pricing is the only checkout authority.
- Keep current client-side converted/rounded prices as marketing display hints only.
- One order and one DPO transaction use one exact currency.
- Ask DPO to confirm which card/mobile-money currencies and settlement currencies are enabled for the Destination Paradise merchant account.
- Lock the charged currency and amount in the quote/order snapshot.
- If a displayed currency cannot be charged, disclose the charged currency before checkout.
- Record both the requested order values and DPO's original/final/converted values. Confirm the authoritative verification fields with sandbox evidence before enabling production.
- Never let the browser submit the final price.

## Booking, payment, and refund states

Suggested order states:

- `awaiting_availability`
- `quoted`
- `pending_payment`
- `paid`
- `expired`
- `payment_failed`
- `requires_review`
- `partially_refunded`
- `refunded`
- `cancelled`

Suggested booking states:

- `held`
- `confirmed`
- `cancelled`
- `completed`
- `refund_pending`
- `refunded`

Suggested payment-attempt states:

- `created`
- `pending`
- `unknown`
- `paid`
- `paid_acknowledgement_pending`
- `failed`
- `expired`
- `verification_failed`
- `refunded`

State transitions must be guarded so repeated clicks, network retries, DPO callbacks, or reconciliation runs cannot create duplicate orders or bookings.

## Operations and administration

For the first production release, staff can manage departures in the Supabase dashboard. Required operations include:

- create/edit/close/cancel a departure
- set capacity and booking cutoff
- view active holds and paid bookings
- find an order by customer, booking code, company reference, or DPO reference
- resend confirmations
- cancel a booking or complete a refund workflow
- record supplier confirmation/reference
- export manifests and booking lists

A custom protected admin app should be built only after the workflow has been proven or if staff usability requires it.

## Business decisions required before live payment

1. **Deposit or full payment:** current excursion copy says 20% deposit; the prototype shows full payment. If deposits remain, show trip total, due today, remaining balance, due date, and booking status explicitly.
2. **Pilot inventory:** confirm real operating days, start/end times, capacity, cutoff, minimum guests, child ages/prices, and private/shared rules for every pilot option.
3. **Pickup model:** decide whether pickup is per order or per trip. Per trip is safer because guests may stay at different hotels on different dates.
4. **Cancellation rules:** define policy versions and supplier-specific exceptions.
5. **Partial refunds:** obtain written DPO confirmation that one item can be refunded from a combined transaction for every enabled payment method, especially mobile money. If not, define the manual resolution policy.
6. **Currencies:** confirm enabled checkout and settlement currencies, conversion treatment, and customer-facing disclosures.
7. **Merchant terms:** confirm card/mobile-money rates, settlement timing, bank fees, rolling reserve, chargeback handling, refund fees, transaction limits, sandbox access, and production credential lead time.
8. **Availability ownership:** establish who keeps each departure's capacity accurate and how supplier changes reach the system.
9. **Guest data:** decide what traveler information is actually needed per trip and avoid collecting unnecessary passport or identity information.

## DPO onboarding checklist

Obtain written confirmation of:

- Destination Paradise/tour-operator approval
- legal merchant entity and settlement bank account
- TZS, USD, EUR, and GBP checkout/settlement availability
- Visa/Mastercard and Tanzanian mobile-money methods enabled for the account
- domestic and international card pricing
- mobile-money pricing
- settlement frequency and bank/FX fees
- rolling reserve percentage and release period
- chargeback process and evidence requirements
- partial-refund behavior by payment method
- maximum transaction and monthly volume limits
- sandbox credentials and test scenarios
- production credentials and approved callback/return URLs
- approved DPO `ServiceType` or `ServiceTypeName` for every pilot experience
- accepted `ServiceRef` format and confirmation of `ServiceDate` timezone/serialization
- exact return/callback methods, payloads, retry behavior, and whether a true server-to-server callback is enabled
- authoritative `verifyToken` amount/currency fields when customer currency conversion is enabled
- support escalation contacts

Do not block frontend/store work on commercial onboarding, but do not promise a live-payment launch date until the merchant account and settlement terms are approved.

## Delivery phases

### Phase 0 — Operational definition and provider onboarding

- Confirm the pilot products and all sellability rules.
- Resolve deposit versus full payment.
- Start DPO onboarding and obtain sandbox credentials.
- Normalize stable product/option IDs without rewriting editorial content.

### Phase 1 — Store interface behind a feature flag

- Rebuild the approved Claude Design flow in React.
- Add store browsing, booking panel, cart drawer, checkout shell, and confirmation shell.
- Integrate current navigation, responsive design, English/German/Polish translations, and accessibility.
- Use non-chargeable fixtures or a development API until inventory storage is ready.

### Phase 2 — Real catalog, pricing, and availability

- Create Supabase schema, migrations, constraints, and row-level security.
- Add catalog, availability, quote, and checkout APIs.
- Implement atomic capacity holds and expiry behavior.
- Seed manually managed departures for the pilot options.

### Phase 3 — DPO sandbox payments

- Implement the DPO adapter and XML validation/escaping.
- Create one DPO transaction with one service entry per trip.
- Implement browser-return and confirmed callback triggers, the two-step `verifyToken` process, idempotent finalization, and reconciliation.
- Generate separate booking codes and confirmation emails.

### Phase 4 — Hardening and pilot launch

- Complete concurrency, payment replay, expiry, late-payment, and failure testing.
- Verify desktop and real mobile journeys.
- Update privacy, terms, cancellation, refund, and payment copy.
- Add analytics and Sentry monitoring without sensitive payment/customer data.
- Complete a small controlled production pilot before expanding the catalog.

### Phase 5 — Request/mixed carts and richer operations

- Persist request-only carts as `awaiting_availability` orders.
- Add staff confirmation and alternative-date workflow.
- Send one combined DPO payment link after all requested items are confirmed.
- Add a custom admin only when operational needs justify it.

## Required testing

### Unit and integration

- price calculations for adult/child/group/private rules
- timezone and booking-cutoff behavior
- quote expiry and repricing
- capacity calculations with confirmed bookings and expired/active holds
- concurrent attempts for the final available places
- all-or-nothing multi-trip hold transaction
- DPO XML escaping and parsing
- DPO status mapping
- duplicate checkout clicks and idempotency keys
- repeated callbacks and reconciliation replays
- failed, cancelled, expired, and late payments
- partial and full refund state handling
- notification-outbox retry behavior

### Customer journey

- add multiple trips with different dates/times/guests
- edit and remove one trip without changing the others
- recover the cart after refresh
- surface a sold-out conflict for only the affected item
- return safely from successful, failed, cancelled, and abandoned DPO checkout
- show one order plus separate booking confirmations
- validate desktop, tablet, and mobile layouts
- validate keyboard navigation, focus management, screen-reader labels, and reduced motion
- validate English, German, and Polish copy and formatting

### Production checks

- DPO browser-return and any account-confirmed callback URLs reachable on production
- every return/callback trigger performs server-side `verifyToken`
- sandbox-proven amount/currency/company-reference comparison, including conversion fields
- no DPO or database secrets in browser bundles, logs, analytics, or Sentry
- real mailbox delivery of receipt and booking confirmations
- reconciliation catches a deliberately missed callback
- alerts exist for `requires_review`, callback failures, and stuck pending payments

## Analytics events

At minimum:

- `view_item`
- `view_availability`
- `select_departure`
- `add_to_cart`
- `remove_from_cart`
- `begin_checkout`
- `availability_conflict`
- `payment_redirect`
- `purchase`
- `payment_failed`
- `request_availability`

Never send names, email addresses, phone numbers, DPO tokens, or full free-text notes in analytics events.

## First-release acceptance criteria

The instant-booking pilot is ready only when:

- every pilot option has approved operational inventory and pricing rules
- multiple independently scheduled trips can be edited in one cart
- the server re-prices and atomically holds all selected capacity
- one DPO hosted payment is created from the internal order
- DPO payment is verified server-side before confirmation
- repeated callbacks/clicks cannot duplicate orders or bookings
- one paid order produces one booking code per trip
- confirmations work in the browser and business/customer mailboxes
- abandoned and expired payments release capacity
- late payment cannot oversell a departure
- request-only products still work through the existing booking path
- privacy, terms, deposits, cancellation, and refund copy match the real policy
- responsive and accessibility checks pass

## Immediate next action

Begin Phase 0 and Phase 1 on `store`:

1. Confirm the operational rules for Safari Blue, Spice Tour, and Historical City Tour (`stone-town`; Stone Town Heritage Walk in the prototype).
2. Resolve deposit versus full payment.
3. Start DPO merchant/sandbox onboarding.
4. Implement the React routes, cart context, and store components behind a disabled-by-default feature flag.

Do not enable real payments or advertise instant confirmation until the inventory authority, DPO account, callback verification, policies, and production tests are complete.
