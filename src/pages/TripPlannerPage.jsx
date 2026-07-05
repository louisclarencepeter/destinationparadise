import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import PlannerSection from '../components/homepage/PlannerSection.jsx';
import ResponsiveImage from '../components/ResponsiveImage.jsx';
import usePageMeta from '../hooks/usePageMeta.js';
import { arrayFromTranslation } from '../utils/translationValues.js';
import { preferredScrollBehavior } from '../utils/motion.js';
import '../styles/homepage.css';
import '../styles/excursions.css';

function buildPlacePrompt(searchParams, t) {
  const place = searchParams.get('place')?.trim();
  if (!place) return null;

  const type = searchParams.get('type')?.trim();
  const context = searchParams.get('context')?.trim();
  const bestFor = searchParams.get('bestFor')?.trim();
  const details = [
    type ? t('place_prompt.trip_angle', { value: type }) : '',
    context ? t('place_prompt.context', { value: context }) : '',
    bestFor ? t('place_prompt.best_for', { value: bestFor }) : '',
  ].filter(Boolean).join(' ');

  return {
    id: `place:${place}:${type || ''}:${bestFor || ''}`,
    label: place,
    text: t('place_prompt.text', { place, details }),
  };
}

export default function TripPlannerPage() {
  const { t, ready } = useTranslation('tripPlanner');
  const [searchParams] = useSearchParams();
  const [initialPrompt, setInitialPrompt] = useState(
    /** @type {{ id: string | number, label?: string, text: string } | null} */ (null),
  );
  const [selectedPrompt, setSelectedPrompt] = useState(/** @type {string | null} */ (null));
  const scrollTimeoutRef = useRef(/** @type {number | null} */ (null));
  const handledPlacePromptRef = useRef(/** @type {string | null} */ (null));
  const plannerPrompts = useMemo(() => arrayFromTranslation(t('prompts.items', { returnObjects: true })), [t]);
  const plannerSteps = useMemo(() => arrayFromTranslation(t('steps.items', { returnObjects: true })), [t]);

  usePageMeta({
    title: t('page_title'),
    description: t('meta_description', {
      defaultValue:
        'Plan your Zanzibar & Tanzania trip with an AI travel concierge — describe your dates, budget and style, and get a tailored safari-and-beach itinerary in minutes.',
    }),
  });

  useEffect(() => () => {
    if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current);
  }, []);

  useEffect(() => {
    if (!ready) return undefined;

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
  }, [ready]);

  useEffect(() => {
    if (!ready) return;
    const placePrompt = buildPlacePrompt(searchParams, t);
    if (!placePrompt || handledPlacePromptRef.current === placePrompt.id) return;

    handledPlacePromptRef.current = placePrompt.id;
    setSelectedPrompt(placePrompt.label);
    setInitialPrompt(placePrompt);

    if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = window.setTimeout(() => {
      document.getElementById('planner')?.scrollIntoView({ behavior: preferredScrollBehavior(), block: 'start' });
    }, 140);
  }, [ready, searchParams, t]);

  const startPrompt = (prompt) => {
    setSelectedPrompt(prompt.key);
    setInitialPrompt({ id: Date.now(), text: prompt.text });
    if (scrollTimeoutRef.current) window.clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = window.setTimeout(() => {
      document.getElementById('planner')?.scrollIntoView({ behavior: preferredScrollBehavior(), block: 'start' });
    }, 80);
  };

  if (!ready) return null;

  return (
    <main className="trip-planner-page">
      <section className="trip-hero">
        <div className="trip-hero__bg"><ResponsiveImage src="/assets/images/safaris/lioness-and-cub-resting.webp" alt="" fetchpriority="high" loading="eager" decoding="sync" /></div>
        <div className="trip-hero__inner">
          <span className="trip-hero__eyebrow">{t('hero.eyebrow')}</span>
          <h1 className="trip-hero__title">{t('hero.title_prefix')} <em>{t('hero.title_em')}</em></h1>
          <p className="trip-hero__lead">{t('hero.lead')}</p>
          <div className="trip-hero__actions">
            <a className="btn btn--lg" href="#planner">{t('hero.start_planning')}</a>
            <Link className="btn btn--ghost btn--lg" to="/packages">{t('hero.browse_packages')}</Link>
          </div>
          <div className="trip-hero__stats">
            <div><strong>24h</strong><span>{t('hero.stat_human_quote')}</span></div>
            <div><strong>15</strong><span>{t('hero.stat_packages')}</span></div>
            <div><strong>29</strong><span>{t('hero.stat_safaris')}</span></div>
            <div><strong>40+</strong><span>{t('hero.stat_excursions')}</span></div>
          </div>
        </div>
      </section>

      <section className="trip-prompts">
        <header className="trip-prompts__head">
          <span className="section-eyebrow reveal" style={{ '--reveal-index': 0 }}>{t('prompts.eyebrow')}</span>
          <h2 className="section-title reveal" style={{ '--reveal-index': 1 }}>{t('prompts.title')}</h2>
          <p className="section-lead reveal" style={{ '--reveal-index': 2 }}>{t('prompts.lead')}</p>
        </header>
        <div className="trip-prompts__grid">
          {plannerPrompts.map((prompt, i) => (
            <button
              className={`trip-prompt-card reveal${selectedPrompt === prompt.key ? ' is-selected' : ''}`}
              key={prompt.key}
              type="button"
              style={{ '--reveal-index': i }}
              onClick={() => startPrompt(prompt)}
              aria-pressed={selectedPrompt === prompt.key}
            >
              <span>{prompt.label}</span>
              <h3>{prompt.title}</h3>
              <p>{prompt.text}</p>
              <strong className="trip-prompt-card__action">{selectedPrompt === prompt.key ? t('prompts.sent') : t('prompts.start_with_this')}</strong>
            </button>
          ))}
        </div>
      </section>

      <PlannerSection initialPrompt={initialPrompt} />

      <section className="trip-steps">
        <header className="trip-steps__head">
          <span className="section-eyebrow reveal" style={{ '--reveal-index': 0 }}>{t('steps.eyebrow')}</span>
          <h2 className="section-title reveal" style={{ '--reveal-index': 1 }}>{t('steps.title')}</h2>
        </header>
        <div className="trip-steps__grid">
          {plannerSteps.map((item, i) => (
            <article className="trip-step reveal dp-lift" key={item.step} style={{ '--reveal-index': i }}>
              <span>{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="exc-cta">
        <div className="exc-cta__bg"><ResponsiveImage src="/assets/images/safaris/crowned-cranes-in-grass.webp" alt="" className="dp-drift" /></div>
        <div className="exc-cta__inner">
          <h2 className="reveal" style={{ '--reveal-index': 0 }}>{t('cta.title')}</h2>
          <p className="reveal" style={{ '--reveal-index': 1 }}>{t('cta.text')}</p>
          <div className="exc-cta__btns reveal" style={{ '--reveal-index': 2 }}>
            <Link className="btn btn--lg btn--accent" to="/booking">{t('cta.get_quote')}</Link>
            <a className="btn btn--ghost-light btn--lg" href="#planner">{t('cta.keep_planning')}</a>
          </div>
        </div>
      </section>
    </main>
  );
}
