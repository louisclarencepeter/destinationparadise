import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PlannerSection from '../components/homepage/PlannerSection.jsx';
import ResponsiveImage from '../components/ResponsiveImage.jsx';
import '../styles/homepage.css';
import '../styles/excursions.css';

const PLANNER_PROMPTS = [
  {
    label: 'Safari + plaża',
    title: 'Ułóż trasę od buszu do plaży',
    text: 'Planujemy 8-10 nocy. Chcemy krótkie safari, czas na plaży na Zanzibarze, dobre jedzenie i płynną trasę bez zbyt wielu zmian hoteli. Możesz zaproponować plan?',
  },
  {
    label: 'Podróż poślubna',
    title: 'Zaplanuj coś romantycznego',
    text: 'Jesteśmy parą w podróży poślubnej. Chcemy 7 nocy, piękny hotel przy plaży, jedną prywatną kolację, dhow o zachodzie słońca i może krótkie safari z przelotem. Średni standard do luksusu.',
  },
  {
    label: 'Rodzina',
    title: 'Ułatw podróż z dziećmi',
    text: 'Jesteśmy rodziną z dziećmi i chcemy spokojny Zanzibar: bezpieczne aktywności, przyroda albo żółwie, snorkeling przy łatwych warunkach i bez zbyt wielu wczesnych pobudek.',
  },
  {
    label: 'Kultura + ocean',
    title: 'Połącz lokalne życie i wodę',
    text: 'Chcę Stone Town, farmy przypraw, lokalne jedzenie, dzień na dhow, snorkeling i plażę, która nadal jest spokojna. Zaproponuj zbalansowany plan.',
  },
];

const PLANNER_STEPS = [
  { step: '01', title: 'Opowiedz o kształcie podróży', text: 'Daty, liczba osób, budżet, tempo i to, co jest dla Ciebie najważniejsze.' },
  { step: '02', title: 'Dostań pierwszy szkic', text: 'Planer układa noce, regiony, wycieczki, safari i rytm dnia.' },
  { step: '03', title: 'Wyślij go do nas', text: 'Zespół sprawdza dostępność, wycenia plan i zmienia szkic w podróż gotową do rezerwacji.' },
];

function buildPlacePrompt(searchParams) {
  const place = searchParams.get('place')?.trim();
  if (!place) return null;

  const type = searchParams.get('type')?.trim();
  const context = searchParams.get('context')?.trim();
  const bestFor = searchParams.get('bestFor')?.trim();
  const details = [
    type ? `Kąt podróży: ${type}.` : '',
    context ? `Kontekst: ${context}` : '',
    bestFor ? `Najlepsze dla: ${bestFor}.` : '',
  ].filter(Boolean).join(' ');

  return {
    id: `place:${place}:${type || ''}:${bestFor || ''}`,
    label: place,
    text: `Chcę zbudować podróż wokół ${place}. ${details} Zaproponuj najlepszą trasę, liczbę nocy, dobre połączenia z innymi miejscami i zapytaj o brakujące daty, liczbę osób, budżet oraz styl podróży.`,
  };
}

export default function TripPlannerPage() {
  const [searchParams] = useSearchParams();
  const [initialPrompt, setInitialPrompt] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const scrollTimeoutRef = useRef(null);
  const handledPlacePromptRef = useRef(null);

  useEffect(() => {
    document.title = 'Planer podróży AI · Destination Paradise';
  }, []);

  useEffect(() => () => {
    if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current);
  }, []);

  useEffect(() => {
    const items = document.querySelectorAll('.reveal:not(.is-visible)');
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
    }, { threshold: 0.1 });

    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const placePrompt = buildPlacePrompt(searchParams);
    if (!placePrompt || handledPlacePromptRef.current === placePrompt.id) return;

    handledPlacePromptRef.current = placePrompt.id;
    setSelectedPrompt(placePrompt.label);
    setInitialPrompt(placePrompt);

    if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = window.setTimeout(() => {
      document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 140);
  }, [searchParams]);

  const startPrompt = (prompt) => {
    setSelectedPrompt(prompt.label);
    setInitialPrompt({ id: Date.now(), text: prompt.text });
    if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = window.setTimeout(() => {
      document.getElementById('planner')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  };

  return (
    <main className="trip-planner-page">
      <section className="trip-hero">
        <div className="trip-hero__bg"><ResponsiveImage src="/assets/images/safaris/lioness-and-cub-resting.webp" alt="" fetchpriority="high" loading="eager" decoding="sync" /></div>
        <div className="trip-hero__inner">
          <span className="trip-hero__eyebrow">Planer podróży AI · sprawdzany przez człowieka przed rezerwacją</span>
          <h1 className="trip-hero__title">Naszkicuj podróż <em>zanim się zdecydujesz.</em></h1>
          <p className="trip-hero__lead">Powiedz planerowi, jakiego Zanzibaru, safari, podróży poślubnej, rodzinnego wyjazdu albo plażowego odpoczynku szukasz. Zada dobre pytania i ułoży trasę, którą zespół może rzetelnie wycenić.</p>
          <div className="trip-hero__actions">
            <a className="btn btn--lg" href="#planner">Zacznij planować</a>
            <Link className="btn btn--ghost btn--lg" to="/packages">Zobacz pakiety</Link>
          </div>
          <div className="trip-hero__stats">
            <div><strong>24h</strong><span>Wycena od człowieka</span></div>
            <div><strong>15</strong><span>Pakietów</span></div>
            <div><strong>29</strong><span>Safari</span></div>
            <div><strong>40+</strong><span>Wycieczek</span></div>
          </div>
        </div>
      </section>

      <section className="trip-prompts reveal">
        <header className="trip-prompts__head">
          <span className="section-eyebrow">Zacznij szybciej</span>
          <h2 className="section-title">Wybierz kierunek planowania.</h2>
          <p className="section-lead">Wybierz najbliższy punkt startu, a planer otworzy się z gotowym kontekstem.</p>
        </header>
        <div className="trip-prompts__grid">
          {PLANNER_PROMPTS.map((prompt) => (
            <button
              className={`trip-prompt-card${selectedPrompt === prompt.label ? ' is-selected' : ''}`}
              key={prompt.label}
              type="button"
              onClick={() => startPrompt(prompt)}
              aria-pressed={selectedPrompt === prompt.label}
            >
              <span>{prompt.label}</span>
              <h3>{prompt.title}</h3>
              <p>{prompt.text}</p>
              <strong className="trip-prompt-card__action">{selectedPrompt === prompt.label ? 'Wysłano do planera' : 'Zacznij od tego'}</strong>
            </button>
          ))}
        </div>
      </section>

      <PlannerSection initialPrompt={initialPrompt} />

      <section className="trip-steps reveal">
        <header className="trip-steps__head">
          <span className="section-eyebrow">Jak używać</span>
          <h2 className="section-title">Od pomysłu do planu gotowego do rezerwacji.</h2>
        </header>
        <div className="trip-steps__grid">
          {PLANNER_STEPS.map((item) => (
            <article className="trip-step" key={item.step}>
              <span>{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="exc-cta">
        <div className="exc-cta__bg"><ResponsiveImage src="/assets/images/safaris/crowned-cranes-in-grass.webp" alt="" /></div>
        <div className="exc-cta__inner">
          <h2>Chcesz, żebyśmy zmienili szkic w wycenę?</h2>
          <p>Wyślij plan, daty, liczbę osób i styl podróży. Sprawdzimy dostępność i wrócimy z realną trasą oraz realną ceną.</p>
          <div className="exc-cta__btns">
            <Link className="btn btn--lg btn--accent" to="/booking">Poproś o wycenę →</Link>
            <a className="btn btn--ghost-light btn--lg" href="#planner">Planuj dalej</a>
          </div>
        </div>
      </section>
    </main>
  );
}
