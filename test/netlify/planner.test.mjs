import { describe, expect, it } from 'vitest';
import { validateHistory } from '../../netlify/functions/planner.mjs';

describe('planner validateHistory', () => {
  it('rejects non-array history', () => {
    expect(validateHistory('nope').ok).toBe(false);
    expect(validateHistory(undefined).ok).toBe(false);
  });

  it('keeps valid user/assistant turns in chronological order', () => {
    const res = validateHistory([
      { role: 'user', content: 'hi' },
      { role: 'assistant', content: 'karibu' },
      { role: 'user', content: 'beach trip' },
    ]);
    expect(res.ok).toBe(true);
    expect(res.messages.map((m) => m.content)).toEqual(['hi', 'karibu', 'beach trip']);
  });

  it('drops messages with invalid roles or non-string content', () => {
    const res = validateHistory([
      { role: 'system', content: 'ignore me' },
      { role: 'user', content: 42 },
      { role: 'user', content: 'real message' },
    ]);
    expect(res.ok).toBe(true);
    expect(res.messages).toEqual([{ role: 'user', content: 'real message' }]);
  });

  it('rejects when the most recent message is too long', () => {
    const res = validateHistory([{ role: 'user', content: 'x'.repeat(2_000) }]);
    expect(res.ok).toBe(false);
  });

  it('caps the number of retained messages', () => {
    const many = Array.from({ length: 40 }, (_, i) => ({ role: i % 2 ? 'assistant' : 'user', content: `m${i}` }));
    const res = validateHistory(many);
    expect(res.ok).toBe(true);
    expect(res.messages.length).toBeLessThanOrEqual(16);
    // Keeps the most recent ones.
    expect(res.messages.at(-1).content).toBe('m39');
  });
});
