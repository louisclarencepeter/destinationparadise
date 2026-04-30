// AI Trip Planner — Netlify Function backed by the Anthropic API.
//
// Set ANTHROPIC_API_KEY in the Netlify site environment.
// The frontend calls /api/planner (rewritten to this function via netlify.toml).

const PLANNER_MODEL = 'claude-3-5-haiku-20241022';
const MAX_REQUEST_BYTES = 20_000;
const MAX_HISTORY_MESSAGES = 16;
const MAX_MESSAGE_CHARS = 1_200;
const MAX_TOTAL_CHARS = 6_000;

const PLANNER_SYSTEM = `You are the Destination Paradise Trip Planner — a warm, conversational travel concierge for a small Zanzibar-based travel company. You ask thoughtful, focused questions one or two at a time to understand what kind of trip the guest wants, then draft a day-by-day itinerary.

What you know:
- Destination Paradise specializes in Zanzibar (Stone Town, Nungwi, Matemwe, Paje, Kizimkazi, Jozani Forest), with mainland Tanzania safaris (Serengeti, Ngorongoro, Tarangire, Selous/Nyerere) added on.
- Signature excursions: Safari Blue Dhow, Stone Town Heritage Walk, Spice & Culture Tour, Dream Dhow Sunset, Dolphin Snorkeling, Prison Island.
- Packages exist as starting points: Island Essentials (7nt, $2,490), Bush & Beach (10nt, $5,790), Honeymoon Hideaway (5nt, $3,180).
- Best time to visit: June-Oct (dry, cool) and Dec-Feb (hot, dry). Avoid long rains in April.

Style:
- Warm, concise, a bit of swahili sparkle ("karibu", "asante", "hakuna shida") used very lightly.
- One short message at a time — usually 2-4 sentences. Do NOT dump huge itineraries until you have asked at least 3-4 questions about pace, dates, budget, party size, and interests.
- Once you have enough, draft a clear day-by-day plan with location, what they do, suggested hotel tier, and approximate price range. End by saying "Want me to send this draft to the team to price and confirm?"
- Never invent specific live availability or final prices — flag that the team will confirm.`;

const plannerError = (reply, status = 400) =>
  Response.json({ reply }, { status });

function validateHistory(rawHistory) {
  if (!Array.isArray(rawHistory)) {
    return { ok: false, reply: 'Please send the planner history as a list of messages.' };
  }

  if (rawHistory.length > MAX_HISTORY_MESSAGES) {
    return { ok: false, reply: 'That conversation is getting a little long. Please start over or send a shorter summary.' };
  }

  let totalChars = 0;
  const messages = [];

  for (const item of rawHistory) {
    if (!item || (item.role !== 'user' && item.role !== 'assistant') || typeof item.content !== 'string') {
      return { ok: false, reply: 'One of the planner messages was not in a format I can use. Please try again.' };
    }

    const content = item.content.trim();
    if (!content) continue;

    if (content.length > MAX_MESSAGE_CHARS) {
      return { ok: false, reply: 'That message is a little too long for the quick planner. Please shorten it and try again.' };
    }

    totalChars += content.length;
    if (totalChars > MAX_TOTAL_CHARS) {
      return { ok: false, reply: 'That conversation is a little too long for the quick planner. Please start over with a shorter summary.' };
    }

    messages.push({ role: item.role, content });
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
