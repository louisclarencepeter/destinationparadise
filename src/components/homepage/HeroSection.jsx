import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowIcon } from './Icons.jsx';
import ResponsiveImage from '../ResponsiveImage.jsx';

const HERO_SLIDES = [
  '/assets/images/home/aerial-boats-turquoise-water.webp',
  '/assets/images/safaris/lion-cub-in-grass.webp',
  '/assets/images/safaris/crowned-crane-close.webp',
  '/assets/images/safaris/yellow-weaver-on-rail.webp',
];
const HERO_SLIDE_INTERVAL_MS = 7000;
const HERO_SLIDE_PRELOAD_DELAY_MS = 6500;
const HERO_SLIDE_INTERACTION_EVENTS = ['pointerdown', 'touchstart', 'keydown'];

export default function HeroSection({ tweaks }) {
  const { t } = useTranslation('home');
  const [activeSlide, setActiveSlide] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [slidesReady, setSlidesReady] = useState(false);
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
            fetchpriority={index === 0 ? 'high' : 'auto'}
          />
        ))}
      </div>
      <div className="hero__content">
        <div className="hero__intro">
          <span className="hero__eyebrow">{t('hero.eyebrow')}</span>
          <h1 className="hero__title">{t('hero.title')}</h1>
          <h2 className="hero__motto"><i>{t('hero.motto')}</i></h2>
          <p className="hero__desc">{t('hero.description')}</p>
          <div className="hero__cta-row">
            <Link className="btn" to="/packages">{t('hero.browse_packages')} <ArrowIcon size={18} /></Link>
            <Link className="btn btn--ghost" to="/explore">{t('hero.explore_cta')}</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
