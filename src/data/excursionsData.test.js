import { describe, expect, it } from 'vitest';
import { EXCURSIONS } from './excursionsData.js';

describe('EXCURSIONS data', () => {
  it('contains unique IDs and required fields', () => {
    const ids = new Set(EXCURSIONS.map((item) => item.id));
    expect(ids.size).toBe(EXCURSIONS.length);

    EXCURSIONS.forEach((item) => {
      expect(item.id).toBeTruthy();
      expect(item.title).toBeTruthy();
      expect(item.price).toBeTypeOf('number');
      expect(Array.isArray(item.highlights)).toBe(true);
      expect(item.highlights.length).toBeGreaterThan(0);
    });
  });
});
