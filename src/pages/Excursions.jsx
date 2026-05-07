import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/homepage.css';
import '../styles/excursions.css';
import { EXCURSIONS } from '../data/excursionsData.js';

const HERO_IMAGE = '/assets/images/excursions/dream-dhow-sunset.jpeg';
const CTA_IMAGE = '/assets/images/excursions/safari-blue-sandbank.jpg';

const CATEGORIES = ['Water', 'Culture', 'Nature'];

const PAIRS = [
  { combo: ['Jozani Forest', 'Spice Tour'], title: 'Forest & spice', desc: 'Red colobus monkeys in the morning, plantation walk and Swahili lunch in the afternoon. The classic nature-and-culture day, all done before sundown.', length: 'One day' },
  { combo: ['Spice Tour', 'Stone Town'], title: 'A full Stone Town day', desc: 'Spice plantation in the morning, lunch on the seafront, heritage walk through Stone Town in the afternoon. Home by 5pm with a head full of stories.', length: 'One day' },
  { combo: ['Dolphin Tour', 'Jozani Forest'], title: 'South-coast nature', desc: "Sunrise dolphins out of Kizimkazi, then a short drive to Jozani for the red colobus monkeys. Both done before 2pm. Lunch at a beachfront local spot on the way home.", length: 'One day' },
  { combo: ['Stone Town', 'Prison Island'], title: 'Tortoises & alleys', desc: "Heritage walk in the morning while it's still cool, boat to Changuu after lunch for the Aldabra tortoises. The two best half-days, stitched into one.", length: 'One day' },
  { combo: ['Snorkeling Tour', 'Mangroves'], title: 'Reef & mangrove', desc: 'A morning snorkel on the Blue Lagoon reef, then move to Chwaka Bay for the mangrove channels and a Swahili lunch in a fishing village.', length: 'One day' },
  { combo: ['Mnemba', 'Nungwi'], title: 'North-coast all-day', desc: "Snorkel the Mnemba coral ring at first light, then up to Nungwi for lunch and the afternoon — Zanzibar's clearest water and its widest beaches in a single day.", length: 'One long day' },
];

const TIMELINE = [
  ['07:30', 'Pickup', 'Air-conditioned van from your hotel. Coffee or tea in a thermos.'],
  ['08:30', 'Fumba jetty & boarding', 'Brief safety chat from the captain, life jackets fitted, sails up. The first hour is pure sailing.'],
  ['10:00', 'Mangrove channel swim', "Drop anchor in a hidden lagoon. The water is glassy and warm. Float, don't swim."],
  ['11:30', 'Snorkel stop, Kwale reef', 'Masks, fins, and roughly 45 minutes in the water. Parrotfish, butterflyfish, the occasional reef shark.'],
  ['13:00', 'Sandbank lunch', 'Catch of the day on the grill. Coconut rice, fresh salads, fruit. We sit on mats in the shade.'],
  ['14:30', 'Slow afternoon sail', "The wind shifts onshore. Most people sleep on deck. We don't rush."],
  ['16:00', 'Back at the jetty', 'Quick rinse, van back to the hotel. Home by 5, sun-tired and salt-crusted.'],
];

const PRACTICAL = [
  { h: "What's always included", icon: 'check', items: ['Hotel pickup & drop-off', 'Licensed local guide', 'Bottled water all day', 'All park & entry fees', 'Equipment (masks, fins, life jackets)'] },
  { h: 'Not included', icon: 'x', items: ['Tips for guides & crew', 'Alcohol on Dream Dhow ($15 add-on)', 'Travel insurance (please bring your own)', 'Spending money for markets/cafés'] },
  { h: 'Family-friendly', icon: 'check', items: ['Spice Tour & Prison Island — all ages', 'Safari Blue — kids 8+', 'Dolphins — confident swimmers, 10+', 'Children under 5 free on most trips'] },
  { h: 'Booking & payment', icon: 'clock', items: ['Book at least 48 hours ahead', '20% deposit, balance on the day', 'Free cancellation up to 24h before', 'USD, EUR, GBP, TZS — all accepted'] },
];

const FAQS = [
  { q: 'Can you do private versions?', a: 'Yes — every excursion can run privately for your group only. Pricing scales (Dream Dhow private from $320, Safari Blue private from $640). Just ask at booking.', open: true },
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

function Icon({ kind }) {
  if (kind === 'check') {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>;
  }
  if (kind === 'x') {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
  }
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>;
}

const PRICES = EXCURSIONS.map((e) => e.price).filter((p) => typeof p === 'number');
const minPrice = PRICES.length ? Math.min(...PRICES) : null;

const FILTERS = [
  { cat: 'all', label: 'All', count: EXCURSIONS.length },
  ...CATEGORIES.map((cat) => ({
    cat,
    label: cat,
    count: EXCURSIONS.filter((e) => e.category === cat).length,
  })),
];

export default function Excursions() {
  const pageRef = useRef(null);
  const [filter, setFilter] = useState('all');

  const visible = useMemo(
    () => (filter === 'all' ? EXCURSIONS : EXCURSIONS.filter((e) => e.category === filter)),
    [filter],
  );

  useEffect(() => {
    document.title = 'Zanzibar Excursions · Day Trips & Tours · Destination Paradise';
    const meta = document.querySelector('meta[name="description"]');
    const desc = 'Eight handpicked Zanzibar day trips — Safari Blue dhow, Stone Town heritage walk, Mnemba snorkel, Jozani Forest and more. Hotel pickup, small groups, local guides.';
    if (meta) {
      meta.setAttribute('content', desc);
    } else {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = desc;
      document.head.appendChild(m);
    }
  }, []);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return undefined;
    const items = root.querySelectorAll('.reveal:not(.is-visible)');
    if (items.length === 0) return undefined;
    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [visible]);

  return (
    <main className="excursions-page" ref={pageRef}>
      {/* HERO */}
      <section className="exc-hero">
        <div className="exc-hero__bg"><img src={HERO_IMAGE} alt="" /></div>
        <div className="exc-hero__inner">
          <span className="exc-hero__eyebrow">Zanzibar &amp; the coast · handpicked day trips</span>
          <h1 className="exc-hero__title">One island. <em>{EXCURSIONS.length} unforgettable journeys.</em></h1>
          <p className="exc-hero__lead">Trade resort routines for real Zanzibar — sail a traditional dhow, wander Stone Town with a local guide, snorkel Mnemba reefs, and spot red colobus in Jozani. Every trip is small-group, story-rich, and easy to book.</p>
          <div className="exc-hero__tags" aria-label="Excursion highlights">
            <span>Hotel pickup included</span>
            <span>Private options available</span>
            <span>Local expert guides</span>
          </div>
          <div className="exc-hero__row">
            <a className="btn btn--lg btn--accent" href="#list">Browse all excursions</a>
            <Link className="btn btn--ghost btn--lg" to="/trip-planner">Build my plan →</Link>
          </div>
          <div className="exc-hero__meta">
            <div><strong>{EXCURSIONS.length}</strong><span>Excursions</span></div>
            {minPrice !== null && <div><strong>${minPrice}</strong><span>From, per person</span></div>}
            <div><strong>4–10</strong><span>Group size</span></div>
            <div><strong>4.9★</strong><span>Tripadvisor</span></div>
          </div>
        </div>
      </section>

      {/* FILTER */}
      <div className="exc-filter">
        <span className="exc-filter__label">Filter by</span>
        {FILTERS.map((f) => (
          <button
            key={f.cat}
            type="button"
            data-cat={f.cat}
            className={`exc-filter__btn${filter === f.cat ? ' is-active' : ''}`}
            onClick={() => setFilter(f.cat)}
            aria-pressed={filter === f.cat}
          >
            {f.label} <span className="exc-filter__count">{f.count}</span>
          </button>
        ))}
      </div>

      {/* LIST */}
      <section className="exc-list" id="list">
        {visible.map((e, i) => (
          <article
            key={e.id}
            id={e.id}
            data-cat={e.category}
            className="exc-block reveal"
          >
            <div className="exc-block__img">
              <img src={e.image} alt={e.alt} loading="lazy" />
              <span className="exc-block__num">No. {String(i + 1).padStart(2, '0')}</span>
              <span className="exc-block__cat" data-cat={e.category}>{e.category}</span>
            </div>
            <div className="exc-block__body">
              <span className="exc-block__eyebrow">{e.eyebrow}</span>
              <h2 className="exc-block__title">{e.title}</h2>
              <p className="exc-block__desc">{e.intro}</p>
              <dl className="exc-block__facts">
                {e.facts.map(([dt, dd, sub]) => (
                  <div key={dt}><dt>{dt}</dt><dd>{dd}<small>{sub}</small></dd></div>
                ))}
              </dl>
              <div className="exc-block__cols">
                {e.cols.map((col) => (
                  <div className="exc-block__col" key={col.h}>
                    <h4>{col.h}</h4>
                    <ul>{col.items.map((it) => <li key={it}>{it}</li>)}</ul>
                  </div>
                ))}
              </div>
              <div className="exc-block__actions">
                {typeof e.price === 'number' ? (
                  <span className="exc-block__price">
                    ${e.price}
                    <small>{e.priceSub}</small>
                  </span>
                ) : (
                  <span className="exc-block__price-note">Price on request</span>
                )}
                {e.priceNote && <span className="exc-block__price-note">{e.priceNote}</span>}
                <Link className="btn btn--accent" to="/booking">Book this →</Link>
                {e.secondary && (
                  <a className="btn btn--ghost-dark" href={e.secondary.href}>{e.secondary.label}</a>
                )}
              </div>
            </div>
          </article>
        ))}
      </section>

      {/* PAIRINGS */}
      <section className="exc-pair reveal">
        <div className="exc-pair__head">
          <span className="section-eyebrow">Locals' picks</span>
          <h2 className="section-title">Combinations that work</h2>
          <p className="section-lead">Some excursions pair beautifully across one or two days. Here's how we'd sequence them.</p>
        </div>
        <div className="exc-pair__grid">
          {PAIRS.map((p) => (
            <article className="exc-pair__card" key={p.title}>
              <div className="exc-pair__combo">
                <span>{p.combo[0]}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
                <span>{p.combo[1]}</span>
              </div>
              <h3 className="exc-pair__title">{p.title}</h3>
              <p className="exc-pair__desc">{p.desc}</p>
              <div className="exc-pair__foot"><span>{p.length}</span><strong>{p.price || 'On request'}</strong></div>
            </article>
          ))}
        </div>
      </section>

      {/* TYPICAL DAY */}
      <section className="exc-day reveal" id="day">
        <div className="exc-day__head">
          <span className="section-eyebrow">Hour by hour</span>
          <h2 className="section-title">A typical Safari Blue day</h2>
          <p className="section-lead">Our most-booked excursion, minute by minute. Other days follow a similar rhythm — slower than you'd expect, longer in the good moments.</p>
        </div>
        <div className="exc-day__timeline">
          {TIMELINE.map(([t, h, p]) => (
            <div className="exc-day__row" key={t}>
              <div className="exc-day__time">{t}</div>
              <div className="exc-day__what"><strong>{h}</strong><p>{p}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* PRACTICAL */}
      <section className="exc-prac">
        <div className="exc-prac__grid">
          {PRACTICAL.map((col) => (
            <div className="exc-prac__col" key={col.h}>
              <h4>{col.h}</h4>
              <ul>
                {col.items.map((it) => (
                  <li key={it}><Icon kind={col.icon} />{it}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
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

      {/* CTA */}
      <section className="exc-cta">
        <div className="exc-cta__bg"><img src={CTA_IMAGE} alt="" /></div>
        <div className="exc-cta__inner">
          <h2>Ready to lock a date?</h2>
          <p>Tell us when you're here and which excursions caught your eye. We'll come back within 24 hours with available dates, pickup times and a final price — no commitment, no chatbot.</p>
          <div className="exc-cta__btns">
            <Link className="btn btn--lg btn--accent" to="/booking">Get in touch →</Link>
            <Link className="btn btn--ghost-light btn--lg" to="/trip-planner">Or chat with our AI planner</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
