# Store operations cookbook

Day-to-day store administration until a custom admin exists (HANDOFF Phase 5).
Everything runs in the **Supabase dashboard → SQL editor** of project
`destination-paradise-store` (`hskhpsdociwikywfnsvf`, eu-central-1).

Ground rules:

- Use only the recipes below. Never hand-edit `store_orders`, `store_bookings`
  or `store_capacity_holds` rows outside them — money-adjacent state has
  invariants the SQL functions protect.
- Staging note: Netlify runs scheduled functions (hold cleanup, reconciler,
  outbox emails, weekly departure top-up) **in production only**. On staging
  nothing is sent automatically and windows don't extend themselves — use the
  manual recipes.
- All times are Zanzibar wall time (`Africa/Dar_es_Salaam`).

## Inventory

**Extend the bookable window** (weekly top-up; idempotent):

```sql
select store_seed_departures(60);
```

**See upcoming departures with live availability:**

```sql
select e.source_key, d.local_date, d.local_time, d.capacity_total,
       store_seats_available(d.id) as seats_left, d.status
from store_departures d join store_experiences e on e.id = d.experience_id
where d.local_date >= current_date
order by d.local_date, e.source_key, d.local_time
limit 60;
```

**Close a departure** (stops new sales; existing bookings stay):

```sql
update store_departures set status = 'closed', updated_at = now()
where id = '<departure-id>';
```

**Cancel a departure** (hides it entirely — then contact booked guests; refunds
are manual until DPO refund tooling lands):

```sql
update store_departures set status = 'cancelled', updated_at = now()
where id = '<departure-id>';

-- Who is affected:
select o.reference, o.contact_name, o.contact_email, b.code, b.guests
from store_bookings b
join store_orders o on o.id = b.order_id
where b.departure_id = '<departure-id>' and b.status = 'confirmed';
```

**Change capacity** (never below what's already sold + held):

```sql
update store_departures d set capacity_total = <new-capacity>, updated_at = now()
where d.id = '<departure-id>'
  and <new-capacity> >= d.capacity_total - store_seats_available(d.id);
```

If that updates 0 rows, the new capacity would cut below existing commitments.

## Orders and bookings

**Find an order** (by reference, email, or booking code):

```sql
select o.reference, o.status, o.total_minor / 100.0 as total_usd,
       o.contact_name, o.contact_email, o.created_at
from store_orders o
where o.reference = 'DP-2026-123456'
   or o.contact_email ilike '%guest@example.com%'
   or o.id in (select order_id from store_bookings where code = 'SB-1234');
```

**Order detail with items and codes:**

```sql
select store_order_for_notification('DP-2026-123456');
```

**Daily manifest** (who is arriving, per departure):

```sql
select d.local_date, d.local_time, e.source_key, b.code, b.guests,
       o.contact_name, o.contact_phone
from store_bookings b
join store_departures d on d.id = b.departure_id
join store_experiences e on e.id = d.experience_id
join store_orders o on o.id = b.order_id
where b.status = 'confirmed' and d.local_date = current_date + 1
order by d.local_time;
```

## Requests and quotes

Request/mixed carts (Prison Island, safaris, custom journeys) arrive as
`awaiting_availability` orders — no payment, no holds, nothing promised yet.
Lifecycle: `awaiting_availability` → staff quote → `quoted` → guest accepts
(atomic capacity check + fresh holds) → `pending_payment` → normal payment
rails.

**See open requests** (the guest's wished dates are in `requested_dates`;
`item_id` is what the quote step needs):

```sql
select o.reference, o.created_at, o.contact_name, o.contact_email, o.language,
       i.id as item_id, i.item_kind, i.experience_source_key, i.guests,
       i.requested_dates
from store_orders o
join store_order_items i on i.order_id = o.id
where o.status = 'awaiting_availability'
order by o.created_at desc;
```

**Create the departure for the confirmed date** (the quote resolves each item
against a real `scheduled` departure row; capacity = what the supplier
confirmed; idempotent — if the departure already exists, just quote against
it):

```sql
insert into store_departures
  (experience_id, starts_at, local_date, local_time, capacity_total, booking_cutoff_at)
select e.id,
       ('2026-08-09 09:00'::timestamp at time zone 'Africa/Dar_es_Salaam'),
       '2026-08-09', '09:00', 8,
       ('2026-08-09 09:00'::timestamp at time zone 'Africa/Dar_es_Salaam')
from store_experiences e
where e.source_key = 'prison-island'
on conflict (experience_id, starts_at) do nothing;
```

**Send the quote.** `totalMinor` is USD cents for the whole item (not per
guest); the per-item `note` and the order-level note both show to the guest;
validity defaults to 72 h:

```sql
select store_staff_quote(
  'DP-2026-123456',
  '[{"itemId": "<item-uuid>", "date": "2026-08-09", "time": "09:00",
     "totalMinor": 12000, "note": "Speedboat confirmed with the jetty crew"}]'::jsonb,
  'Covers boat, guide and island entry.',   -- note shown on the order page
  72                                        -- hours the accept link stays valid
);
```

Every item on the order must end up scheduled + priced (instant items riding
in a mixed cart already are — only list the request items). The call rotates
the order's access token and queues the `quote_ready` email; re-running it
before the guest accepts is fine — new prices, new link, the old link dies.
If the quote expires before the guest clicks, re-run it the same way.

**Get the accept link on staging** (production emails it automatically and
then redacts the token — read it *before* running the outbox sender):

```sql
select 'https://store--destinationparadisezanzibar.netlify.app/store/order/'
       || o.reference || '?t=' || (nb.payload->>'accessToken') as accept_link
from store_notification_outbox nb
join store_orders o on o.id = nb.order_id
where o.reference = 'DP-2026-123456' and nb.kind = 'quote_ready'
order by nb.created_at desc limit 1;
```

**Decline a request you can't fulfil** (safe before acceptance — these orders
hold no seats and no payment; email the guest yourself, there is no
auto-notification):

```sql
update store_orders set status = 'cancelled', updated_at = now()
where reference = 'DP-2026-123456'
  and status in ('awaiting_availability', 'quoted');
```

After the guest accepts, the order is `pending_payment` with real holds — the
Payments recipes below apply from there.

## Payments (dev-simulated until DPO activates)

**Resolve a `requires_review` order.** First inspect what the provider
reported (`store_payment_attempts.provider_amounts`), then either:

```sql
-- a) money is genuinely good → finalize (idempotent, never oversells):
select store_finalize_paid_order('DP-2026-123456');

-- b) payment is genuinely bad → fail it and free the seats:
select store_mark_payment('DP-2026-123456', 'failed', null);
```

**Release a stuck active hold** (only if you're sure the guest is gone —
expired holds already don't block sales):

```sql
update store_capacity_holds set status = 'released'
where id = '<hold-id>' and status = 'active';
```

## Emails

**Re-send a confirmation** (re-queues for the outbox sender; on staging run
the sender manually or just check the row exists):

```sql
update store_notification_outbox
set status = 'pending', next_attempt_at = now(), updated_at = now()
where order_id = (select id from store_orders where reference = 'DP-2026-123456')
  and kind = 'order_receipt';
```

**See failed/overdue emails:**

```sql
select o.reference, nb.kind, nb.status, nb.attempts, nb.next_attempt_at
from store_notification_outbox nb join store_orders o on o.id = nb.order_id
where nb.status <> 'sent' order by nb.created_at;
```

## Health

```sql
select store_health_snapshot(120);
```

Alert-worthy keys (`requiresReviewOrders`, `stuckPendingAttempts`,
`stuckAcknowledgements`, `failedOutbox`, `overdueOutbox`) are what the hourly
production health check pages Sentry about; the rest is context.
