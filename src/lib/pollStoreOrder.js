// Keep bounded payment polling alive through transient failures. Scheduling
// belongs to this loop rather than to a React rerender caused by a response.
/** @param {{fetchOrder: () => Promise<any>, onOrder: (order: any) => void, intervalMs?: number, maxAttempts?: number}} options */
export function pollStoreOrder({ fetchOrder, onOrder, intervalMs = 4000, maxAttempts = 20 }) {
  let active = true;
  let attempts = 0;
  let timer;
  const tick = async () => {
    if (!active) return;
    attempts += 1;
    try {
      const order = await fetchOrder();
      if (active && order) {
        onOrder(order);
        if (order.status !== 'pending_payment') active = false;
      }
    } catch {
      // The next bounded attempt can recover from a transient transport error.
    }
    if (active && attempts < maxAttempts) timer = setTimeout(tick, intervalMs);
  };
  if (maxAttempts > 0) timer = setTimeout(tick, intervalMs);
  return () => { active = false; clearTimeout(timer); };
}
