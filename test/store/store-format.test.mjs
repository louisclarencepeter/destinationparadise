import { describe, expect, it } from 'vitest';
import { formatStoreMoney } from '../../src/lib/storeFormat.js';
import { depositBreakdown } from '../../src/lib/storeApi.js';

describe('exact USD checkout amounts', () => {
  it.each([
    ['en', ['$95.01', '$19.01', '$76.00']],
    ['de', ['95,01 $', '19,01 $', '76,00 $']],
    ['pl', ['95,01 USD', '19,01 USD', '76,00 USD']],
  ])('keeps trip, deposit and balance cents exact in %s', (language, labels) => {
    const plan = depositBreakdown(95.01);
    expect(plan.chargeUsd + plan.balanceUsd).toBe(95.01);
    expect([95.01, plan.chargeUsd, plan.balanceUsd].map((amount) => formatStoreMoney(language, amount))).toEqual(labels);
  });

  it('keeps whole USD amounts precise instead of hiding cents or independently converting balances', () => {
    expect(formatStoreMoney('de', 38)).toBe('38,00 $');
    expect(formatStoreMoney('pl', 152)).toBe('152,00 USD');
  });
});
