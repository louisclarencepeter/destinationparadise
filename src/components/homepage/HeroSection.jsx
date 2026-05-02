import { ArrowIcon } from './Icons.jsx';
import ScrollCue from './ScrollCue.jsx';

export default function HeroSection({ tweaks, handleHeroSearch }) {
  return (
    <section className={`hero hero--${tweaks.hero}`} id="hero">
      <div className="hero__bg"><img src="/assets/images/home/aerial-boats-turquoise-water.jpg" alt="" /></div>
      <div className="hero__content">
        <span className="hero__eyebrow">Guided excursions · Since 2015</span>
        <h1 className="hero__title">Destination Paradise</h1>
        <h2 className="hero__motto"><i>your next trip to paradise…</i></h2>
        <p className="hero__desc">Welcome to your gateway to the enchanting Zanzibar Island. Imagine a place where each day is an adventure, and every horizon promises new discoveries.</p>
        <div className="hero__cta-row">
          <a className="btn" href="#excursions">Browse excursions <ArrowIcon size={18} /></a>
          <a className="btn btn--ghost" href="#map">Explore the island</a>
        </div>
        <form className="hero__search" onSubmit={handleHeroSearch}>
          <div className="hero__search-field">
            <label>Excursion</label>
            <select name="excursion" defaultValue="Any experience">
              <option>Any experience</option>
              <option>Stone Town Heritage Walk</option>
              <option>Safari Blue Dhow</option>
              <option>Spice &amp; Culture Tour</option>
              <option>Dream Dhow Sunset</option>
              <option>Dolphin Snorkeling</option>
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
            Find trips
          </button>
        </form>
      </div>
      <ScrollCue to="excursions" label="Scroll" variant="hero" />
    </section>
  );
}
