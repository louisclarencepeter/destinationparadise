import { useState, useEffect, useRef } from 'react';
import { Link, NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Home', to: '/', end: true, icon: 'home', hint: 'Start at the island hub' },
  { label: 'Excursions', to: '/excursions', icon: 'compass', hint: 'Zanzibar day trips' },
  { label: 'Safaris', to: '/safaris', icon: 'binoculars', hint: 'Mainland wildlife routes' },
  { label: 'Packages', to: '/packages', icon: 'suitcase', hint: 'Safari, beach, honeymoon' },
  { label: 'Trip Planner', to: '/trip-planner', icon: 'route', hint: 'Shape a custom route' },
  { label: 'Explore', to: '/explore', icon: 'map', hint: 'Compare places and styles' },
  { label: 'Book Now', to: '/booking', icon: 'bag', hint: 'Send a booking request', mobileOnly: true },
];

const NAV_ICONS = {
  home: ['M3 10.5 12 3l9 7.5', 'M5 9.5V21h5v-6h4v6h5V9.5'],
  compass: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'm15.5 8.5-2 5-5 2 2-5 5-2Z'],
  binoculars: ['M7 6h3l2 8H7L5 9a3 3 0 0 1 2-3Z', 'M17 6h-3l-2 8h5l2-5a3 3 0 0 0-2-3Z', 'M7 14a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z', 'M17 14a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z'],
  suitcase: ['M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2', 'M5 7h14a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V9a2 2 0 0 1 2-2Z', 'M3 13h18'],
  route: ['M5 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z', 'M19 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z', 'M7 16h4a4 4 0 0 0 0-8h6'],
  map: ['M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Z', 'M9 3v15', 'M15 6v15'],
  bag: ['M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z', 'M3 6h18', 'M16 10a4 4 0 0 1-8 0'],
};

const NavIcon = ({ name }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {NAV_ICONS[name].map((path) => <path key={path} d={path} />)}
  </svg>
);

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

  const closeMenuFromLink = (event) => {
    if (event.target instanceof Element && event.target.closest('a')) {
      setNavOpen(false);
    }
  };

  return (
    <nav className="nav" id="top" ref={navRef}>
      <div className="nav__inner">
        <Link className="nav__logo" to="/">
          <img src="/assets/brand/destination-paradise-logo.png" alt="Destination Paradise" width="48" height="48" />
          <span className="nav__logo-text">Destination Paradise<small>Zanzibar &amp; Tanzania</small></span>
        </Link>
        <ul className={`nav__menu${navOpen ? ' nav__menu--open' : ''}`} id="navMenu" onClick={closeMenuFromLink}>
          {NAV_ITEMS.map((item) => (
            <li className={`nav__item${item.mobileOnly ? ' nav__item--mobile-only' : ''}`} key={item.to}>
              <NavLink to={item.to} end={item.end}>
                <span className="nav__link-icon"><NavIcon name={item.icon} /></span>
                <span className="nav__link-copy">
                  <span className="nav__link-label">{item.label}</span>
                  <span className="nav__link-hint">{item.hint}</span>
                </span>
              </NavLink>
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
