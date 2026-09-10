-- Operational health snapshot (HANDOFF.md Phase 4 / production checks:
-- "alerts exist for requires_review, callback failures, and stuck pending
-- payments"). Counts only — no customer data leaves the database.

create or replace function store_health_snapshot(
  p_stuck_after_minutes int default 120
)
returns jsonb
language sql
stable
as $$
  select jsonb_build_object(
    'requiresReviewOrders', (
      select count(*) from store_orders where status = 'requires_review'),
    'stuckPendingAttempts', (
      select count(*) from store_payment_attempts pa
      join store_orders o on o.id = pa.order_id
      where pa.status in ('pending', 'unknown')
        and o.status = 'pending_payment'
        and pa.updated_at <= now() - make_interval(mins => greatest(p_stuck_after_minutes, 1))),
    'stuckAcknowledgements', (
      select count(*) from store_payment_attempts
      where status = 'paid_acknowledgement_pending'
        and updated_at <= now() - make_interval(mins => greatest(p_stuck_after_minutes, 1))),
    'failedOutbox', (
      select count(*) from store_notification_outbox where status = 'failed'),
    'overdueOutbox', (
      select count(*) from store_notification_outbox
      where status = 'pending'
        and created_at <= now() - make_interval(mins => greatest(p_stuck_after_minutes, 1))),
    -- Context metrics (not alerts): a feel for pilot volume at a glance.
    'activeHolds', (
      select count(*) from store_capacity_holds
      where status = 'active' and expires_at > now()),
    'paidOrdersLast24h', (
      select count(*) from store_orders
      where status = 'paid' and updated_at > now() - interval '24 hours')
  );
$$;
