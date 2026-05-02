import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowIcon } from './Icons.jsx';
import ScrollCue from './ScrollCue.jsx';

const HERO_SLIDES = [
  '/assets/images/home/aerial-boats-turquoise-water.jpg',
  '/assets/images/home/mizingani-waterfront.jpg',
  '/assets/images/home/stone-town-waterfront.webp',
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
            fetchPriority={index === 0 ? 'high' : 'auto'}
          />
        ))}
      </div>
      <div className="hero__content">
  <span className="hero__eyebrow">Guided excursions &amp; safaris · Since 2015</span>
        <h1 className="hero__title">Destination Paradise</h1>
        <h2 className="hero__motto"><i>your next trip to paradise…</i></h2>
  <p className="hero__desc">Welcome to your gateway to Zanzibar and Tanzania. Every day brings a new adventure, from curated island excursions to unforgettable mainland safaris.</p>
        <div className="hero__cta-row">
          <Link className="btn" to="/packages">Browse trips &amp; safaris <ArrowIcon size={18} /></Link>
          <Link className="btn btn--ghost" to="/explore">Explore Zanzibar &amp; Tanzania</Link>
        </div>
        <form className="hero__search" onSubmit={handleHeroSearch}>
          <div className="hero__search-field">
            <label>Experience</label>
            <select name="excursion" defaultValue="Any trip or safari">
              <option>Any trip or safari</option>
              <option>Stone Town Heritage Walk</option>
              <option>Safari Blue Dhow</option>
              <option>Spice &amp; Culture Tour</option>
              <option>Dream Dhow Sunset</option>
              <option>Dolphin Snorkeling</option>
              <option>Serengeti Wildlife Safari</option>
              <option>Ngorongoro Crater Safari</option>
              <option>Tarangire Safari</option>
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
            Find trips &amp; safaris
          </button>
        </form>
      </div>
      <ScrollCue to="excursions" label="Scroll" variant="hero" />
    </section>
  );
}
