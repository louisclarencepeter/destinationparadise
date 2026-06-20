import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowIcon } from './Icons.jsx';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { arrayFromTranslation } from '../../utils/translationValues.js';

const HERO_SLIDES = [
  '/assets/images/home/aerial-boats-turquoise-water.webp',
  '/assets/images/safaris/lion-cub-in-grass.webp',
  '/assets/images/safaris/crowned-crane-close.webp',
  '/assets/images/safaris/yellow-weaver-on-rail.webp',
];
const HERO_SLIDE_INTERVAL_MS = 7000;
const HERO_SLIDE_PRELOAD_DELAY_MS = 6500;
const HERO_SLIDE_INTERACTION_EVENTS = ['pointerdown', 'touchstart', 'keydown'];

const dateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

function HeroMotto() {
  const { t } = useTranslation('home');
  const motto = t('hero.motto');
  const [typed, setTyped] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setTyped('');
    setDone(false);
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setTyped(motto);
      setDone(true);
      return undefined;
    }
    let timeoutId;
    let i = 0;
    const tick = () => {
      i += 1;
      setTyped(motto.slice(0, i));
      if (i >= motto.length) {
        setDone(true);
        return;
      }
      const pause = motto[i - 1] === ' ' ? 80 : 48 + (i % 4) * 14;
      timeoutId = window.setTimeout(tick, pause);
    };
    timeoutId = window.setTimeout(tick, 600);
    return () => {
      if (timeoutId) window.clearTimeout(timeoutId);
    };
  }, [motto]);

  return (
    <h2 className={`hero__motto hero__motto--typed${done ? ' is-done' : ''}`}>
      <span className="visually-hidden">{motto}</span>
      <i aria-hidden="true">{typed}</i>
      <span className="hero__motto-cursor" aria-hidden="true" />
    </h2>
  );
}

export default function HeroSection({ tweaks, handleHeroSearch }) {
  const { t } = useTranslation('home');
  const popularPackages = arrayFromTranslation(t('hero.search.popular_packages', { returnObjects: true }));
  const tanzaniaSafaris = arrayFromTranslation(t('hero.search.tanzania_safaris', { returnObjects: true }));
  const zanzibarExcursions = arrayFromTranslation(t('hero.search.zanzibar_excursions', { returnObjects: true }));
  const guestsOptions = arrayFromTranslation(t('hero.search.guests_options', { returnObjects: true }));
  const guestsDefault = t('hero.search.guests_default');
  const anyOption = t('hero.search.any_option');
  const [activeSlide, setActiveSlide] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [slidesReady, setSlidesReady] = useState(false);
  const defaultTripDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return dateInputValue(date);
  }, []);
  const earliestTripDate = useMemo(() => dateInputValue(new Date()), []);
  const renderedSlides = slidesReady ? HERO_SLIDES : HERO_SLIDES.slice(0, 1);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = () => setReduceMotion(mediaQuery.matches);
    syncPreference();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', syncPreference);
      return () => mediaQuery.removeEventListener('change', syncPreference);
    }

    mediaQuery.addListener(syncPreference);
    return () => mediaQuery.removeListener(syncPreference);
  }, []);

  useEffect(() => {
    if (reduceMotion) {
      setSlidesReady(false);
      return undefined;
    }

    if (typeof window === 'undefined') return undefined;

    const revealSlides = () => setSlidesReady(true);
    let idleId;
    const timeoutId = window.setTimeout(() => {
      if ('requestIdleCallback' in window) {
        idleId = window.requestIdleCallback(revealSlides, { timeout: 2500 });
        return;
      }

      revealSlides();
    }, HERO_SLIDE_PRELOAD_DELAY_MS);

    HERO_SLIDE_INTERACTION_EVENTS.forEach((event) => {
      window.addEventListener(event, revealSlides, { once: true, passive: true });
    });

    return () => {
      window.clearTimeout(timeoutId);
      if (idleId !== undefined && 'cancelIdleCallback' in window) {
        window.cancelIdleCallback(idleId);
      }
      HERO_SLIDE_INTERACTION_EVENTS.forEach((event) => {
        window.removeEventListener(event, revealSlides);
      });
    };
  }, [reduceMotion]);

  useEffect(() => {
    if (reduceMotion || !slidesReady || HERO_SLIDES.length < 2) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % HERO_SLIDES.length);
    }, HERO_SLIDE_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [reduceMotion, slidesReady]);

  return (
    <section className={`hero hero--${tweaks.hero}`} id="hero">
      <div className="hero__bg" aria-hidden="true">
        {renderedSlides.map((slide, index) => (
          <ResponsiveImage
            key={slide}
            className={`hero__bg-slide${index === activeSlide ? ' is-active' : ''}`}
            src={slide}
            alt=""
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding={index === 0 ? 'sync' : 'async'}
            fetchPriority={index === 0 ? 'high' : 'auto'}
          />
        ))}
      </div>
      <div className="hero__content">
        <div className="hero__intro">
          <span className="hero__eyebrow">{t('hero.eyebrow')}</span>
          <h1 className="hero__title">{t('hero.title')}</h1>
          <HeroMotto />
          <p className="hero__desc">{t('hero.description')}</p>
          <div className="hero__cta-row">
            <Link className="btn" to="/packages">{t('hero.browse_packages')} <ArrowIcon size={18} /></Link>
            <Link className="btn btn--ghost" to="/explore">{t('hero.explore_cta')}</Link>
          </div>
        </div>
        <form className="hero__search" onSubmit={handleHeroSearch}>
          <div className="hero__search-field">
            <label htmlFor="hero-experience">{t('hero.search.experience_label')}</label>
            <select id="hero-experience" name="excursion" defaultValue={anyOption} autoComplete="off">
              <option>{anyOption}</option>
              <optgroup label={t('hero.search.popular_packages_group')}>
                {popularPackages.map((opt) => <option key={opt}>{opt}</option>)}
              </optgroup>
              <optgroup label={t('hero.search.tanzania_safaris_group')}>
                {tanzaniaSafaris.map((opt) => <option key={opt}>{opt}</option>)}
              </optgroup>
              <optgroup label={t('hero.search.zanzibar_excursions_group')}>
                {zanzibarExcursions.map((opt) => <option key={opt}>{opt}</option>)}
              </optgroup>
            </select>
          </div>
          <div className="hero__search-field">
            <label htmlFor="hero-date">{t('hero.search.date_label')}</label>
            <input id="hero-date" type="date" name="date" defaultValue={defaultTripDate} min={earliestTripDate} autoComplete="off" />
          </div>
          <div className="hero__search-field">
            <label htmlFor="hero-guests">{t('hero.search.guests_label')}</label>
            <select id="hero-guests" name="guests" defaultValue={guestsDefault} autoComplete="off">
              {guestsOptions.map((opt) => <option key={opt}>{opt}</option>)}
            </select>
          </div>
          <button className="hero__search-submit" type="submit">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            {t('hero.search.submit')}
          </button>
        </form>
      </div>
    </section>
  );
}
