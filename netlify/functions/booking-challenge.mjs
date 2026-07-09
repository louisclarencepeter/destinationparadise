// Booking challenge — signed fallback human check when Turnstile is not configured.

import {
  createHumanChallenge,
  createRateLimiter,
  errorResponse,
  rateLimitKey,
} from './_shared.mjs';

const checkRateLimit = createRateLimiter({ windowMs: 60_000, max: 20 });

const challengeSecret = () => (
  process.env.BOOKING_CHALLENGE_SECRET ||
  process.env.TURNSTILE_SECRET_KEY ||
  process.env.RESEND_API_KEY ||
  process.env.SENTRY_DSN ||
  process.env.SITE_ID ||
  'destination-paradise-booking-challenge'
);

export default async (req) => {
  if (req.method !== 'GET') return new Response('Method Not Allowed', { status: 405 });

  const limit = checkRateLimit(rateLimitKey(req));
  if (!limit.ok) {
    return Response.json(
      { ok: false, error: "You've sent a few requests already — give the team a moment, then try again." },
      { status: 429, headers: { 'retry-after': String(limit.retryAfter) } },
    );
  }

  const challenge = createHumanChallenge({ secretKey: challengeSecret() });
  return Response.json(
    { ok: true, ...challenge },
    { headers: { 'cache-control': 'no-store' } },
  );
};

export const config = { path: '/api/booking-challenge' };
