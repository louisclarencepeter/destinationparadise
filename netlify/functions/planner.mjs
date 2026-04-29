// AI Trip Planner — Netlify Function backed by the Anthropic API.
//
// Set ANTHROPIC_API_KEY in the Netlify site environment.
// The frontend calls /api/planner (rewritten to this function via netlify.toml).

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

export default async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json({
      reply: "The planner isn't configured yet — set ANTHROPIC_API_KEY on Netlify and I'll start chatting. In the meantime, message the team on WhatsApp.",
    }, { status: 200 });
  }

  let body;
  try { body = await req.json(); } catch { body = {}; }
  const history = Array.isArray(body.history) ? body.history : [];

  // Map UI history → Anthropic Messages API format
  const messages = history
    .filter((m) => m && (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string')
    .map((m) => ({ role: m.role, content: m.content }));

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
        model: 'claude-haiku-4-5',
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
