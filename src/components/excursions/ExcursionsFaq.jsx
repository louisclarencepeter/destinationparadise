import { Link } from 'react-router-dom';

const FAQS = [
  { q: 'Can you do private versions?', a: 'Yes — almost every excursion can run privately for your group. Pricing scales (Dream Dhow private from $320, Safari Blue private from $640). Just ask at booking.', open: true },
  { q: 'What if it rains?', a: 'We sail rain or shine — Indian Ocean rain is usually warm and brief. If conditions are unsafe (high winds, lightning), we postpone or refund in full. Your call.' },
  { q: 'Do you pick up from the north / east coast?', a: 'Yes — pickup from Nungwi, Kendwa, Matemwe, Kiwengwa, Pongwe, Paje and Bwejuu is included. Add 30–60 minutes each way to the day.' },
  { q: 'Is it OK during Ramadan?', a: 'Absolutely — all excursions run as normal. You may notice quieter mornings in town and many cafés closed during the day. Out on the water, life carries on. Be respectful with eating/drinking in public during fasting hours.' },
  {
    q: 'Can I combine these with a safari?',
    a: (
      <>Yes — most guests do. See our <Link to="/packages">Bush &amp; Beach package</Link> or open the <Link to="/trip-planner">AI Trip Planner</Link> for a custom mainland-and-island itinerary.</>
    ),
  },
  { q: "What's the tipping etiquette?", a: 'Tips are appreciated but never expected. As a guide: $5–10 per guest for a half-day excursion, $10–20 for a full day. Split between guide and crew.' },
];

export default function ExcursionsFaq() {
  return (
    <section className="exc-faq reveal">
      <div className="exc-faq__head">
        <span className="section-eyebrow">Common questions</span>
        <h2 className="section-title">Before you book</h2>
      </div>
      <div className="exc-faq__list">
        {FAQS.map((f) => (
          <details className="exc-faq__item" key={f.q} {...(f.open ? { open: true } : {})}>
            <summary>{f.q}</summary>
            <div className="exc-faq__body">{f.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
