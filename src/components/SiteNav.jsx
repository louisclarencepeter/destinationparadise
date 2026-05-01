import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';

const NAV_ITEMS = [
  { label: 'Home', to: '/', end: true },
  { label: 'Excursions', to: '/excursions' },
  { label: 'Safaris', to: '/safaris' },
  { label: 'Packages', to: '/packages' },
  { label: 'Trip Planner', to: '/trip-planner' },
  { label: 'Explore', to: '/explore' },
];

const ArrowIcon = (p) => (
  <svg width={p.size || 16} height={p.size || 16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

function getInitialTheme() {
  try {
    const saved = JSON.parse(localStorage.getItem('dp_tweaks') || 'null');
    if (saved?.theme) return saved.theme;
  } catch (e) { /* noop */ }
  return document.documentElement.getAttribute('data-theme') || 'light';
}

export default function SiteNav(props) {
  const controlledTheme = props?.theme;
  const onThemeToggle = props?.onThemeToggle;
  const [navOpen, setNavOpen] = useState(false);
  const [localTheme, setLocalTheme] = useState(getInitialTheme);
  const theme = controlledTheme || localTheme;

  useEffect(() => {
    if (controlledTheme) return;
    document.documentElement.setAttribute('data-theme', localTheme);
    try {
      const saved = JSON.parse(localStorage.getItem('dp_tweaks') || '{}');
      localStorage.setItem('dp_tweaks', JSON.stringify({ ...saved, theme: localTheme }));
    } catch (e) { /* noop */ }
    window.dispatchEvent(new CustomEvent('dp-theme-change', { detail: { theme: localTheme } }));
  }, [controlledTheme, localTheme]);

  const toggleTheme = () => {
    if (onThemeToggle) {
      onThemeToggle();
      return;
    }
    setLocalTheme((current) => (current === 'dark' ? 'light' : 'dark'));
  };

  return (
    <nav className="nav" id="top">
      <div className="nav__inner">
        <Link className="nav__logo" to="/">
          <img src="/assets/brand/destination-paradise-logo.png" alt="Destination Paradise" />
          <span className="nav__logo-text">Destination Paradise<small>Zanzibar Island</small></span>
        </Link>
        <ul className={`nav__menu${navOpen ? ' nav__menu--open' : ''}`} id="navMenu" onClick={(e) => { if (e.target.tagName === 'A') setNavOpen(false); }}>
          {NAV_ITEMS.map((item) => (
            <li className="nav__item" key={item.to}>
              <NavLink to={item.to} end={item.end}>{item.label}</NavLink>
            </li>
          ))}
        </ul>
        <div className="nav__right">
          <button
            className="theme-toggle"
            type="button"
            aria-label="Toggle theme"
            onClick={toggleTheme}
          >
            {theme === 'dark' ? (
              <svg className="i-moon" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            ) : (
              <svg className="i-sun" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
              </svg>
            )}
          </button>
          <Link className="btn nav__cta" to="/booking">
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
