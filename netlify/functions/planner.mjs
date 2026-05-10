// AI Trip Planner — Netlify Function backed by the Anthropic API.
//
// Set ANTHROPIC_API_KEY in the Netlify site environment.
// The frontend calls /api/planner (rewritten to this function via netlify.toml).

import { EXCURSIONS } from '../../src/data/excursionsData.js';
import { destinationParadisePackages } from '../../src/data/destinationParadisePackages.js';
import { nextLevelSafariProducts } from '../../src/data/nextLevelSafariProducts.js';
import { destinationParadiseSafariPricing } from '../../src/data/safariPricing.js';

const PLANNER_MODEL = 'claude-haiku-4-5-20251001';
const MAX_REQUEST_BYTES = 20_000;
const MAX_HISTORY_MESSAGES = 16;
const MAX_MESSAGE_CHARS = 1_200;
const MAX_TOTAL_CHARS = 6_000;

// Per-IP rate limit. In-memory: resets on cold start and isn't shared across
// concurrent function instances, so it's a defense against burst abuse from a
// single IP, not a hard quota. Pair with an Anthropic billing alert.
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 12;
const rateLimitBuckets = new Map();

function rateLimitKey(req) {
  const forwarded = req.headers.get('x-forwarded-for') || '';
  const ip = forwarded.split(',')[0].trim() || req.headers.get('x-nf-client-connection-ip') || 'unknown';
  return ip;
}

function checkRateLimit(key) {
  const now = Date.now();
  const bucket = rateLimitBuckets.get(key);

  if (!bucket || now - bucket.start > RATE_LIMIT_WINDOW_MS) {
    rateLimitBuckets.set(key, { start: now, count: 1 });
    return { ok: true };
  }

  if (bucket.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.max(1, Math.ceil((RATE_LIMIT_WINDOW_MS - (now - bucket.start)) / 1000));
    return { ok: false, retryAfter };
  }

  bucket.count += 1;
  return { ok: true };
}

const formatMoney = (value) => `$${Number(value).toLocaleString()}`;

const priceRange = (pricing) => {
  if (!pricing?.from) return 'final price confirmed by the team';
  const from = formatMoney(pricing.from);
  const to = pricing.to ? `-${formatMoney(pricing.to)}` : '';
  return `from ${from}${to}`;
};

const packageSummary = destinationParadisePackages
  .map((item) => `${item.title} (${item.duration}, ${item.category}, ${priceRange(item.pricing)})`)
  .join('; ');

const coreSafariSummary = destinationParadiseSafariPricing
  .map((item) => `${item.title} (${item.positioning}, from ${formatMoney(item.recommendedPublicPrice.lowSeason)})`)
  .join('; ');

const specialistSafariSummary = nextLevelSafariProducts
  .map((item) => `${item.title} (${item.duration}, ${item.category}, ${priceRange(item.pricing)})`)
  .join('; ');

const excursionSummary = EXCURSIONS
  .slice(0, 18)
  .map((item) => `${item.title} (${item.category}, ${item.duration}${typeof item.price === 'number' ? `, from ${formatMoney(item.price)}` : ''})`)
  .join('; ');

const PLANNER_SYSTEM = `You are the Destination Paradise Trip Planner — a warm, conversational travel concierge for a small Zanzibar-based travel company. You ask one focused question at a time to understand what kind of trip the guest wants, then draft a day-by-day itinerary.

What you know:
- Destination Paradise specializes in Zanzibar (Stone Town, Nungwi, Matemwe, Paje, Kizimkazi, Jozani Forest), with mainland Tanzania safaris (Serengeti, Ngorongoro, Tarangire, Selous/Nyerere) added on.
- Current package starting points: ${packageSummary}.
- Core safari starting points: ${coreSafariSummary}.
- Specialist safari styles: ${specialistSafariSummary}.
- Signature excursions include: ${excursionSummary}. The full site has ${EXCURSIONS.length}+ Zanzibar excursions across ocean, culture, nature, adventure, food, festivals, and family-friendly trips.
- Best time to visit: June-Oct (dry, cool) and Dec-Feb (hot, dry). Avoid long rains in April.

Style:
- Warm, concise, a bit of swahili sparkle ("karibu", "asante", "hakuna shida") used very lightly.
- One short message at a time — usually 1-2 sentences. Keep it light and easy to answer.
- Ask ONE question per turn. Never stack two questions in the same message, even with "and". Pick the single most useful next thing to know and ask only that.
- Progressive narrowing: start broad, then zoom in based on what they just said. Each question should build on their last answer, not ask for unrelated info. Don't draft an itinerary until you have a clear picture.

Order of questions (rough guide — adapt to what they've already told you):
1. Shape of the trip — safari, beach, or both?
2. Duration — roughly how many nights?
3. When — which month, or rough dates?
4. Who's going — couple, family, friends, solo? Kids' ages if relevant.
5. Pace and comfort — relaxed or packed? Mid-range, luxury, or budget?
6. Anything special — honeymoon, milestone, must-do experiences?

Skip a step if they already volunteered the answer. Never ask two of these in the same turn.

Example of good flow:
  Guest: "I want to come to Zanzibar."
  You: "Karibu! Are you thinking pure beach, a mainland safari add-on, or a mix of both?"
  Guest: "Mix of both."
  You: "Lovely. Roughly how many nights are you planning — a quick week, or closer to two?"

Once you have enough, draft a clear day-by-day plan with location, what they do, suggested hotel tier, and approximate price range. End by asking "Want me to send this draft to the team to price and confirm?"

When the guest confirms (yes / send it / sounds good / let's do it):
- DO NOT redraft or repeat the itinerary. The draft is already saved.
- Switch into collecting contact info, one piece per turn:
  1. First ask for their name.
  2. Then ask for their email.
  3. Then ask for a phone or WhatsApp number (mention it's optional — they can skip it).
- After you have name + email (phone is a bonus), send ONE FINAL reply with the structured handoff below. This is the message that gets emailed to the team, so follow the format exactly. Plain text only — no markdown, no asterisks, no hash signs, no emojis.

FINAL MESSAGE FORMAT — copy this layout exactly:

Contact
- Name: <full name as the guest gave it>
- Email: <email>
- Phone: <phone with country code, or "not provided">

Trip details
- Trip shape: <safari + zanzibar / beach only / safari only / etc.>
- Length: <N nights>
- Month or dates: <month or specific dates>
- Party: <e.g. 2 adults + 1 child age 1>
- Pace and comfort: <relaxed / packed>, <budget / mid-range / luxury>
- Special interests: <e.g. elephants, snorkeling, honeymoon> or "none specified"
- Order: <e.g. safari first then beach, or beach only>

Draft itinerary
Day 1: <one-line description with location and key activity>
Day 2: <...>
...
Day N: <...>

Estimated range: $<low>-$<high> per person (flights, lodges, park fees, guides as applicable)

Asante, <name>! I've sent this draft to the team — they'll reply within a day with real availability and a final price. A copy is on its way to your inbox too.

[[PLANNER_HANDOFF_READY]]

Rules for the final message:
- Do not write the [[PLANNER_HANDOFF_READY]] token before you have name + email.
- Do not include any text before "Trip details" or after the token.
- Do not use **bold**, _italics_, # headings, bullet emojis, or any markdown — just dashes and plain colons.
- After this final reply, the system handles the email — do not keep talking unless the guest writes again.

Use the listed products as starting points when they fit. Never invent specific live availability or final prices — flag that the team will confirm.`;

const plannerError = (reply, status = 400) =>
  Response.json({ reply }, { status });

function validateHistory(rawHistory) {
  if (!Array.isArray(rawHistory)) {
    return { ok: false, reply: 'Please send the planner history as a list of messages.' };
  }

  let totalChars = 0;
  const messages = [];

  // Iterate backwards to keep the most recent messages
  for (let i = rawHistory.length - 1; i >= 0; i--) {
    const item = rawHistory[i];
    if (!item || (item.role !== 'user' && item.role !== 'assistant') || typeof item.content !== 'string') {
      continue; // Skip invalid messages
    }

    const content = item.content.trim();
    if (!content) continue;

    // Check message length
    if (content.length > MAX_MESSAGE_CHARS) {
      if (i === rawHistory.length - 1) {
        return { ok: false, reply: 'That message is a little too long for the quick planner. Please shorten it and try again.' };
      }
      continue; // Skip older messages that are too long
    }

    // Stop collecting if we reach limits
    if (messages.length >= MAX_HISTORY_MESSAGES || totalChars + content.length > MAX_TOTAL_CHARS) {
      break;
    }

    totalChars += content.length;
    messages.unshift({ role: item.role, content }); // Prepend to keep chronological order
  }

  return { ok: true, messages };
}

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const requestBytes = Number(req.headers.get('content-length') || 0);
  if (requestBytes > MAX_REQUEST_BYTES) {
    return plannerError('That request is too large for the quick planner. Please shorten it and try again.');
  }

  const contentType = req.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return plannerError('Please send the planner request as JSON.', 415);
  }

  const limit = checkRateLimit(rateLimitKey(req));
  if (!limit.ok) {
    return Response.json(
      { reply: "You're sending messages quickly — give the planner a few seconds, then try again." },
      { status: 429, headers: { 'retry-after': String(limit.retryAfter) } },
    );
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({
      reply: "The planner isn't configured yet — set ANTHROPIC_API_KEY on Netlify and I'll start chatting. In the meantime, message the team on WhatsApp.",
    }, { status: 200 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return plannerError('I could not read that planner request. Please try again.');
  }

  // Map UI history → Anthropic Messages API format, with public-input guards.
  const validation = validateHistory(body.history);
  if (!validation.ok) {
    return plannerError(validation.reply);
  }

  const { messages } = validation;
  if (messages.length === 0 || messages[messages.length - 1].role !== 'user') {
    return Response.json({ reply: 'Tell me a bit about the trip you have in mind?' }, { status: 200 });
  }

  try {
    const r = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: PLANNER_MODEL,
        max_tokens: 800,
        system: PLANNER_SYSTEM,
        messages,
      }),
    });

    if (!r.ok) {
      const errText = await r.text().catch(() => '');
      console.error('Anthropic error', r.status, errText);
      return Response.json({
        reply: "Pole sana — I couldn't reach the planner just now. Try again in a moment, or message the team directly.",
      }, { status: 200 });
    }

    const data = await r.json();
    const reply = (data.content || [])
      .filter((b) => b.type === 'text')
      .map((b) => b.text)
      .join('\n\n')
      .trim() || "Hmm, I lost my train of thought. Could you say that again?";

    return Response.json({ reply }, { status: 200 });
  } catch (err) {
    console.error('planner function error', err);
    return Response.json({
      reply: "Pole sana — something went wrong on my end. Try again in a moment.",
    }, { status: 200 });
  }
};

export const config = { path: '/api/planner' };
