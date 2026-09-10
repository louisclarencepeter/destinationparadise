import { describe, expect, it, vi } from 'vitest';
import { createPlannerReportHandler, validateReport } from '../../netlify/functions/planner-report.mjs';

const report = { reason: 'offensive', reply: '  A generated reply <script>alert(1)</script>\nwith exact whitespace. ', notes: 'Please review & improve.', consent: true };
const request = (body = report, headers = {}, method = 'POST') => new Request('https://yournexttriptoparadise.com/api/planner-report', { method, headers: { 'content-type': 'application/json', 'x-nf-client-connection-ip': '192.0.2.10', ...headers }, ...(method === 'POST' ? { body: JSON.stringify(body) } : {}) });
const env = { RESEND_API_KEY: 'mock-key', TEAM_EMAIL_PLANNER: 'review@example.com', RESEND_FROM_PLANNER: 'Planner <sender@example.com>' };

describe('AI planner content reports', () => {
  it('requires consent, a supported reason and bounded exact selected content', () => {
    expect(validateReport({ ...report, consent: false }).ok).toBe(false);
    expect(validateReport({ ...report, reason: '__proto__' }).ok).toBe(false);
    expect(validateReport({ ...report, reply: 'x'.repeat(16_001) }).ok).toBe(false);
    expect(validateReport({ ...report, notes: 'x'.repeat(1_001) }).ok).toBe(false);
    expect(validateReport({ ...report, history: [] }).ok).toBe(false);
    expect(validateReport(report).report.reply).toBe(report.reply);
  });

  it('sends only an explicitly reviewed report to the configured team and escapes HTML', async () => {
    const sendEmail = vi.fn(async () => Response.json({ id: 'mock-provider-id' }));
    const handler = createPlannerReportHandler({ env, sendEmail });
    const response = await handler(request());
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ ok: true });
    expect(sendEmail).toHaveBeenCalledTimes(1);
    const payload = sendEmail.mock.calls[0][0];
    expect(payload.to).toEqual(['review@example.com']);
    expect(payload.from).toBe(env.RESEND_FROM_PLANNER);
    expect(payload.text).toContain(report.reply);
    expect(payload.html).not.toContain('<script>');
    expect(payload.html).toContain('&lt;script&gt;');
    expect(payload.reply_to).toBeUndefined();
    expect(response.headers.get('cache-control')).toBe('no-store');
  });

  it('does not call a provider without explicit consent, with a chat history, or from another web origin', async () => {
    const sendEmail = vi.fn();
    const handler = createPlannerReportHandler({ env, sendEmail });
    expect((await handler(request({ ...report, consent: false }))).status).toBe(400);
    expect((await handler(request({ ...report, history: [{ role: 'user', content: 'Private' }] }))).status).toBe(400);
    expect((await handler(request(report, { origin: 'https://unrelated.example.com' }))).status).toBe(403);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('allows only the canonical site CORS preflight and rejects unsupported methods/types', async () => {
    const sendEmail = vi.fn();
    const handler = createPlannerReportHandler({ env, sendEmail });
    const preflight = await handler(request(undefined, { origin: 'https://yournexttriptoparadise.com' }, 'OPTIONS'));
    expect(preflight.status).toBe(204);
    expect(preflight.headers.get('access-control-allow-origin')).toBe('https://yournexttriptoparadise.com');
    expect((await handler(request(undefined, {}, 'GET'))).status).toBe(405);
    expect((await handler(request(report, { 'content-type': 'text/plain' }))).status).toBe(415);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('enforces the body cap even when Content-Length is absent', async () => {
    const sendEmail = vi.fn();
    const handler = createPlannerReportHandler({ env, sendEmail });
    const response = await handler(request({ ...report, reply: 'x'.repeat(65_000) }));
    expect(response.status).toBe(413);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it('rate limits submissions and gives no success for missing configuration or provider rejection', async () => {
    const sendEmail = vi.fn(async () => Response.json({ error: 'Rejected' }, { status: 500 }));
    const limited = createPlannerReportHandler({ env, sendEmail, checkRateLimit: () => ({ ok: false, retryAfter: 60 }) });
    const rateResponse = await limited(request());
    expect(rateResponse.status).toBe(429);
    expect(rateResponse.headers.get('retry-after')).toBe('60');
    expect(sendEmail).not.toHaveBeenCalled();
    expect((await createPlannerReportHandler({ env: {}, sendEmail })(request())).status).toBe(503);
    expect(sendEmail).not.toHaveBeenCalled();
    const failure = await createPlannerReportHandler({ env, sendEmail })(request());
    expect(failure.status).toBe(502);
    expect((await failure.json()).ok).toBe(false);
    expect(sendEmail).toHaveBeenCalledTimes(1);
  });
});
