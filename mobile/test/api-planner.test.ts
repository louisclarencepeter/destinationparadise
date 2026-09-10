import test from 'node:test';
import assert from 'node:assert/strict';
import { ApiError, requestJson, utf8Bytes } from '../src/api/client';
import { preparePlannerHistory, sanitizePlannerReply, sendPlannerMessage, sendPlannerDraft, type PlannerMessage } from '../src/api/planner';

test('planner retains newest history under backend message and total-character bounds', () => {
  const messages: PlannerMessage[] = Array.from({ length: 20 }, (_, index) => ({ role: index % 2 ? 'assistant' : 'user', content: `${index} ${'x'.repeat(700)}` }));
  const prepared = preparePlannerHistory(messages);
  assert.equal(prepared.at(-1)?.content, messages.at(-1)?.content);
  assert.ok(prepared.length <= 16);
  assert.ok(prepared.reduce((total, item) => total + item.content.length, 0) <= 6000);
  assert.throws(() => preparePlannerHistory([{ role: 'user', content: 'x'.repeat(1201) }]), /1,200/);
  assert.equal(utf8Bytes('Aé🌴'), 7);
});

test('handoff tokens never cause an email request and unconfirmed delivery claims are removed', async () => {
  const requests: string[] = [];
  const fetchImpl: typeof fetch = async (input) => {
    requests.push(String(input));
    return Response.json({ reply: "Trip details\n- Nights: 7\nDraft itinerary\nDay 1: Explore Stone Town\nAsante, Guest! I've sent this draft to the team — they'll reply within a day. A copy is on its way to your inbox too.\n[[PLANNER_HANDOFF_READY]]" });
  };
  const result = await sendPlannerMessage([{ role: 'user', content: 'Suggest a Zanzibar trip.' }], { fetchImpl });
  assert.equal(result.handoffReady, true);
  assert.match(result.reply, /Day 1: Explore Stone Town/);
  assert.match(result.reply, /Use Send to the team/);
  assert.doesNotMatch(result.reply, /I've sent|on its way|HANDOFF_READY/);
  assert.deepEqual(requests, ['https://yournexttriptoparadise.com/api/planner']);
  const other = sanitizePlannerReply('I’ve emailed the team. Your plan has been sent to the team. Day 1: Stone Town.');
  assert.equal(other.reply, 'Day 1: Stone Town.');
  const booked = sanitizePlannerReply("I've just sent your draft. Your trip is now confirmed. The team has received your itinerary. Day 2: Jozani Forest.");
  assert.equal(booked.reply, 'Day 2: Jozani Forest.');
});

test('a lost email response reports uncertain delivery and never retries an irreversible send', async () => {
  let calls = 0;
  const fetchImpl: typeof fetch = async () => { calls += 1; throw new TypeError('Network request failed'); };
  await assert.rejects(() => sendPlannerDraft({ contact: { name: 'Guest', email: 'guest@example.com' }, history: [{ role: 'user', content: 'Culture trip.' }] }, { fetchImpl }), (error: unknown) => error instanceof ApiError && error.code === 'DELIVERY_UNCONFIRMED' && /before sending it again/.test(error.message));
  assert.equal(calls, 1);
  const draft = { contact: { name: 'Guest', email: 'guest@example.com' }, history: [{ role: 'user' as const, content: 'Culture trip.' }] };
  for (const response of [Response.json({}), Response.json({ error: 'Mailer gateway error' }, { status: 502 })]) {
    await assert.rejects(() => sendPlannerDraft(draft, { fetchImpl: async () => response }), (error: unknown) => error instanceof ApiError && error.code === 'DELIVERY_UNCONFIRMED');
  }
});

test('safe itinerary paragraphs keep their formatting while unsupported delivery sentences are removed', () => {
  const result = sanitizePlannerReply('## Your trip\nA slow morning. An afternoon by the sea. I have sent your itinerary to the team.\n\nDay 2: Stone Town. Enjoy the markets.');
  assert.equal(result.reply, '## Your trip\nA slow morning. An afternoon by the sea.\n\nDay 2: Stone Town. Enjoy the markets.');
});

test('explicit draft submission validates contacts and posts exact existing API history contract', async () => {
  let request: { url: string; body: Record<string, unknown> } | undefined;
  const fetchImpl: typeof fetch = async (input, options) => {
    request = { url: String(input), body: JSON.parse(String(options?.body)) };
    return Response.json({ ok: true });
  };
  const history: PlannerMessage[] = [{ role: 'user', content: 'A culture trip, please.' }];
  const result = await sendPlannerDraft({ contact: { name: ' Example Guest ', email: 'guest@example.com' }, history }, { fetchImpl });
  assert.deepEqual(result, { ok: true });
  assert.equal(request?.url, 'https://yournexttriptoparadise.com/api/planner-send');
  assert.deepEqual(request?.body.history, history);
  assert.equal(request?.body.messages, undefined);
  assert.deepEqual(request?.body.contact, { name: 'Example Guest', email: 'guest@example.com', phone: '' });
  await assert.rejects(() => sendPlannerDraft({ contact: { name: 'Guest', email: 'invalid' }, history }, { fetchImpl }), /valid email/);
  await assert.rejects(() => sendPlannerDraft({ contact: { name: 'Guest', email: 'guest@example.com' }, history: Array.from({ length: 41 }, () => history[0]) }, { fetchImpl }), /40 messages/);
});

test('planner HTTP errors remain errors and failed email sends are never automatically retried', async () => {
  let calls = 0;
  const fetchImpl: typeof fetch = async () => {
    calls += 1;
    return Response.json({ error: 'Please wait before sending another draft.' }, { status: 429 });
  };
  await assert.rejects(() => sendPlannerDraft({ contact: { name: 'Guest', email: 'guest@example.com' }, history: [{ role: 'user', content: 'Culture trip.' }] }, { fetchImpl }), (error: unknown) => error instanceof ApiError && error.status === 429);
  assert.equal(calls, 1);
});

test('cancellation propagates and timeouts produce actionable errors', async () => {
  const controller = new AbortController();
  const fetchImpl: typeof fetch = async (_url, options) => new Promise((_resolve, reject) => {
    options?.signal?.addEventListener('abort', () => reject(Object.assign(new Error('cancelled'), { name: 'AbortError' })), { once: true });
  });
  const pending = requestJson('https://example.com', {}, { fetchImpl, signal: controller.signal });
  controller.abort();
  await assert.rejects(() => pending, { name: 'AbortError' });
  await assert.rejects(() => requestJson('https://example.com', {}, { fetchImpl, timeoutMs: 5 }), (error: unknown) => error instanceof ApiError && error.code === 'TIMEOUT');
});
