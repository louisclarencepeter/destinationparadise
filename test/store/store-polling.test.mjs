import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { applyPendingOrderCheck, pollStoreOrder } from '../../src/lib/pollStoreOrder.js';

beforeEach(() => { vi.useFakeTimers(); });
afterEach(() => { vi.useRealTimers(); });

describe('bounded confirmation polling', () => {
  it('recovers after a null response and network rejection, then stops on verified payment', async () => {
    const fetchOrder = vi.fn().mockResolvedValueOnce(null).mockRejectedValueOnce(new TypeError('Offline'))
      .mockResolvedValueOnce({ status: 'pending_payment' }).mockResolvedValueOnce({ status: 'paid', paymentStatus: 'deposit_paid' });
    const onOrder = vi.fn();
    const stop = pollStoreOrder({ fetchOrder, onOrder, intervalMs: 100, maxAttempts: 20 });
    await vi.advanceTimersByTimeAsync(1000);
    expect(fetchOrder).toHaveBeenCalledTimes(4);
    expect(onOrder.mock.calls.map(([order]) => order.status)).toEqual(['pending_payment', 'paid']);
    expect(vi.getTimerCount()).toBe(0);
    stop();
  });

  it('keeps the existing twenty-attempt bound through a sustained outage', async () => {
    const fetchOrder = vi.fn().mockResolvedValue(null);
    const onOrder = vi.fn();
    pollStoreOrder({ fetchOrder, onOrder, intervalMs: 100 });
    await vi.advanceTimersByTimeAsync(10_000);
    expect(fetchOrder).toHaveBeenCalledTimes(20);
    expect(onOrder).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it('ignores an in-flight response after the route unmounts and schedules no more requests', async () => {
    let resolve;
    const fetchOrder = vi.fn(() => new Promise((done) => { resolve = done; }));
    const onOrder = vi.fn();
    const stop = pollStoreOrder({ fetchOrder, onOrder, intervalMs: 100 });
    await vi.advanceTimersByTimeAsync(100);
    stop();
    resolve({ status: 'paid' });
    await vi.advanceTimersByTimeAsync(1000);
    expect(fetchOrder).toHaveBeenCalledOnce();
    expect(onOrder).not.toHaveBeenCalled();
    expect(vi.getTimerCount()).toBe(0);
  });

  it.each(['paid', 'requires_review', 'expired'])('keeps the newer %s poll result when a slower manual check returns pending', async (status) => {
    const reference = 'DP-2026-123456';
    let order = { reference, status: 'pending_payment' };
    let finishManualCheck;
    const manualResponse = new Promise((resolve) => { finishManualCheck = resolve; });
    const manualCheck = manualResponse.then((refreshed) => {
      order = applyPendingOrderCheck(order, refreshed, reference);
    });
    pollStoreOrder({
      fetchOrder: async () => ({ reference, status }),
      onOrder: (refreshed) => { order = refreshed; },
      intervalMs: 100,
    });
    await vi.advanceTimersByTimeAsync(100);
    expect(order.status).toBe(status);
    finishManualCheck({ reference, status: 'pending_payment' });
    await manualCheck;
    expect(order.status).toBe(status);
    expect(vi.getTimerCount()).toBe(0);
  });

  it('applies a completed check only to the pending order it belongs to', () => {
    const current = { reference: 'DP-2026-123456', status: 'pending_payment' };
    const paid = { ...current, status: 'paid' };
    expect(applyPendingOrderCheck(current, paid, current.reference)).toBe(paid);
    const other = { reference: 'DP-2026-654321', status: 'pending_payment' };
    expect(applyPendingOrderCheck(other, paid, current.reference)).toBe(other);
    expect(applyPendingOrderCheck(current, other, current.reference)).toBe(current);
  });
});
