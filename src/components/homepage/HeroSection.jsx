import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowIcon } from './Icons.jsx';

const HERO_SLIDES = [
  '/assets/images/home/aerial-boats-turquoise-water.jpg',
  '/assets/images/excursions/dream-dhow-sunset.jpeg',
  '/assets/images/safaris/zebra-herd-on-track.jpg',
  '/assets/images/safaris/lioness-and-cub-resting.jpg',
];
const HERO_SLIDE_INTERVAL_MS = 7000;

export default function HeroSection({ tweaks, handleHeroSearch }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

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
    if (reduceMotion || HERO_SLIDES.length < 2) return undefined;

    const intervalId = window.setInterval(() => {
      setActiveSlide((current) => (current + 1) % HERO_SLIDES.length);
    }, HERO_SLIDE_INTERVAL_MS);

    return () => window.clearInterval(intervalId);
  }, [reduceMotion]);

  return (
    <section className={`hero hero--${tweaks.hero}`} id="hero">
      <div className="hero__bg" aria-hidden="true">
        {HERO_SLIDES.map((src, index) => (
          <img
            key={src}
            className={`hero__bg-slide${index === activeSlide ? ' is-active' : ''}`}
            src={src}
            alt=""
            loading={index === 0 ? 'eager' : 'lazy'}
            decoding="async"
            fetchpriority={index === 0 ? 'high' : 'auto'}
          />
        ))}
      </div>
      <div className="hero__content">
  <span className="hero__eyebrow">15 packages · 29 safaris · 40+ excursions</span>
        <h1 className="hero__title">Destination Paradise</h1>
        <h2 className="hero__motto"><i>your next trip to paradise…</i></h2>
  <p className="hero__desc">Plan Zanzibar and Tanzania in one place: complete safari-and-beach packages, island excursions, mainland safaris, and an AI planner that helps shape the right route.</p>
        <div className="hero__cta-row">
          <Link className="btn" to="/packages">Browse packages <ArrowIcon size={18} /></Link>
          <Link className="btn btn--ghost" to="/explore">Explore Zanzibar &amp; Tanzania</Link>
        </div>
        <form className="hero__search" onSubmit={handleHeroSearch}>
          <div className="hero__search-field">
            <label>Experience</label>
            <select name="excursion" defaultValue="Any package, excursion, or safari">
              <option>Any package, excursion, or safari</option>
              <option>6 Days Safari &amp; Zanzibar Escape</option>
              <option>7 Days Honeymoon Safari &amp; Zanzibar</option>
              <option>10 Days Classic Safari &amp; Zanzibar</option>
              <option>2 Days Fly-In Safari From Zanzibar</option>
              <option>Stone Town &amp; Culture Experience</option>
              <option>Safari Blue Dhow &amp; Snorkel</option>
              <option>Serengeti Migration</option>
              <option>Ngorongoro &amp; Tarangire</option>
              <option>Nyerere Fly-In Safari</option>
            </select>
          </div>
          <div className="hero__search-field">
            <label>Date</label>
            <input type="date" name="date" defaultValue="2026-05-12" />
          </div>
          <div className="hero__search-field">
            <label>Guests</label>
            <select name="guests" defaultValue="2 guests">
              <option>1 guest</option>
              <option>2 guests</option>
              <option>3 guests</option>
              <option>4 guests</option>
              <option>5+ guests</option>
            </select>
          </div>
          <button className="hero__search-submit" type="submit">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            Find my route
          </button>
        </form>
      </div>
    </section>
  );
}
