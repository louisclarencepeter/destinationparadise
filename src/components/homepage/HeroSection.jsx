import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowIcon } from './Icons.jsx';
import ResponsiveImage from '../ResponsiveImage.jsx';

const HERO_SLIDES = [
  '/assets/images/home/aerial-boats-turquoise-water.webp',
  '/assets/images/safaris/lion-cub-in-grass.webp',
  '/assets/images/safaris/crowned-crane-close.webp',
  '/assets/images/safaris/yellow-weaver-on-rail.webp',
];
const HERO_SLIDE_INTERVAL_MS = 7000;

const dateInputValue = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function HeroSection({ tweaks, handleHeroSearch }) {
  const [activeSlide, setActiveSlide] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const defaultTripDate = useMemo(() => {
    const date = new Date();
    date.setDate(date.getDate() + 3);
    return dateInputValue(date);
  }, []);
  const earliestTripDate = useMemo(() => dateInputValue(new Date()), []);

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
        {HERO_SLIDES.map((slide, index) => (
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
            <label htmlFor="hero-experience">Experience</label>
            <select id="hero-experience" name="excursion" defaultValue="Any package, excursion, or safari" autoComplete="off">
              <option>Any package, excursion, or safari</option>
              <optgroup label="Popular Packages">
                <option>6 Days Safari &amp; Zanzibar Escape</option>
                <option>7 Days Honeymoon Safari &amp; Zanzibar</option>
                <option>10 Days Classic Safari &amp; Zanzibar</option>
              </optgroup>
              <optgroup label="Tanzania Safaris">
                <option>2 Days Fly-In Safari From Zanzibar</option>
                <option>Serengeti Migration Safari</option>
                <option>Ngorongoro &amp; Tarangire</option>
                <option>Nyerere (Selous) Fly-In Safari</option>
                <option>Ruaha National Park</option>
              </optgroup>
              <optgroup label="Zanzibar Excursions">
                <option>Safari Blue Dhow &amp; Snorkel</option>
                <option>Stone Town &amp; Culture Tour</option>
                <option>Prison Island Giant Tortoises</option>
                <option>Spice Tour &amp; Swahili Lunch</option>
                <option>Jozani Forest Red Colobus</option>
                <option>Blue Lagoon Snorkeling</option>
                <option>Sunset Trip &amp; The Rock Restaurant</option>
              </optgroup>
            </select>
          </div>
          <div className="hero__search-field">
            <label htmlFor="hero-date">Date</label>
            <input id="hero-date" type="date" name="date" defaultValue={defaultTripDate} min={earliestTripDate} autoComplete="off" />
          </div>
          <div className="hero__search-field">
            <label htmlFor="hero-guests">Guests</label>
            <select id="hero-guests" name="guests" defaultValue="2 guests" autoComplete="off">
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
