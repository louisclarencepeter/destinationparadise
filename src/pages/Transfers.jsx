import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CONTACT_INFO } from '../constants/contactInfo.js';
import { TRANSFER_PRODUCTS } from '../data/transferProducts.js';
import '../styles/homepage.css';
import '../styles/transfers.css';

const TRANSFER_ICONS = {
  plane: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 16 3 21l5-9-5-9 18 5-8 4 8 4Z" />
    </svg>
  ),
  coast: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19c4-6 9.5-10.5 16-13" />
      <path d="M5 13c2 1.5 4.5 2.2 7.2 2.1" />
      <path d="M13 6c.5 2.9 1.7 5.2 3.5 7" />
    </svg>
  ),
  north: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 19h18" />
      <path d="M5 19c2.4-5.8 6.1-9.7 11-11.8" />
      <path d="M16 7.2c2.5 2.1 3.6 5 3.2 8.8" />
      <path d="M10 11c1.6 1.3 3.5 2 5.8 2" />
    </svg>
  ),
  hotel: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  group: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
      <circle cx="9.5" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  vip: (
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 14.6 8.5 21 9.3l-4.7 4.5 1.2 6.2L12 17l-5.5 3 1.2-6.2L3 9.3l6.4-.8L12 3Z" />
    </svg>
  ),
};

const HOW_IT_WORKS = [
  {
    step: '01',
    title: 'Tell us your details',
    text: 'Share your flight number, arrival time, hotel name, and group size via WhatsApp or the booking form. We confirm within a few hours.',
  },
  {
    step: '02',
    title: 'We track your flight',
    text: 'Our drivers monitor your flight in real time. If it\'s early or delayed, we adjust — no waiting charges, no missed pickups.',
  },
  {
    step: '03',
    title: 'Seamless arrival',
    text: 'Your driver meets you at arrivals with a name board. Luggage loaded, AC on, you\'re at your hotel in 20–45 minutes.',
  },
];

const INCLUDED = [
  'Private transfer pricing by route',
  'Meet & greet with name board',
  'Flight tracking & delay monitoring',
  'Air-conditioned vehicle',
  'Luggage handling',
  'Bottled water on board for premium bookings',
  'Tourist-safe licensed drivers',
  'Hotel drop-off door-to-door',
  'WhatsApp support before arrival',
];

const FLEET = [
  {
    type: 'Standard Private',
    capacity: 'Reliable AC vehicle',
    desc: 'Best for practical airport and hotel transfers with meet & greet, flight tracking, luggage help, and door-to-door service.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 17h14l-1.5-5.5A2 2 0 0 0 15.6 10H8.4a2 2 0 0 0-1.9 1.5L5 17Z" />
        <path d="M7 17v2M17 17v2M6 14h12M8.5 10l1-3h5l1 3" />
        <circle cx="7.5" cy="17.5" r="1.5" />
        <circle cx="16.5" cy="17.5" r="1.5" />
      </svg>
    ),
  },
  {
    type: 'Premium SUV',
    capacity: 'Couples · families',
    desc: 'A more spacious, elevated transfer for honeymooners, beach-resort guests, safari clients, and travellers with extra luggage.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 16h18l-1.7-6.2A2.5 2.5 0 0 0 16.9 8H8.2a2.5 2.5 0 0 0-2.3 1.5L3 16Z" />
        <path d="M7 8l1-3h6.5l2.4 3M5 13h15M5 16v2M19 16v2" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
  },
  {
    type: 'VIP Concierge',
    capacity: 'Luxury arrival',
    desc: 'Fast-track support, private concierge handling, luxury vehicle, cold towels, refreshments, and a highly polished arrival.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="7" width="18" height="10" rx="2" />
        <path d="M7 7v10M11 7v10M3 12h18M17 7l2 5" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
  },
  {
    type: 'Group Transfer',
    capacity: '5 – 25 guests',
    desc: 'Minivans and coaster buses for families, wedding groups, corporate teams, and safari groups arriving together.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="4" width="16" height="13" rx="2" />
        <path d="M4 9h16M8 4v13M12 4v13M16 4v13M7 20h.01M17 20h.01" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
  },
];

const FAQS = [
  {
    q: 'How much does an airport transfer cost?',
    a: 'Private airport transfers start from $25 per vehicle to Stone Town, $45 per vehicle to Paje or Jambiani, and $50 per vehicle to Nungwi or Kendwa. Premium SUV, VIP concierge, group, and minivan rates are priced separately.',
    open: true,
  },
  {
    q: 'What if my flight is delayed?',
    a: "We track your flight in real time using the flight number you give us. Your driver will wait at no extra charge for delays up to 2 hours. For longer delays we'll adjust your booking and keep in touch via WhatsApp.",
  },
  {
    q: 'Can you pick me up from my hotel at 3am?',
    a: 'Yes. We operate 24 hours, 7 days a week. Early morning and late-night pickups are common — just give us the time when you book.',
  },
  {
    q: 'Do you cover the north coast (Nungwi, Kendwa)?',
    a: "Yes — we cover the entire island. Stone Town, Nungwi, Kendwa, Matemwe, Kiwengwa, Pongwe, Paje, Bwejuu, Jambiani, and everywhere in between.",
  },
  {
    q: 'Can you arrange transfers for a safari connection?',
    a: "Absolutely. If you're connecting a Zanzibar stay with a mainland safari, we coordinate the ferry port or Dar airport pickup and can arrange onward road transfer to Arusha or other safari hubs.",
  },
  {
    q: 'How do I pay?',
    a: 'We accept USD, EUR, GBP, and TZS. Standard private transfers can usually be paid on the day. Premium, VIP, group, and long-distance bookings may require a deposit to secure the vehicle and driver.',
  },
];

const WHATSAPP_TRANSFER_URL = CONTACT_INFO.whatsappUrl;

export default function Transfers() {
  useEffect(() => {
    document.title = 'Airport & Island Transfers · Zanzibar · Destination Paradise';
    const meta = document.querySelector('meta[name="description"]');
    const desc = 'Premium Zanzibar airport transfers, private hotel transfers, VIP concierge arrivals, and group transport from Destination Paradise. Meet & greet, flight tracking, AC vehicles, 24/7.';
    if (meta) {
      meta.setAttribute('content', desc);
    } else {
      const m = document.createElement('meta');
      m.name = 'description';
      m.content = desc;
      document.head.appendChild(m);
    }
  }, []);

  return (
    <main className="transfers-page">
      {/* HERO */}
      <section className="tr-hero">
        <div className="tr-hero__bg">
          <img
            src="/assets/images/home/mizingani-waterfront.webp"
            alt=""
            fetchpriority="high"
            loading="eager"
            decoding="sync"
          />
        </div>
        <div className="tr-hero__inner">
          <span className="tr-hero__eyebrow">Private airport · hotel · island transfers</span>
          <h1 className="tr-hero__title">
            Your first and last <em>impression of Zanzibar</em> — done right.
          </h1>
          <p className="tr-hero__lead">
            Pre-booked private transfers with airport meet & greet, AC vehicles, luggage help, and WhatsApp support from the moment you land.
          </p>
          <div className="tr-hero__cta">
            <a className="btn btn--lg" href="#transfer-types">See route pricing</a>
            <a className="btn btn--ghost btn--lg" href={WHATSAPP_TRANSFER_URL} target="_blank" rel="noreferrer">
              Book on WhatsApp →
            </a>
          </div>
          <div className="tr-hero__stats">
            <div><strong>From $25</strong><span>Per vehicle</span></div>
            <div><strong>Private</strong><span>Meet & greet</span></div>
            <div><strong>3 tiers</strong><span>Standard · Premium · VIP</span></div>
            <div><strong>24 / 7</strong><span>Flight tracking</span></div>
          </div>
        </div>
      </section>

      {/* TRANSFER TYPES */}
      <section className="tr-types" id="transfer-types">
        <header className="tr-types__head">
          <span className="section-eyebrow">Route pricing</span>
          <h2 className="section-title">Private transfers, priced clearly by route.</h2>
          <p className="section-lead">
            Lead with a private vehicle, then upgrade to Premium SUV or VIP concierge when the arrival should feel part of the holiday.
          </p>
        </header>
        <div className="tr-types__grid">
          {TRANSFER_PRODUCTS.map((type) => (
            <article className={`tr-card ${type.featured ? 'tr-card--feature' : ''}`} key={type.slug} id={type.slug}>
              <div className="tr-card__icon">{TRANSFER_ICONS[type.icon]}</div>
              <div className="tr-card__body">
                <span className="tr-card__sub">{type.duration}</span>
                <h3 className="tr-card__title">{type.title}</h3>
                <p className="tr-card__desc">{type.description}</p>
                <ul className="tr-card__pricing">
                  {type.pricing.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
                <ul className="tr-card__details">
                  {type.details.map((d) => (
                    <li key={d}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                      {d}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="tr-card__foot">
                <span className="tr-card__price">{type.priceSummary}</span>
                <Link
                  className="btn btn--accent"
                  to={`/booking?type=transfer&item=${type.slug}#booking-details`}
                >
                  Book this transfer
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="tr-how">
        <header className="tr-how__head">
          <span className="section-eyebrow">How it works</span>
          <h2 className="section-title">Three steps from landing to check-in.</h2>
        </header>
        <div className="tr-how__steps">
          {HOW_IT_WORKS.map((item) => (
            <article className="tr-step" key={item.step}>
              <span className="tr-step__num">{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* INCLUDED */}
      <section className="tr-included">
        <div className="tr-included__wrap">
          <div className="tr-included__copy">
            <span className="section-eyebrow">What's included</span>
            <h2 className="section-title">An arrival service, not just transport.</h2>
            <p className="section-lead">
              Guests are buying certainty: a driver who is already there, support if a flight changes, and a calm first impression of Zanzibar.
            </p>
            <a
              className="btn btn--accent btn--lg"
              href="#transfer-types"
            >
              Choose a route →
            </a>
          </div>
          <ul className="tr-included__list">
            {INCLUDED.map((item) => (
              <li key={item}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* FLEET */}
      <section className="tr-fleet">
        <header className="tr-fleet__head">
          <span className="section-eyebrow">Service tiers</span>
          <h2 className="section-title">Standard, Premium, or VIP arrival.</h2>
          <p className="section-lead">
            Match the transfer to the guest: practical private comfort, upgraded arrival style, or full concierge handling.
          </p>
        </header>
        <div className="tr-fleet__grid">
          {FLEET.map((v) => (
            <article className="tr-vehicle" key={v.type}>
              <span className="tr-vehicle__icon">{v.icon}</span>
              <h3 className="tr-vehicle__type">{v.type}</h3>
              <span className="tr-vehicle__cap">{v.capacity}</span>
              <p>{v.desc}</p>
            </article>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="tr-faq">
        <header className="tr-faq__head">
          <span className="section-eyebrow">FAQs</span>
          <h2 className="section-title">Before you book.</h2>
        </header>
        <div className="tr-faq__list">
          {FAQS.map((faq) => (
            <details className="tr-faq__item" key={faq.q} {...(faq.open ? { open: true } : {})}>
              <summary>{faq.q}</summary>
              <div className="tr-faq__body">{faq.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="tr-cta">
        <div className="tr-cta__bg">
          <img src="/assets/images/home/stone-town-waterfront.webp" alt="" loading="lazy" />
          <div className="tr-cta__overlay" />
        </div>
        <div className="tr-cta__inner">
          <span className="section-eyebrow">Ready to book?</span>
          <h2>Tell us your route. We'll match the right vehicle.</h2>
          <p>
            Share your flight, hotel, guest count, and luggage needs on WhatsApp. We'll confirm the best private, premium, or VIP option.
          </p>
          <div className="tr-cta__btns">
            <a
              className="btn btn--lg btn--accent"
              href={WHATSAPP_TRANSFER_URL}
              target="_blank"
              rel="noreferrer"
            >
              Book on WhatsApp →
            </a>
            <Link className="btn btn--ghost-light btn--lg" to="/booking?type=transfer#booking-details">
              Use the booking form
            </Link>
          </div>
          <div className="tr-cta__contacts">
            <a href={`tel:${CONTACT_INFO.phones[0]}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.35 1.9.66 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.31 1.84.53 2.8.66A2 2 0 0 1 22 16.92Z" /></svg>
              +255 768 779 517
            </a>
            <a href={`tel:${CONTACT_INFO.phones[1]}`}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.35 1.9.66 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.31 1.84.53 2.8.66A2 2 0 0 1 22 16.92Z" /></svg>
              +255 748 352 657
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
