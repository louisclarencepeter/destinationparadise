import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Home', to: '/', end: true },
  { label: 'Excursions', to: '/excursions' },
  { label: 'Safaris', to: '/safaris' },
  { label: 'Packages', to: '/packages' },
  { label: 'Trip Planner', to: '/trip-planner' },
  { label: 'Explore', to: '/explore' },
  { label: 'Book Now', to: '/booking', mobileOnly: true },
];

const ArrowIcon = (p) => (
  <svg width={p.size || 16} height={p.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

export default function SiteNav() {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <nav className="nav" id="top">
      <div className="nav__inner">
        <Link className="nav__logo" to="/">
          <img src="/assets/brand/destination-paradise-logo.png" alt="Destination Paradise" />
          <span className="nav__logo-text">Destination Paradise<small>Zanzibar &amp; Tanzania</small></span>
        </Link>
        <ul className={`nav__menu${navOpen ? ' nav__menu--open' : ''}`} id="navMenu" onClick={(e) => { if (e.target.tagName === 'A') setNavOpen(false); }}>
          {NAV_ITEMS.map((item) => (
            <li className={`nav__item${item.mobileOnly ? ' nav__item--mobile-only' : ''}`} key={item.to}>
              <NavLink to={item.to} end={item.end}>{item.label}</NavLink>
            </li>
          ))}
        </ul>
        <div className="nav__right">
          <Link className="btn nav__cta" to="/booking" aria-label="Book now">
            <span className="nav__cta-text">Book Now</span> <ArrowIcon size={16} />
          </Link>
          <button
            className="nav__burger"
            type="button"
            aria-label={navOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={navOpen}
            aria-controls="navMenu"
            onClick={() => setNavOpen((v) => !v)}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            </svg>
          </button>
        </div>
      </div>
    </nav>
  );
}
