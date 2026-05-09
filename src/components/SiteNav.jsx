import { useState, useEffect, useRef } from 'react';
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

const BookingIcon = (p) => (
  <svg width={p.size || 16} height={p.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
    <line x1="3" y1="6" x2="21" y2="6" />
    <path d="M16 10a4 4 0 0 1-8 0" />
  </svg>
);

export default function SiteNav() {
  const [navOpen, setNavOpen] = useState(false);
  const navRef = useRef(null);

  useEffect(() => {
    if (navOpen) {
      document.body.style.overflow = 'hidden';
      const focusable = navRef.current.querySelectorAll(
        'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
      );
      
      if (focusable.length > 0) {
        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        const handleTab = (e) => {
          if (e.key === 'Tab') {
            if (e.shiftKey && document.activeElement === first) {
              e.preventDefault();
              last.focus();
            } else if (!e.shiftKey && document.activeElement === last) {
              e.preventDefault();
              first.focus();
            }
          }
        };
        
        document.addEventListener('keydown', handleTab);
        return () => {
          document.body.style.overflow = '';
          document.removeEventListener('keydown', handleTab);
        };
      }
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [navOpen]);

  return (
    <nav className="nav" id="top" ref={navRef}>
      <div className="nav__inner">
        <Link className="nav__logo" to="/">
          <img src="/assets/brand/destination-paradise-logo.png" alt="Destination Paradise" width="48" height="48" />
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
            <span className="nav__cta-text">Book Now</span> <BookingIcon size={16} />
          </Link>
          <button
            className="nav__burger"
            type="button"
            aria-label={navOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={navOpen}
            aria-controls="navMenu"
            onClick={() => setNavOpen((v) => !v)}
          >
            {navOpen ? (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
