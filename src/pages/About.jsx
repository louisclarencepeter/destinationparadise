import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ResponsiveImage from '../components/ResponsiveImage.jsx';
import '../styles/homepage.css';
import '../styles/about.css';

const HERO_IMAGE = '/assets/images/safaris/crowned-cranes-in-grass.webp';
const STORY_IMAGE = '/assets/images/excursions/trips/dhow-heritage.webp';
const CTA_IMAGE = '/assets/images/excursions/dream-dhow-sunset.webp';

const TIMELINE = [
  {
    year: 'Where it began',
    title: 'A vision on the east coast of Zanzibar',
    body: 'Years ago, while working in a hotel on the east coast of Zanzibar, the first idea appeared — to create something bigger than just tours or bookings. Something that would connect people to the beauty, culture and spirit of Tanzania. At the time it felt too big and too far away, but it never disappeared.',
  },
  {
    year: 'The first steps',
    title: 'Built together with family',
    body: 'The company was registered together with family — the very first foundation of what would later become Destination Paradise. After a deep loss in those early days, everything slowed down. But the vision remained alive.',
  },
  {
    year: 'The quiet years',
    title: 'A dream that kept growing',
    body: 'Through years of work, travel and other projects, the dream continued to grow little by little. What had once been written on a piece of paper kept asking to be built — patiently, in the background, waiting for its moment.',
  },
  {
    year: 'A new chapter',
    title: 'Building the platform from the ground up',
    body: 'Moving to Germany opened a new chapter — learning coding, web development and media production, and gathering the technical skills needed to build the platform from the ground up. Slowly, an idea on paper became a real company with a real vision.',
  },
  {
    year: 'Today',
    title: 'Officially launching from Unguja',
    body: 'After years of preparation, Destination Paradise is officially launching. We begin our journey in Unguja, Zanzibar and across mainland Tanzania — with Pemba and Mafia Island to follow.',
  },
];

const PILLARS = [
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="3" /><circle cx="17" cy="11" r="3" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /><path d="M14 21v-1a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v1" /></svg>
    ),
    title: 'Local drivers and guides',
    body: 'We work hand-in-hand with drivers and guides from across the islands and mainland — the people who actually know the roads, the reefs and the stories.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M5 21V8l7-5 7 5v13" /><path d="M9 21v-6h6v6" /></svg>
    ),
    title: 'Local hotels and restaurants',
    body: 'We partner with locally owned hotels and restaurants wherever we can. Travel money stays in the community that hosts you.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="18" r="2.5" /><circle cx="12" cy="12" r="2.5" /><path d="M8 7l3 4M16 7l-3 4M8 17l3-4M16 17l-3-4" /></svg>
    ),
    title: 'A network, not a closed system',
    body: 'Instead of building a closed operation, we are building a network — one that allows the wider community to grow together with us, step by step.',
  },
  {
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 7l8 5 8-5-8-5z" /><path d="M4 12l8 5 8-5" /><path d="M4 17l8 5 8-5" /></svg>
    ),
    title: 'Authentic, designed by hand',
    body: 'Every excursion, safari and cultural experience is designed carefully — so travellers meet Tanzania in a more authentic and meaningful way.',
  },
];

const DESTINATIONS = [
  { tag: 'Available now', name: 'Unguja, Zanzibar', body: 'Where the journey begins. Excursions, cultural experiences and trips across the main island.' },
  { tag: 'Available now', name: 'Mainland Tanzania', body: 'The Serengeti, Ngorongoro, Kilimanjaro and beyond — the wider story of Tanzania, ready to be explored.' },
  { tag: 'Next', name: 'Pemba Island', body: "Zanzibar's quieter sister — untouched reefs, clove forests, and a slower pace just across the channel." },
  { tag: 'Next', name: 'Mafia Island', body: 'A marine park with whale sharks, turtles and some of the most pristine waters on the East African coast.' },
];

export default function About() {
  const pageRef = useRef(null);

  useEffect(() => {
    document.title = 'About Us · Destination Paradise';
    const meta = document.querySelector('meta[name="description"]');
    const desc = "Destination Paradise was born from a dream — to share the beauty, culture and spirit of Tanzania. Now officially launching in Unguja, Zanzibar, with Pemba, Mafia Island and the mainland to come.";
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
    }, { threshold: 0.12 });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const root = pageRef.current;
    if (!root) return undefined;
    const timeline = root.querySelector('.ab-timeline');
    const wrap = root.querySelector('.ab-timeline__photo-wrap');
    const photo = wrap?.querySelector('.ab-timeline__photo');
    if (!timeline || !wrap || !photo) return undefined;

    const desktopMQ = window.matchMedia('(min-width: 981px)');
    const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
    let raf = 0;

    function tick() {
      raf = 0;
      if (!desktopMQ.matches || reduceMQ.matches) {
        wrap.classList.remove('js-pin');
        wrap.style.removeProperty('--pin-y');
        return;
      }
      wrap.classList.add('js-pin');
      const rect = timeline.getBoundingClientRect();
      const navH = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 66;
      const offset = navH + 24;
      const maxY = Math.max(0, wrap.offsetHeight - photo.offsetHeight);
      const y = Math.max(0, Math.min(offset - rect.top, maxY));
      wrap.style.setProperty('--pin-y', `${y}px`);
    }

    function schedule() {
      if (raf) return;
      raf = requestAnimationFrame(tick);
    }

    tick();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });
    const onMQ = () => schedule();
    desktopMQ.addEventListener?.('change', onMQ);
    reduceMQ.addEventListener?.('change', onMQ);

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      desktopMQ.removeEventListener?.('change', onMQ);
      reduceMQ.removeEventListener?.('change', onMQ);
      wrap.classList.remove('js-pin');
      wrap.style.removeProperty('--pin-y');
    };
  }, []);

  return (
    <main className="about-page" ref={pageRef}>
      {/* HERO */}
      <section className="ab-hero" id="ab-top">
        <div className="ab-hero__bg">
          <ResponsiveImage src={HERO_IMAGE} alt="Crowned cranes in long grass at dawn" fetchpriority="high" loading="eager" decoding="sync" />
        </div>
        <div className="ab-hero__inner">
          <span className="ab-hero__eyebrow">About Destination Paradise</span>
          <h1 className="ab-hero__title">A vision, <em>finally</em> taking its first journey.</h1>
          <p className="ab-hero__lead">Destination Paradise was born from a dream — to connect people to the beauty, culture and spirit of Tanzania. After years of preparation, we are officially launching from Unguja, Zanzibar.</p>
          <div className="ab-hero__stats">
            <div><strong><em>Now</em></strong><span>Unguja</span></div>
            <div><strong><em>Now</em></strong><span>Mainland</span></div>
            <div><strong>Next</strong><span>Pemba</span></div>
            <div><strong>Next</strong><span>Mafia Island</span></div>
          </div>
        </div>
      </section>

      {/* OUR STORY */}
      <section className="ab-story reveal" id="story">
        <div className="ab-story__head">
          <div>
            <span className="ab-story__eyebrow">Our Story</span>
            <h2 className="ab-story__title">It started with a <em>dream</em>, far from home.</h2>
          </div>
          <div className="ab-story__lead">
            <p>Destination Paradise began as an idea on a piece of paper — and a quiet promise to a place that had given so much. Years ago, while working in a hotel on the east coast of Zanzibar, the first vision appeared. It would take many turns, and many years, before it could become something real.</p>
            <p>What you see today is the result of patience, family, loss, learning and a refusal to let the idea go. We are a young company with a long story behind us — and we are only just getting started.</p>
          </div>
        </div>

        <div className="ab-timeline">
          <div className="ab-timeline__rail">
            {TIMELINE.map((t, i) => (
              <div className="ab-tl-item reveal" key={t.year} style={{ transitionDelay: `${i * 80}ms` }}>
                <div className="ab-tl-item__year">{t.year}</div>
                <h4>{t.title}</h4>
                <p>{t.body}</p>
              </div>
            ))}
          </div>
          <div className="ab-timeline__photo-wrap">
            <div className="ab-timeline__photo">
              <ResponsiveImage src={STORY_IMAGE} alt="A traditional dhow on the Zanzibar coast" loading="lazy" />
              <div className="ab-timeline__caption">From an idea on paper to a real company — Zanzibar, where it all began.</div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="ab-numbers ab-mission" id="mission">
        <div className="ab-mission__inner">
          <span className="ab-mission__eyebrow">Our Mission</span>
          <h2 className="ab-mission__statement">To show the world how beautiful <em>Tanzania</em> truly is.</h2>
          <p className="ab-mission__sub">Simple, and the same as it was on that first piece of paper — every island, every coast, every corner of the mainland has a story worth meeting in person.</p>
        </div>
      </section>

      {/* COMMUNITY / NETWORK */}
      <section className="ab-sus reveal" id="community">
        <div className="ab-sus__inner">
          <div className="ab-sus__head">
            <div>
              <span className="ab-story__eyebrow ab-sus__eyebrow">Community</span>
              <h2>Built as a <em>network</em>, not a closed system.</h2>
            </div>
            <p>Destination Paradise is not only about travel. We believe tourism should also create real opportunities for the people who host you. From day one we are working hand-in-hand with local drivers, guides, hotels, restaurants and service providers — building something the wider community grows with, not around.</p>
          </div>

          <div className="ab-sus__grid">
            <div className="ab-sus__pillars">
              {PILLARS.map((p, i) => (
                <div className="ab-pillar reveal" key={p.title} style={{ transitionDelay: `${i * 90}ms` }}>
                  <div className="ab-pillar__icon">{p.icon}</div>
                  <h4>{p.title}</h4>
                  <p>{p.body}</p>
                </div>
              ))}
            </div>

            <aside className="ab-sus__quote">
              <p className="ab-sus__quote-text">&ldquo;Every destination has a story. Every island has its own culture, energy and hidden beauty waiting to be experienced.</p>
              <p className="ab-sus__quote-text">This wasn&rsquo;t built for scale. It was built for the moments — a slow morning at the reef, a story told in the back of a Land Cruiser, the first time you see the Serengeti go quiet at dusk.</p>
              <p className="ab-sus__quote-text">We hope, in time, you&rsquo;ll have a story of your own to add.&rdquo;</p>
              <div className="ab-sus__quote-who">
                <img
                  className="ab-sus__quote-avatar"
                  src="/assets/images/aboutus/louis-peter-portrait-144.webp"
                  alt="Louis Peter, founder of Destination Paradise"
                  width="48"
                  height="48"
                  loading="lazy"
                  decoding="async"
                />
                <div>
                  <strong>From our founding note</strong>
                  <span>Destination Paradise · 2026</span>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* DESTINATIONS */}
      <section className="ab-press reveal" id="destinations">
        <div className="ab-press__head">
          <div>
            <span className="ab-story__eyebrow">Where we go</span>
            <h2>From Unguja, <em>outward</em>.</h2>
          </div>
          <p>We begin in Unguja, Zanzibar — the place this journey started — and across mainland Tanzania, where the wider story unfolds. Pemba and Mafia Island will follow, each in the time it deserves.</p>
        </div>

        <div className="ab-dest__grid">
          {DESTINATIONS.map((d, i) => (
            <article className="ab-dest reveal" key={d.name} style={{ transitionDelay: `${i * 90}ms` }}>
              <span className="ab-dest__tag">{d.tag}</span>
              <h3 className="ab-dest__name">{d.name}</h3>
              <p className="ab-dest__body">{d.body}</p>
            </article>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="ab-cta">
        <div className="ab-cta__bg"><ResponsiveImage src={CTA_IMAGE} alt="" loading="lazy" /></div>
        <div className="ab-cta__inner">
          <span className="ab-story__eyebrow ab-cta__eyebrow">Karibu</span>
          <h2>Welcome to <em>Destination Paradise</em>.</h2>
          <p>To everyone who supported this journey from the beginning — thank you. And to everyone joining us now: the vision is big, the journey is long, and we are so glad you are here at the start.</p>
          <div className="ab-cta__btns">
            <Link className="btn btn--lg btn--accent" to="/booking">Plan your journey →</Link>
            <Link className="btn btn--ghost-light btn--lg" to="/excursions">See our excursions</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
