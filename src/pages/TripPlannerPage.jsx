import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import PlannerSection from '../components/homepage/PlannerSection.jsx';
import ResponsiveImage from '../components/ResponsiveImage.jsx';
import '../styles/homepage.css';
import '../styles/excursions.css';

const PLANNER_PROMPTS = [
  {
    label: 'Safari + beach',
    title: 'Build a bush-to-beach route',
    text: 'We are planning 8 to 10 nights. We want a short safari, Zanzibar beach time, good food, and a smooth route without too many hotel changes. Can you suggest a plan?',
  },
  {
    label: 'Honeymoon',
    title: 'Plan something romantic',
    text: 'We are a honeymoon couple. We want 7 nights with a beautiful beach hotel, one private dinner, a dhow sunset, and maybe a short fly-in safari. Mid-range to luxury.',
  },
  {
    label: 'Family',
    title: 'Make it easy with kids',
    text: 'We are a family with children and want a relaxed Zanzibar trip with safe activities, wildlife or turtles, snorkeling if conditions are easy, and not too many early mornings.',
  },
  {
    label: 'Culture + ocean',
    title: 'Mix local life and water',
    text: 'I want Stone Town, spice farms, local food, a dhow day, snorkeling, and a beach area that still feels relaxed. Please suggest a balanced itinerary.',
  },
];

const PLANNER_STEPS = [
  { step: '01', title: 'Tell it the shape', text: 'Dates, guests, budget, pace, and what you care about most.' },
  { step: '02', title: 'Get a first draft', text: 'The planner sketches nights, regions, excursions, safaris, and daily rhythm.' },
  { step: '03', title: 'Send it to us', text: 'Our team checks availability, prices it properly, and turns the draft into a bookable trip.' },
];

function buildPlacePrompt(searchParams) {
  const place = searchParams.get('place')?.trim();
  if (!place) return null;

  const type = searchParams.get('type')?.trim();
  const context = searchParams.get('context')?.trim();
  const bestFor = searchParams.get('bestFor')?.trim();
  const details = [
    type ? `Trip angle: ${type}.` : '',
    context ? `Context: ${context}` : '',
    bestFor ? `Best for: ${bestFor}.` : '',
  ].filter(Boolean).join(' ');

  return {
    id: `place:${place}:${type || ''}:${bestFor || ''}`,
    label: place,
    text: `I want to build a trip around ${place}. ${details} Please suggest the best route, how many nights to allow, what to combine it with, and ask me for any missing dates, group size, budget, and travel-style details.`,
  };
}

export default function TripPlannerPage() {
  const [searchParams] = useSearchParams();
  const [initialPrompt, setInitialPrompt] = useState(null);
  const [selectedPrompt, setSelectedPrompt] = useState(null);
  const scrollTimeoutRef = useRef(null);
  const handledPlacePromptRef = useRef(null);

  useEffect(() => {
    document.title = 'AI Trip Planner · Destination Paradise';
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
          <span className="trip-hero__eyebrow">AI Trip Planner · human-reviewed before booking</span>
          <h1 className="trip-hero__title">Sketch the trip <em>before you commit.</em></h1>
          <p className="trip-hero__lead">Tell the planner what kind of Zanzibar, safari, honeymoon, family trip, or beach escape you want. It will ask the useful questions and shape a route our team can price properly.</p>
          <div className="trip-hero__actions">
            <a className="btn btn--lg" href="#planner">Start planning</a>
            <Link className="btn btn--ghost btn--lg" to="/packages">Browse packages</Link>
          </div>
          <div className="trip-hero__stats">
            <div><strong>24h</strong><span>Human quote</span></div>
            <div><strong>15</strong><span>Packages</span></div>
            <div><strong>29</strong><span>Safaris</span></div>
            <div><strong>40+</strong><span>Excursions</span></div>
          </div>
        </div>
      </section>

      <section className="trip-prompts reveal">
        <header className="trip-prompts__head">
          <span className="section-eyebrow">Start faster</span>
          <h2 className="section-title">Choose a planning angle.</h2>
          <p className="section-lead">Pick the closest starting point and the planner will open with that context already loaded.</p>
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
              <strong className="trip-prompt-card__action">{selectedPrompt === prompt.label ? 'Sent to planner' : 'Start with this'}</strong>
            </button>
          ))}
        </div>
      </section>

      <PlannerSection initialPrompt={initialPrompt} handoffHref="/booking?source=planner#booking-form" />

      <section className="trip-steps reveal">
        <header className="trip-steps__head">
          <span className="section-eyebrow">How to use it</span>
          <h2 className="section-title">From idea to bookable plan.</h2>
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
          <h2>Want us to turn the draft into a quote?</h2>
          <p>Send the plan, dates, group size, and travel style. We’ll check availability and come back with a real route and a real price.</p>
          <div className="exc-cta__btns">
            <Link className="btn btn--lg btn--accent" to="/booking">Get a quote →</Link>
            <a className="btn btn--ghost-light btn--lg" href="#planner">Keep planning</a>
          </div>
        </div>
      </section>
    </main>
  );
}
