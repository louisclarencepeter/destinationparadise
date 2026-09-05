import test from 'node:test';
import assert from 'node:assert/strict';
import { reportAiReply, type AiContentReport } from '../src/api/report-ai';

test('an explicit report sends only the reviewed reply, reason, notes and consent', async () => {
  let url = '';
  let payload: unknown;
  const input = { reason: 'offensive' as const, reply: '  Flagged generated reply.\nKeep exact text. ', notes: 'Please review this.', consent: true as const, history: [{ role: 'user', content: 'Unrelated private message' }], contact: { email: 'not-shared@example.com' } };
  const result = await reportAiReply(input, { fetchImpl: async (target, init) => { url = String(target); payload = JSON.parse(String(init?.body)); return Response.json({ ok: true }); } });
  assert.equal(url, 'https://destination-paradise-mobile.netlify.app/api/planner-report');
  assert.deepEqual(payload, { reason: input.reason, reply: input.reply, notes: input.notes, consent: true });
  assert.deepEqual(result, { ok: true });
});

test('missing consent and oversized content fail before any network request', async () => {
  let calls = 0;
  const fetchImpl: typeof fetch = async () => { calls += 1; return Response.json({ ok: true }); };
  await assert.rejects(() => reportAiReply({ reason: 'privacy', reply: 'Selected reply', consent: false } as unknown as AiContentReport, { fetchImpl }), /Confirm/);
  await assert.rejects(() => reportAiReply({ reason: 'privacy', reply: 'x'.repeat(16_001), consent: true }, { fetchImpl }), /16,000/);
  await assert.rejects(() => reportAiReply({ reason: 'privacy', reply: 'Selected reply', notes: 'x'.repeat(1_001), consent: true }, { fetchImpl }), /1,000/);
  assert.equal(calls, 0);
});

test('failed and unconfirmed report submissions do not show success or retry automatically', async () => {
  const report: AiContentReport = { reason: 'inaccurate', reply: 'Selected reply', consent: true };
  let calls = 0;
  await assert.rejects(() => reportAiReply(report, { fetchImpl: async () => { calls += 1; return Response.json({ error: 'Unavailable' }, { status: 503 }); } }), /Unavailable/);
  assert.equal(calls, 1);
  await assert.rejects(() => reportAiReply(report, { fetchImpl: async () => Response.json({}) }), /could not confirm/);
});
