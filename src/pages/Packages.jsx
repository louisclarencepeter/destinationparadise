import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { destinationParadisePackages } from '../data/destinationParadisePackages.js';
import { uniqueProductImages } from '../utils/productImages.js';
import ResponsiveImage from '../components/ResponsiveImage.jsx';
import '../styles/homepage.css';
import '../styles/excursions.css';
import '../styles/safaris.css';

const PACKAGE_IMAGES = {
  'six-day-safari-zanzibar-escape': '/assets/images/safaris/eland-herd-plains.webp',
  'seven-day-honeymoon-safari-zanzibar': '/assets/images/safaris/lioness-and-cub-resting.webp',
  'eight-day-tanzania-parks-zanzibar': '/assets/images/safaris/zebra-herd-on-track.webp',
  'nine-day-safari-zanzibar-culture': '/assets/images/excursions/stone-town-old-fort.webp',
  'ten-day-classic-safari-zanzibar': '/assets/images/safaris/rhino-on-plains.webp',
  'twelve-day-serengeti-zanzibar': '/assets/images/safaris/wildebeest-grazing.webp',
  'fourteen-day-ultimate-tanzania-zanzibar': '/assets/images/safaris/male-lion-in-grass.webp',
  'two-day-fly-in-safari-zanzibar': '/assets/images/safaris/buffalo-and-egret.webp',
  'three-day-serengeti-fly-in-safari': '/assets/images/safaris/zebra-mare-and-foal.webp',
  'kilimanjaro-safari-zanzibar-expedition': '/assets/images/safaris/warthog-on-plains.webp',
  'luxury-family-safari-zanzibar': '/assets/images/safaris/lion-cub-in-grass.webp',
  'great-migration-luxury-package': '/assets/images/safaris/serval-in-grass.webp',
  'zanzibar-adventure-marine-package': '/assets/images/excursions/dolphin-snorkeling.webp',
  'stone-town-culture-experience': '/assets/images/excursions/spice-tour-nutmeg.webp',
  'digital-nomad-zanzibar-stay': '/assets/images/home/mizingani-waterfront.webp',
};

const imgForPackage = (pkg) => {
  if (PACKAGE_IMAGES[pkg.slug]) return PACKAGE_IMAGES[pkg.slug];
  const { category } = pkg;
  if (/safari|multi/i.test(category)) return '/assets/images/safaris/raptor-on-log.webp';
  if (/honeymoon|romantic|wedding|miodowy|romantycz/i.test(category)) return '/assets/images/home/stone-town-waterfront.webp';
  if (/family|festival|digital|rodzin/i.test(category)) return '/assets/images/excursions/prison-island-tortoise.webp';
  if (/luxury|wellness|creator|luksus|premium/i.test(category)) return '/assets/images/safaris/eland-grazing.webp';
  if (/adventure|przyg/i.test(category)) return '/assets/images/excursions/dolphin-snorkeling.webp';
  return '/assets/images/home/stone-town-waterfront.webp';
};

const priceLabel = (pricing) => {
  const from = `$${pricing.from.toLocaleString()}`;
  if (pricing.to) return `${from} - $${pricing.to.toLocaleString()}`;
  return from;
};

const categoryText = (pkg) => `${pkg.category} ${pkg.title} ${(pkg.idealFor || []).join(' ')} ${(pkg.includes || []).join(' ')}`;

export const PACKAGES = uniqueProductImages(destinationParadisePackages.map((pkg) => ({
  ...pkg,
  id: pkg.slug,
  image: imgForPackage(pkg),
  from: pkg.category,
  price: pkg.pricing.from,
  priceLabel: priceLabel(pkg.pricing),
  priceSub: pkg.pricing.unit || 'za osobę',
  description: pkg.split || pkg.focus || pkg.includes.slice(0, 4).join(' · '),
})), { scope: 'Package' });

const FILTERS = [
  { key: 'all', label: 'Wszystkie', match: () => true },
  { key: 'safari', label: 'Safari + plaża', match: (pkg) => /safari|serengeti|migration|migrac|tanzania|parki|plaż/i.test(categoryText(pkg)) },
  { key: 'honeymoon', label: 'Podróż poślubna', match: (pkg) => /honeymoon|couples|miodow|para|romantycz/i.test(categoryText(pkg)) },
  { key: 'fly-in', label: 'Safari fly-in', match: (pkg) => /fly-in|return flight|domestic flight|przelot|lot/i.test(categoryText(pkg)) },
  { key: 'luxury', label: 'Luksus', match: (pkg) => /luxury|premium|vip|luksus|migrac/i.test(categoryText(pkg)) },
  { key: 'family', label: 'Rodzina', match: (pkg) => /family|children|rodzin|dzie/i.test(categoryText(pkg)) },
  { key: 'kilimanjaro', label: 'Kilimandżaro', match: (pkg) => /kilimanjaro|kilimand|machame|mountain|gór/i.test(categoryText(pkg)) },
  { key: 'culture', label: 'Kultura', match: (pkg) => /culture|kultur|stone town|spice|przypraw|swahili/i.test(categoryText(pkg)) },
  { key: 'marine', label: 'Ocean', match: (pkg) => /marine|ocean|diving|nurk|snorkeling|mnemba|dolphin|delfin/i.test(categoryText(pkg)) },
  { key: 'tailor', label: 'Szyte na miarę', match: (pkg) => /tailor|nomad|long-term|remote workers|zdaln|dłuższy/i.test(categoryText(pkg)) },
];

const packageFilters = FILTERS.map((filter) => ({
  ...filter,
  count: PACKAGES.filter(filter.match).length,
}));

const minPackagePrice = Math.min(...PACKAGES.map((pkg) => pkg.price));
const INITIAL_PACKAGE_COUNT = 6;
const PACKAGE_BATCH_COUNT = 6;

const PACKAGE_MATCHES = [
  { label: 'Najlepszy pakiet na start', pick: '6 dni safari i Zanzibar', slug: 'six-day-safari-zanzibar-escape', note: 'Najprostszy sposób, by połączyć prawdziwe safari na lądzie z czasem na plaży.' },
  { label: 'Najlepszy honeymoon', pick: '7 dni: safari poślubne i Zanzibar', slug: 'seven-day-honeymoon-safari-zanzibar', note: 'Romantyczne lodge, resort przy plaży, rejs dhow, kolacja przy świecach i dni safari.' },
  { label: 'Najpełniejsza klasyka', pick: '10 dni klasycznego safari i Zanzibaru', slug: 'ten-day-classic-safari-zanzibar', note: 'Arusha, Tarangire, Serengeti, Ngorongoro i finał na plaży Zanzibaru.' },
  { label: 'Najlepsze szybkie safari', pick: '2 dni fly-in safari z Zanzibaru', slug: 'two-day-fly-in-safari-zanzibar', note: 'Kompaktowa trasa z przelotem dla gości, którzy są już na wyspie.' },
  { label: 'Najlepsze wildlife premium', pick: 'Luksusowy pakiet Wielkiej Migracji', slug: 'great-migration-luxury-package', note: 'Sezonowe śledzenie migracji, luksusowe campy, opcje fotograficzne i Zanzibar.' },
  { label: 'Najlepszy pobyt wyspowy bez safari', pick: 'Pakiet przygoda i ocean na Zanzibarze', slug: 'zanzibar-adventure-marine-package', note: 'Ocean, sandbank, rejs dhow, Jozani i czas w resorcie przy plaży.' },
];

const PACKAGE_INCLUDED = [
  'Skoordynowane transfery lotniskowe',
  'Dobór hotelu lub willi',
  'Wycieczki i dodatki safari',
  'Indywidualna wycena w 24 godziny',
  'Wsparcie concierge na WhatsApp',
  'Opcje upgrade przed potwierdzeniem',
  'Tempo dopasowane do grupy',
  'Lokalny zespół na miejscu',
];

const PACKAGE_STEPS = [
  { step: '01', title: 'Wybierz pakiet', text: 'Zacznij od najbliższego dopasowania: safari i plaża, honeymoon, fly-in, rodzina, luksus, Kilimandżaro, kultura albo ocean.' },
  { step: '02', title: 'Dopasowujemy szczegóły', text: 'Hotele, loty, trasa safari, plaże, wycieczki, posiłki i upgrade’y ustawiamy pod Twoje daty oraz budżet.' },
  { step: '03', title: 'Potwierdzasz i odpoczywasz', text: 'Zaliczka blokuje plan. My koordynujemy ruchome części i informujemy Cię na WhatsApp.' },
];

const MARKET_CATEGORIES = [
  'Pakiety safari',
  'Wakacje plażowe na Zanzibarze',
  'Pakiety honeymoon',
  'Pakiety rodzinne',
  'Doświadczenia luksusowe',
  'Safari fly-in',
  'Przygody pod Kilimandżaro',
  'Wycieczki kulturowe',
  'Ocean i nurkowanie',
  'Pakiety szyte na miarę',
];

export default function Packages() {
  const pageRef = useRef(null);
  const [filter, setFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(INITIAL_PACKAGE_COUNT);
  const activeFilter = packageFilters.find((item) => item.key === filter) || packageFilters[0];
  const filteredPackages = useMemo(() => PACKAGES.filter(activeFilter.match), [activeFilter]);
  const visible = useMemo(
    () => filteredPackages.slice(0, visibleCount),
    [filteredPackages, visibleCount],
  );
  const hasHiddenPackages = visibleCount < filteredPackages.length;

  useEffect(() => {
    setVisibleCount(INITIAL_PACKAGE_COUNT);
  }, [filter]);

  useEffect(() => {
    document.title = 'Pakiety Zanzibar i Tanzania · Destination Paradise';
  }, []);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return undefined;
    const items = root.querySelectorAll('.reveal:not(.is-visible)');
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
    <main className="excursions-page packages-page" ref={pageRef}>
      <section className="exc-hero pkg-hero">
        <div className="exc-hero__bg"><ResponsiveImage src="/assets/images/safaris/eland-grazing.webp" alt="" fetchpriority="high" loading="eager" decoding="sync" /></div>
        <div className="exc-hero__inner">
          <span className="exc-hero__eyebrow">Hotele · safari · wycieczki · wyjątkowe momenty</span>
          <h1 className="exc-hero__title">Pakiety na podróż, <em>której naprawdę chcesz.</em></h1>
          <p className="exc-hero__lead">Połączenia safari i Zanzibaru, podróże poślubne, safari z przelotem, Kilimandżaro, rodzinne wakacje, oceaniczne doświadczenia i pobyty z kulturą wyspy w centrum.</p>
          <div className="exc-hero__row">
            <a className="btn btn--lg" href="#packages">Zobacz pakiety</a>
            <Link className="btn btn--ghost btn--lg" to="/trip-planner">Zbuduj mój plan →</Link>
          </div>
          <div className="exc-hero__meta">
            <div><strong>{PACKAGES.length}</strong><span>Pakietów</span></div>
            <div><strong>${minPackagePrice.toLocaleString()}</strong><span>Od</span></div>
            <div><strong>10</strong><span>Stylów</span></div>
            <div><strong>24h</strong><span>Na wycenę</span></div>
          </div>
        </div>
      </section>

      <section className="exc-grid-wrap" id="packages">
        <header className="exc-list__head">
          <span className="section-eyebrow">Wybrane pakiety</span>
          <h2 className="section-title">Pakiety - wybierz punkt startowy.</h2>
          <p className="section-lead">Każdy pakiet pokazuje zakres, dla kogo pasuje, cenę i pomysły na upgrade. Wszystko dopasowujemy do dat i poziomu komfortu.</p>
        </header>

        <div className="exc-filter">
          <span className="exc-filter__label">Filtruj</span>
          {packageFilters.map((item) => (
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

        <div className="exc-grid">
          {visible.map((pkg) => (
            <Link key={pkg.id} to={`/packages/${pkg.id}`} className="exc-card reveal" aria-label={`Zobacz ${pkg.title}`}>
              <div className="exc-card__img">
                <img src={pkg.image} alt="" loading="lazy" />
                <span className="exc-card__cat">{pkg.category}</span>
              </div>
              <div className="exc-card__body">
                <span className="exc-card__eyebrow">{pkg.duration}</span>
                <h3 className="exc-card__title">{pkg.title}</h3>
                <p className="exc-card__desc">{pkg.description}</p>
                <div className="exc-card__meta">
                  <span>{pkg.duration}</span>
                  <span>{pkg.category}</span>
                </div>
                <div className="exc-card__foot">
                  <span className="exc-card__price">Od <strong>{pkg.priceLabel}</strong> {pkg.priceSub}</span>
                  <span className="exc-card__cta">Zobacz →</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {filteredPackages.length > INITIAL_PACKAGE_COUNT && (
          <div className="exc-grid__actions">
            {hasHiddenPackages ? (
              <button
                type="button"
                className="btn btn--ghost btn--lg"
                onClick={() => setVisibleCount((count) => Math.min(count + PACKAGE_BATCH_COUNT, filteredPackages.length))}
              >
                Pokaż więcej pakietów
              </button>
            ) : (
              <button
                type="button"
                className="btn btn--ghost btn--lg"
                onClick={() => {
                  setVisibleCount(INITIAL_PACKAGE_COUNT);
                  document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                Pokaż mniej pakietów
              </button>
            )}
            <span>Pokazano {Math.min(visibleCount, filteredPackages.length)} z {filteredPackages.length}</span>
          </div>
        )}
      </section>

      <section className="saf-compare reveal">
        <header className="saf-compare__head">
          <span className="section-eyebrow">Jeszcze nie wiesz?</span>
          <h2 className="section-title">Wybierz według stylu podróży.</h2>
          <p className="section-lead">Zacznij od tego, o co najczęściej pytają goście: safari i plaża, honeymoon, krótkie fly-in safari, luksusowa migracja, rodzina, Kilimandżaro, ocean albo kultura.</p>
        </header>
        <div className="saf-compare__grid">
          {PACKAGE_MATCHES.map((item) => (
            <Link className="saf-compare__card" key={item.label} to={`/packages/${item.slug}`} aria-label={`Zobacz ${item.pick}`}>
              <span>{item.label}</span>
              <h3>{item.pick}</h3>
              <p>{item.note}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="included reveal">
        <div className="included__wrap">
          <div className="included__copy">
            <span className="section-eyebrow">Zakres operatora</span>
            <h2 className="section-title">Pełne portfolio Tanzanii i Zanzibaru.</h2>
            <p className="section-lead">Te kategorie pokazują Destination Paradise jako pełnego operatora premium, nie tylko firmę od wycieczek jednodniowych.</p>
          </div>
          <ul className="included__list">
            {MARKET_CATEGORIES.map((item) => (
              <li key={item}><span>✓</span> {item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="included reveal">
        <div className="included__wrap">
          <div className="included__copy">
            <span className="section-eyebrow">Co jest w cenie</span>
            <h2 className="section-title">Jeden plan. Mniej ruchomych części.</h2>
            <p className="section-lead">Pakiety zdejmują z Ciebie koordynację: hotele, transfery, wycieczki, specjalne aranżacje i dodatki safari układamy w jeden spójny plan.</p>
          </div>
          <ul className="included__list">
            {PACKAGE_INCLUDED.map((item) => (
              <li key={item}><span>✓</span> {item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="saf-steps reveal">
        <header className="saf-steps__head">
          <span className="section-eyebrow">Jak działa rezerwacja</span>
          <h2 className="section-title">Trzy kroki do potwierdzonego pakietu.</h2>
        </header>
        <div className="saf-steps__grid">
          {PACKAGE_STEPS.map((item) => (
            <article className="saf-step" key={item.step}>
              <span>{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="exc-cta">
        <div className="exc-cta__bg"><ResponsiveImage src="/assets/images/excursions/prison-island-tortoise.webp" alt="" /></div>
        <div className="exc-cta__inner">
          <h2>Chcesz, żebyśmy zbudowali pakiet wokół Ciebie?</h2>
          <p>Wyślij daty, wielkość grupy i styl, który lubisz. Wrócimy z realnym pakietem i realną ceną.</p>
          <div className="exc-cta__btns">
            <Link className="btn btn--lg btn--accent" to="/booking">Poproś o wycenę →</Link>
            <Link className="btn btn--ghost-light btn--lg" to="/trip-planner">Zaplanuj z AI</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
