import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/homepage.css';
import '../styles/excursions.css';
import '../styles/safaris.css';
import { ALL_SAFARI_PRODUCTS, INCLUDED_LIST, PARKS, SAFARI_TYPES } from '../data/safariPageData.js';

const safariImg = (file) => `/assets/images/safaris/${file}`;

const WILDLIFE_CATEGORIES = [
  {
    title: 'Big cats',
    sub: 'Predators',
    rowMod: 'cats',
    tiles: [
      { src: 'male-lion-in-grass.jpg', alt: 'Male lion lying in grass', cap: 'Male lion · Ngorongoro Crater', mod: 'wide' },
      { src: 'serval-in-grass.jpg', alt: 'Serval cat in grass', cap: 'Serval · rare daylight sighting' },
      { src: 'lion-cub-in-grass.jpg', alt: 'Lion cub in grass', cap: 'Cub · ten weeks old' },
      { src: 'lioness-and-cub-resting.jpg', alt: 'Lioness with cub resting', cap: 'Lioness & cub · evening rest', mod: 'wide' },
    ],
  },
  {
    title: 'Hooved giants',
    sub: 'The grazers',
    rowMod: 'ungulates',
    tiles: [
      { src: 'zebra-mare-and-foal.jpg', alt: 'Zebra mare and foal', cap: 'Zebra · mare and foal', mod: 'tall' },
      { src: 'zebra-herd-on-track.jpg', alt: 'Zebra herd on track', cap: 'The herd, deciding', mod: 'wide' },
      { src: 'wildebeest-grazing.jpg', alt: 'Blue wildebeest grazing', cap: 'Blue wildebeest' },
      { src: 'eland-grazing.jpg', alt: 'Eland grazing', cap: 'Eland · the largest antelope' },
      { src: 'eland-herd-plains.jpg', alt: 'Eland herd', cap: 'Eland herd · Ngorongoro', mod: 'wide' },
      { src: 'warthog-on-plains.jpg', alt: 'Warthog', cap: 'Warthog · Pumbaa, in person' },
    ],
  },
  {
    title: 'Heavyweights',
    sub: 'Big & rare',
    rowMod: 'heavy',
    tiles: [
      { src: 'buffalo-herd-close.jpg', alt: 'Cape buffalo herd close-up', cap: 'Cape buffalo · the dagga boys', mod: 'wide' },
      { src: 'buffalo-and-egret.jpg', alt: 'Buffalo with cattle egret', cap: 'Buffalo & egret · partners', mod: 'wide' },
      { src: 'rhino-on-plains.jpg', alt: 'Black rhino on plains', cap: 'Black rhino · <30 left in the crater', mod: 'full' },
    ],
  },
  {
    title: 'Birds',
    sub: '400+ species',
    rowMod: 'birds',
    tiles: [
      { src: 'crowned-crane-close.jpg', alt: 'Grey crowned crane close-up', cap: 'Grey crowned crane', mod: 'tall' },
      { src: 'crowned-cranes-in-grass.jpg', alt: 'Pair of crowned cranes', cap: 'The pair · always two' },
      { src: 'yellow-weaver-on-rail.jpg', alt: 'Yellow weaver on rail', cap: "Speke's weaver · lodge regular" },
      { src: 'raptor-on-log.jpg', alt: 'Lanner falcon on rock', cap: 'Lanner falcon · with prey', mod: 'wide' },
    ],
  },
];

const SEASONS = [
  {
    mod: 'peak',
    months: 'Jun · Jul · Aug · Sep · Oct',
    title: 'Dry & classic',
    blurb: 'Animals cluster at waterholes. The Mara River crossings happen July–September. Cool, golden grass, picture-postcard. Books out 6+ months ahead.',
    rating: '★★★★★',
  },
  {
    mod: 'good',
    months: 'Dec · Jan · Feb',
    title: 'Calving season',
    blurb: 'Wildebeest drop half a million calves on the southern Serengeti plains in February. Predator action peaks. Hot, but lush. Quieter parks.',
    rating: '★★★★☆',
  },
  {
    mod: 'shoulder',
    months: 'Nov · Mar',
    title: 'Green & cheap',
    blurb: 'Short rains. Skies are dramatic, parks empty, prices drop 20–30%. Birding peaks in November. Some bush roads can muddy.',
    rating: '★★★☆☆',
  },
  {
    mod: 'avoid',
    months: 'Apr · May',
    title: 'Long rains',
    blurb: 'Many camps close. Roads flood. Bargain-hunters only — and even then, we usually steer guests elsewhere this season.',
    rating: '★★☆☆☆',
  },
];

const SAFARI_COMPARISON = [
  { label: 'Best quick taste', pick: 'Tarangire Express Day Safari', slug: 'tarangire-day-trip', note: 'Lowest commitment, real mainland wildlife in one day.' },
  { label: 'Best short safari', pick: 'Ngorongoro Overnight', slug: 'ngorongoro-overnight', note: 'One night, high wildlife density, crater at first light.' },
  { label: 'Best first-timer route', pick: 'Ngorongoro & Tarangire', slug: 'ngorongoro-tarangire', note: 'Classic Big Five scenery plus elephants and baobabs.' },
  { label: 'Best migration focus', pick: 'Serengeti Migration', slug: 'serengeti-migration', note: 'For river-crossing season and big open-plains drama.' },
  { label: 'Best remote wilderness', pick: 'Nyerere, Ruaha, Katavi', slug: 'nyerere-selous', note: 'Fewer vehicles, wilder camps, stronger adventure feel.' },
  { label: 'Best premium add-on', pick: 'Mahale Chimp & Lake Tanganyika', slug: 'mahale-chimp', note: 'Rare chimp trekking with a lakefront finish.' },
];

const BOOKING_STEPS = [
  { step: '01', title: 'Choose a route', text: 'Start with a card, or send your dates and we’ll recommend the best safari for your budget.' },
  { step: '02', title: 'We price the real trip', text: 'We check flights, camp availability, park fees, and seasonality before sending the final quote.' },
  { step: '03', title: 'Deposit confirms it', text: 'Your deposit locks the flights, guide, camps, and transfers. The rest is paid before travel.' },
];

const minSafariPrice = Math.min(...ALL_SAFARI_PRODUCTS.map((itinerary) => itinerary.price));
const INITIAL_SAFARI_COUNT = 9;
const SAFARI_BATCH_COUNT = 9;

const SAFARI_FILTERS = [
  { key: 'all', label: 'All', match: () => true },
  {
    key: 'classic',
    label: 'Classic routes',
    match: (item) => ['Northern Circuit', 'Migration Safari', 'Last-minute Safari', 'Day Safari'].includes(item.category),
  },
  {
    key: 'southern',
    label: 'Southern parks',
    match: (item) => ['Southern Circuit', 'Quick Safari', 'Beach & Safari', 'Hiking & Nature'].includes(item.category),
  },
  {
    key: 'western',
    label: 'Western & remote',
    match: (item) => ['Western Circuit', 'Wildlife'].includes(item.category) || ['katavi-frontier', 'mahale-chimp', 'chimpanzee-trekking'].includes(item.id),
  },
  {
    key: 'short',
    label: '1-3 day trips',
    match: (item) => /1 Day|1 - 2 Days|1 - 3 Days|1 night|2 nights/i.test(item.duration),
  },
  {
    key: 'culture',
    label: 'Culture & nature',
    match: (item) => ['Culture', 'History & Safari', 'Nature & Culture', 'Nature & Adventure', 'Mountain Adventure'].includes(item.category),
  },
  {
    key: 'luxury',
    label: 'Luxury & private',
    match: (item) => ['Luxury', 'Luxury & Wellness', 'Ultra Luxury'].includes(item.category),
  },
  {
    key: 'special',
    label: 'Special interests',
    match: (item) => ['Photography', 'Birding', 'Adventure', 'Migration', 'Family'].includes(item.category),
  },
  {
    key: 'combo',
    label: 'Bush & beach',
    match: (item) => ['Combo', 'Beach & Safari', 'Multi Country'].includes(item.category),
  },
];

const safariFilters = SAFARI_FILTERS.map((filter) => ({
  ...filter,
  count: ALL_SAFARI_PRODUCTS.filter(filter.match).length,
}));

const FAQS = [
  {
    q: 'How many days do I need on safari?',
    a: 'Three nights is the absolute minimum and only worth it if you fly between parks. Five nights is the sweet spot. Anything over seven and you’ll start to crave the beach — which is why most guests pair safari with Zanzibar.',
    open: true,
  },
  {
    q: 'Is it safe to bring kids?',
    a: 'Yes — most camps welcome children 7+. We pick "family" lodges with pools and flexible game drives. For kids under 7, we suggest Tarangire (shorter drives, big elephant sightings) over Serengeti.',
  },
  {
    q: 'What about malaria?',
    a: 'Tanzania is a malaria area. Speak to your travel doctor about prophylaxis. Camps provide repellent, mosquito nets, and most have screened tents.',
  },
  {
    q: 'Big Five — guaranteed?',
    a: 'In the Ngorongoro Crater, you’ll usually tick four of five in a single day. Leopard is the wildcard — sometimes the same morning, sometimes never. We don’t promise sightings; the bush isn’t a zoo. We do promise we’ll work hard to find them.',
  },
  {
    q: 'What kind of camera should I bring?',
    a: 'A 200mm zoom minimum if you want frame-fillers. Most of our guests now shoot phones with a small clip-on telephoto and they do great. Bring a dust-blower — every camp’s nightmare is sand on the sensor.',
  },
  {
    q: 'Can I extend with Zanzibar?',
    a: 'Yes — and you should. We design every safari to flow into a beach stay. See our Bush & Beach package for a 10-night example.',
    extendLink: true,
  },
];

export default function Safaris() {
  const pageRef = useRef(null);
  const [filter, setFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(INITIAL_SAFARI_COUNT);

  const activeFilter = safariFilters.find((item) => item.key === filter) || safariFilters[0];
  const filteredSafaris = useMemo(
    () => ALL_SAFARI_PRODUCTS.filter(activeFilter.match),
    [activeFilter],
  );
  const visibleSafaris = useMemo(
    () => filteredSafaris.slice(0, visibleCount),
    [filteredSafaris, visibleCount],
  );
  const hasHiddenSafaris = visibleCount < filteredSafaris.length;

  useEffect(() => {
    setVisibleCount(INITIAL_SAFARI_COUNT);
  }, [filter]);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return undefined;

    const items = root.querySelectorAll('.reveal');

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
  }, [visibleSafaris]);


  return (
    <main className="safaris-page" ref={pageRef}>
      {/* HERO */}
      <section className="saf-hero">
        <div className="saf-hero__bg">
          <img src={safariImg('male-lion-in-grass.jpg')} alt="" />
        </div>
        <div className="saf-hero__inner">
          <span className="saf-hero__eyebrow">Mainland Tanzania · the heart of what we do</span>
          <h1 className="saf-hero__title">Where the wild things <em>still</em> are.</h1>
          <p className="saf-hero__lead">
            From the Serengeti’s rolling plains to the Ngorongoro Crater’s lost world, we run small-group safaris with the rangers, pilots, and lodge owners we’ve known for years. No bus tours. No half-truths. Just the bush, well done.
          </p>
          <div className="saf-hero__cta">
            <a className="btn btn--lg" href="#itineraries">Browse all safaris</a>
            <Link className="btn btn--ghost btn--lg" to="/trip-planner">Plan with AI →</Link>
          </div>
          <div className="saf-hero__stats">
            <div><strong>{ALL_SAFARI_PRODUCTS.length}</strong><span>Safaris</span></div>
            <div><strong>2.0M</strong><span>Wildebeest</span></div>
            <div><strong>${minSafariPrice.toLocaleString()}</strong><span>From, per person</span></div>
            <div><strong>3</strong><span>Safari circuits</span></div>
          </div>
        </div>
      </section>

      {/* ITINERARIES */}
      <section className="itineraries reveal" id="itineraries">
        <header className="itineraries__head">
          <span className="section-eyebrow">Suggested routes</span>
          <h2 className="section-title">Safaris — pick a starting point.</h2>
          <p className="section-lead">Every card opens into the full route or specialty experience, inclusions, and booking details. Tell us your dates and we’ll re-plot the camps and flights around you.</p>
        </header>

        <div className="exc-filter saf-filter">
          <span className="exc-filter__label">Filter by</span>
          {safariFilters.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`exc-filter__btn${filter === item.key ? ' is-active' : ''}`}
              onClick={() => setFilter(item.key)}
              aria-pressed={filter === item.key}
            >
              {item.label} <span className="exc-filter__count">{item.count}</span>
            </button>
          ))}
        </div>

        <div className="exc-grid saf-route-grid">
          {visibleSafaris.map((it) => (
            <Link
              key={it.id}
              to={`/safaris/${it.id}`}
              className="exc-card saf-route-card reveal"
              aria-label={`Explore ${it.title}`}
            >
              <div className="exc-card__img">
                <img src={it.image} alt={it.alt || it.title} loading="lazy" />
                <span className="exc-card__cat">{it.category}</span>
                {it.feature && <span className="exc-card__season">Most popular</span>}
                {it.productType && <span className="exc-card__season">{it.productType}</span>}
              </div>
              <div className="exc-card__body">
                <span className="exc-card__eyebrow">{it.rib}</span>
                <h3 className="exc-card__title">{it.title}</h3>
                <p className="exc-card__desc">{it.intro}</p>
                <div className="exc-card__meta">
                  <span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    {it.duration}
                  </span>
                  <span>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0z" /><circle cx="12" cy="10" r="3" /></svg>
                    {it.from}
                  </span>
                </div>
                <div className="exc-card__foot">
                  <span className="exc-card__price">From <strong>${it.price.toLocaleString()}</strong> {it.priceSub}</span>
                  <span className="exc-card__cta">Explore →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {visibleSafaris.length === 0 && (
          <p className="exc-grid__empty">No safaris in this filter yet. Try All.</p>
        )}
        {filteredSafaris.length > INITIAL_SAFARI_COUNT && (
          <div className="exc-grid__actions">
            {hasHiddenSafaris ? (
              <button
                type="button"
                className="btn btn--ghost btn--lg"
                onClick={() => setVisibleCount((count) => Math.min(count + SAFARI_BATCH_COUNT, filteredSafaris.length))}
              >
                Show more safaris
              </button>
            ) : (
              <button
                type="button"
                className="btn btn--ghost btn--lg"
                onClick={() => setVisibleCount(INITIAL_SAFARI_COUNT)}
              >
                Show fewer safaris
              </button>
            )}
            <span>{Math.min(visibleCount, filteredSafaris.length)} of {filteredSafaris.length} shown</span>
          </div>
        )}
      </section>

      {/* COMPARISON */}
      <section className="saf-compare reveal" id="choose">
        <header className="saf-compare__head">
          <span className="section-eyebrow">Not sure yet?</span>
          <h2 className="section-title">Choose by what you want most.</h2>
          <p className="section-lead">Most guests do not know the park names yet. Start with the outcome, then open the route that fits.</p>
        </header>
        <div className="saf-compare__grid">
          {SAFARI_COMPARISON.map((item) => (
            <Link className="saf-compare__card" key={item.label} to={`/safaris/${item.slug}`} aria-label={`Explore ${item.pick}`}>
              <span>{item.label}</span>
              <h3>{item.pick}</h3>
              <p>{item.note}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* WHAT'S INCLUDED */}
      <section className="included reveal">
        <div className="included__wrap">
          <div className="included__copy">
            <span className="section-eyebrow">What’s included</span>
            <h2 className="section-title">One price. Nothing surprise-charged.</h2>
            <p className="section-lead">We learnt a long time ago that "from $X" with twelve add-ons makes guests miserable. Our quotes include everything below.</p>
          </div>
          <ul className="included__list">
            {INCLUDED_LIST.map((item) => (
              <li key={item}><span>✓</span> {item}</li>
            ))}
          </ul>
        </div>
      </section>

      {/* BOOKING STEPS */}
      <section className="saf-steps reveal" id="booking-steps">
        <header className="saf-steps__head">
          <span className="section-eyebrow">How booking works</span>
          <h2 className="section-title">Three steps from idea to confirmed safari.</h2>
        </header>
        <div className="saf-steps__grid">
          {BOOKING_STEPS.map((item) => (
            <article className="saf-step" key={item.step}>
              <span>{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* INTRO */}
      <section className="saf-intro reveal">
        <div className="saf-intro__grid">
          <div className="saf-intro__copy">
            <span className="section-eyebrow">Our approach</span>
            <h2 className="section-title">Tanzania-bred guides who know the bush — and the islands.</h2>
            <p className="section-lead">
              We run the northern circuit — Serengeti, Ngorongoro, Tarangire — with bush flights so you spend more time on game drives and less in a Land Cruiser. Pair with a few days on Zanzibar’s coast, or stay pure bush. Every camp is hand-picked. Every guide is Silver-level certified or higher.
            </p>
          </div>
          <ul className="saf-intro__bullets">
            <li>
              <span className="saf-intro__num">01</span>
              <div>
                <strong>Small vehicles</strong>
                <p>Max 4 guests per Land Cruiser, every seat a window seat. No mini-buses.</p>
              </div>
            </li>
            <li>
              <span className="saf-intro__num">02</span>
              <div>
                <strong>Bush flights</strong>
                <p>Skip the 8-hour drive. Cessnas connect parks in under an hour.</p>
              </div>
            </li>
            <li>
              <span className="saf-intro__num">03</span>
              <div>
                <strong>Conservation fees built in</strong>
                <p>Park fees, ranger fees, community levies — never tacked on later.</p>
              </div>
            </li>
          </ul>
        </div>
      </section>

      {/* PARKS */}
      <section className="parks reveal" id="parks">
        <header className="parks__head">
          <span className="section-eyebrow">The Northern Circuit & beyond</span>
          <h2 className="section-title">Five parks. Each its own world.</h2>
        </header>
        <div className="parks__grid">
          {PARKS.map((park) => (
            <article className={`park-card${park.size === 'lg' ? ' park-card--lg' : ''}`} key={park.name}>
              <div className="park-card__img"><img src={park.image} alt="" loading="lazy" /></div>
              <div className="park-card__body">
                <div className="park-card__meta"><span>{park.label}</span><span>{park.area}</span></div>
                <h3>{park.name}</h3>
                <p>{park.blurb}</p>
                <ul className="park-card__tags">
                  {park.tags.map((tag) => <li key={tag}>{tag}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* WHEN TO GO */}
      <section className="when reveal" id="when">
        <header className="when__head">
          <span className="section-eyebrow">When to go</span>
          <h2 className="section-title">There’s no bad time. Just different ones.</h2>
        </header>
        <div className="when__grid">
          {SEASONS.map((s) => (
            <article className={`when-card when-card--${s.mod}`} key={s.title}>
              <div className="when-card__months">{s.months}</div>
              <h4>{s.title}</h4>
              <p>{s.blurb}</p>
              <span className="when-card__rating">{s.rating}</span>
            </article>
          ))}
        </div>
      </section>

      {/* SAFARI TYPES */}
      <section className="saf-types reveal" id="safari-types">
        <header className="saf-types__head">
          <span className="section-eyebrow">Ways to travel</span>
          <h2 className="section-title">Different safari styles for different travellers.</h2>
          <p className="section-lead">From classic game drives and fly-in circuits to walking, boat, family, and bush-beach combinations — we tailor each route to your travel style.</p>
          <ul className="saf-types__modes">
            <li>
              <span className="saf-types__mode-tag">Dedicated safari</span>
              Safari-only booking: arrive in Arusha and we’ll pick you up for the northern or southern circuit.
            </li>
            <li>
              <span className="saf-types__mode-tag saf-types__mode-tag--accent">Last-minute</span>
              Already on Zanzibar? We can run 1 day, 1 night, 2 nights, or longer safari options — fast.
            </li>
            <li>
              <span className="saf-types__mode-tag">In a package</span>
              Combined with hotels and excursions in one seamless itinerary.
            </li>
          </ul>
        </header>
        <div className="saf-types__grid">
          {SAFARI_TYPES.map((item) => (
            <Link className="saf-type-card" key={item.title} to={`/safaris/types/${item.id}`} aria-label={`Explore ${item.title}`}>
              <div className="saf-type-card__media">
                <img src={item.image} alt={item.alt} loading="lazy" />
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
              <div className="saf-type-card__foot">
                <span className="saf-type-card__meta">Best for: {item.bestFor}</span>
                <span className="saf-type-card__cta">Explore →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* WILDLIFE GALLERY */}
      <section className="wildlife reveal" id="wildlife">
        <header className="wildlife__head">
          <span className="section-eyebrow">From our last season</span>
          <h2 className="section-title">What you might see.</h2>
          <p className="section-lead">Real photos from real game drives, taken by our guides this past season — Ngorongoro and Serengeti, mostly. No stock library.</p>
        </header>

        {WILDLIFE_CATEGORIES.map((cat) => (
          <div className="wildlife__cat" key={cat.title}>
            <h3 className="wildlife__cat-title">
              <span>{cat.title}</span>
              <em>{cat.sub}</em>
            </h3>
            <div className={`wildlife__row wildlife__row--${cat.rowMod}`}>
              {cat.tiles.map((tile) => (
                <figure
                  className={`wildlife__tile${tile.mod ? ` wildlife__tile--${tile.mod}` : ''}`}
                  key={tile.src}
                >
                  <img src={safariImg(tile.src)} alt={tile.alt} loading="lazy" />
                  <figcaption>{tile.cap}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        ))}
      </section>

      {/* FAQ */}
      <section className="saf-faq reveal" id="faq">
        <header className="saf-faq__head">
          <span className="section-eyebrow">FAQs</span>
          <h2 className="section-title">The questions everyone asks.</h2>
        </header>
        <div className="saf-faq__list">
          {FAQS.map((faq) => (
            <details className="saf-faq__item" key={faq.q} {...(faq.open ? { open: true } : {})}>
              <summary>{faq.q}</summary>
              <div className="saf-faq__body">
                {faq.extendLink ? (
                  <>
                    Yes — and you should. We design every safari to flow into a beach stay. See our{' '}
                    <Link to="/packages">Bush &amp; Beach package</Link> for a 10-night example.
                  </>
                ) : faq.a}
              </div>
            </details>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="saf-cta">
        <div className="saf-cta__bg">
          <img src={safariImg('lioness-and-cub-resting.jpg')} alt="" />
        </div>
        <div className="saf-cta__inner">
          <h2>Ready to plan?</h2>
          <p>Tell us when you’re free, who’s coming, and what you’re hoping for. We’ll come back within 24 hours with a real itinerary and a real price.</p>
          <div className="saf-cta__btns">
            <Link className="btn btn--lg btn--accent" to="/booking">Get a quote →</Link>
            <Link className="btn btn--ghost-light btn--lg" to="/trip-planner">Or chat with our AI planner</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
