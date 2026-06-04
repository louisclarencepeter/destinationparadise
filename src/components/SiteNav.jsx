import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import { CONTACT_INFO } from '../constants/contactInfo';
import SiteSearch, { SearchButton } from './SiteSearch.jsx';
import LanguageSwitcher from './LanguageSwitcher.jsx';

const NAV_ITEMS = [
  { key: 'home', to: '/', end: true, icon: 'home', desktopHidden: true },
  { key: 'excursions', to: '/excursions', icon: 'compass' },
  { key: 'safaris', to: '/safaris', icon: 'binoculars' },
  { key: 'packages', to: '/packages', icon: 'suitcase' },
  { key: 'retreats', to: '/retreats', icon: 'lotus' },
  { key: 'trip_planner', to: '/trip-planner', icon: 'route', hasBadge: true },
  { key: 'explore', to: '/explore', icon: 'map' },
  { key: 'about', to: '/aboutus', icon: 'info', desktopHidden: true },
  { key: 'book', to: '/booking', icon: 'bag', mobileOnly: true },
];

const NAV_ICONS = {
  home: ['M3 10.5 12 3l9 7.5', 'M5 9.5V21h5v-6h4v6h5V9.5'],
  compass: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'm15.5 8.5-2 5-5 2 2-5 5-2Z'],
  binoculars: ['M7 6h3l2 8H7L5 9a3 3 0 0 1 2-3Z', 'M17 6h-3l-2 8h5l2-5a3 3 0 0 0-2-3Z', 'M7 14a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z', 'M17 14a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z'],
  suitcase: ['M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2', 'M5 7h14a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V9a2 2 0 0 1 2-2Z', 'M3 13h18'],
  lotus: ['M12 21c-3 0-5.6-1.8-6.9-4.6C7.1 15.8 10 17 12 21c2-4 4.9-5.2 6.9-4.6C17.6 19.2 15 21 12 21Z', 'M12 21c-1.7-2.6-1.7-5.6 0-8.2 1.7 2.6 1.7 5.6 0 8.2Z', 'M12 21c.4-3.1 2.5-5.4 5.2-6.2-.3 3.1-2.5 5.4-5.2 6.2Z', 'M12 21c-.4-3.1-2.5-5.4-5.2-6.2.3 3.1 2.5 5.4 5.2 6.2Z'],
  route: ['M5 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z', 'M19 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z', 'M7 16h4a4 4 0 0 0 0-8h6'],
  map: ['M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Z', 'M9 3v15', 'M15 6v15'],
  bag: ['M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z', 'M3 6h18', 'M16 10a4 4 0 0 1-8 0'],
  info: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'M12 11v6', 'M12 7.5h.01'],
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

const ArrowRight = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M5 12h14" />
    <path d="M13 5l7 7-7 7" />
  </svg>
);

const SunIcon = ({ className }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
  </svg>
);

const MoonIcon = ({ className }) => (
  <svg className={className} width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
  </svg>
);

const CloseIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

const ChevronRight = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M9 6l6 6-6 6" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="22" height="22" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
    <path d="M19.11 17.205c-.372 0-1.088 1.39-1.518 1.39a.63.63 0 0 1-.315-.1c-.802-.402-1.504-.817-2.163-1.447-.545-.516-1.146-1.29-1.46-1.963a.426.426 0 0 1-.073-.215c0-.33.99-.945.99-1.49 0-.143-.73-2.09-.832-2.335-.143-.372-.214-.487-.6-.487-.187 0-.36-.043-.53-.043-.302 0-.53.115-.746.315-.688.645-1.032 1.318-1.06 2.264v.114c-.015.99.472 1.977 1.017 2.78 1.23 1.82 2.506 3.41 4.554 4.34.616.287 2.035.888 2.722.888.817 0 2.15-.515 2.478-1.318.13-.33.143-.745.143-1.103 0-.272-.058-.387-.215-.515-.158-.143-1.532-.745-1.762-.745zM16.207 4.992c-6.06.058-10.973 5.013-10.973 11.08 0 2.05.572 3.97 1.575 5.63L5.001 27.16l5.658-1.805a11.04 11.04 0 0 0 5.21 1.318c6.103 0 11.073-4.97 11.073-11.072 0-6.045-4.926-10.987-10.987-11.087h-.107v.476h.36zm0 20.13a9.06 9.06 0 0 1-4.624-1.262l-.33-.2-3.466 1.117 1.132-3.398-.215-.345A9.073 9.073 0 0 1 7.18 16.16c0-5 4.067-9.066 9.066-9.066 5 0 9.066 4.066 9.066 9.066s-4.066 9.066-9.066 9.066h-.043z"/>
  </svg>
);

// V2 mobile menu rows — labels/subs read from i18n nav namespace
const MM_ITEMS = [
  { key: 'excursions',   to: '/excursions'    },
  { key: 'safaris',      to: '/safaris'       },
  { key: 'packages',     to: '/packages'      },
  { key: 'retreats',     to: '/retreats'      },
  { key: 'trip_planner', to: '/trip-planner', hasBadge: true },
  { key: 'explore',      to: '/explore'       },
];

const MM_BGS = [
  '/assets/images/excursions/dream-dhow-sunset.webp',
  '/assets/images/excursions/safari-blue-sandbank.webp',
  '/assets/images/home/aerial-boats-turquoise-water.webp',
  '/assets/images/home/stone-town-waterfront.webp',
  '/assets/images/safaris/zebra-herd-on-track.webp',
];

const MOBILE_NAV_QUERY = '(max-width: 960px)';

export default function SiteNav({ theme = 'light', themeMode = 'auto', onThemeModeChange }) {
  const { t } = useTranslation('nav');
  const { t: tFooter } = useTranslation('footer');
  const [navOpen, setNavOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [bgIndex, setBgIndex] = useState(() => Math.floor(Math.random() * MM_BGS.length));
  const navRef = useRef(null);
  const mmRef = useRef(null);
  const location = useLocation();

  // Close on route change
  useEffect(() => {
    setNavOpen(false);
    setSearchOpen(false);
  }, [location.pathname, location.search, location.hash]);

  // Rotate background each time the menu opens — pick a different image than last time
  useEffect(() => {
    if (!navOpen || MM_BGS.length < 2) return;
    setBgIndex((prev) => {
      let next = prev;
      while (next === prev) next = Math.floor(Math.random() * MM_BGS.length);
      return next;
    });
  }, [navOpen]);

  useEffect(() => {
    const mediaQuery = window.matchMedia(MOBILE_NAV_QUERY);
    let previousBodyOverflow;

    const closeOnDesktop = () => {
      if (!mediaQuery.matches) setNavOpen(false);
    };

    closeOnDesktop();
    mediaQuery.addEventListener('change', closeOnDesktop);

    if (navOpen && mediaQuery.matches) {
      previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';

      const handleKey = (e) => {
        if (e.key === 'Escape') {
          setNavOpen(false);
          return;
        }
        const scope = mmRef.current || navRef.current;
        const focusable = scope ? scope.querySelectorAll(
          'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
        ) : [];
        if (e.key === 'Tab' && focusable.length > 0) {
          const first = focusable[0];
          const last = focusable[focusable.length - 1];
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      };

      document.addEventListener('keydown', handleKey);
      return () => {
        document.body.style.overflow = previousBodyOverflow ?? '';
        document.removeEventListener('keydown', handleKey);
        mediaQuery.removeEventListener('change', closeOnDesktop);
      };
    }

    return () => {
      mediaQuery.removeEventListener('change', closeOnDesktop);
    };
  }, [navOpen]);

  const isCurrent = (to, end) => (end ? location.pathname === to : location.pathname.startsWith(to));

  return (
    <nav className="nav" id="top" ref={navRef}>
      <div className="nav__inner">
        <Link className="nav__logo" to="/">
          <img src="/assets/brand/destination-paradise-logo-96.webp" alt="Destination Paradise" width="48" height="48" decoding="async" />
          <span className="nav__logo-text">Destination Paradise<small>Zanzibar &amp; Tanzania</small></span>
        </Link>
        <ul className="nav__menu" id="navMenu">
          {NAV_ITEMS.map((item) => {
            const modifiers = [
              item.mobileOnly ? 'nav__item--mobile-only' : '',
              item.desktopHidden ? 'nav__item--desktop-hide' : '',
            ].filter(Boolean).join(' ');
            const badge = item.hasBadge ? t(`items.${item.key}.badge`, '') : '';
            return (
              <li className={`nav__item${modifiers ? ' ' + modifiers : ''}`} key={item.to}>
                <NavLink to={item.to} end={item.end}>
                  <span className="nav__link-icon"><NavIcon name={item.icon} /></span>
                  <span className="nav__link-copy">
                    <span className="nav__link-label">
                      {t(`items.${item.key}.label`)}
                      {badge && <span className="nav__link-badge">{badge}</span>}
                    </span>
                    <span className="nav__link-hint">{t(`items.${item.key}.hint`)}</span>
                  </span>
                </NavLink>
              </li>
            );
          })}
        </ul>
        <div className="nav__right">
          <LanguageSwitcher className="nav__lang" />
          <button
            type="button"
            className="theme-toggle nav__theme-toggle"
            aria-label={tFooter('theme.group_label')}
            aria-pressed={theme === 'dark'}
            onClick={() => onThemeModeChange?.(theme === 'dark' ? 'light' : 'dark')}
          >
            <SunIcon className="theme-toggle__sun" />
            <MoonIcon className="theme-toggle__moon" />
          </button>
          <SearchButton className="nav__search" onClick={() => setSearchOpen(true)} label={t('search.label_short')} />
          <Link className="btn nav__cta" to="/booking" aria-label={t('cta.book_aria')}>
            <span className="nav__cta-text">{t('cta.book_now')}</span> <ArrowRight size={16} />
          </Link>
          <button
            className={`nav__burger${navOpen ? ' nav__burger--open' : ''}`}
            type="button"
            aria-label={navOpen ? t('menu.close') : t('menu.open')}
            aria-expanded={navOpen}
            aria-controls="mobileMenu"
            onClick={() => setNavOpen((v) => !v)}
          >
            <span className="nav__burger-box" aria-hidden="true">
              <span className="nav__burger-line" />
              <span className="nav__burger-line" />
              <span className="nav__burger-line" />
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobileMenu"
        ref={mmRef}
        className={`mm-menu${navOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={t('menu.site_nav_label')}
        {...(navOpen ? {} : { inert: '' })}
      >
        <div className="mm-menu__bg" style={navOpen ? { backgroundImage: `url('${MM_BGS[bgIndex]}')` } : undefined} />
        <div className="mm-menu__scrim" />

        <div className="mm-menu__bar">
          <Link to="/" className="mm-menu__brand">
            <img src="/assets/brand/destination-paradise-logo-96.webp" alt="" width="38" height="38" decoding="async" />
            <span className="mm-menu__brand-text">Destination Paradise<small>Zanzibar &amp; Tanzania</small></span>
          </Link>
          <button
            type="button"
            className="mm-menu__close"
            aria-label={t('menu.close')}
            onClick={() => setNavOpen(false)}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="mm-menu__hero">
          <span className="mm-menu__eyebrow">{t('menu.eyebrow')}</span>
          <p className="mm-menu__head">
            <Trans i18nKey="menu.headline" ns="nav" components={{ em: <em /> }} />
          </p>
        </div>

        <ul className="mm-menu__list">
          {MM_ITEMS.map((item) => {
            const active = isCurrent(item.to, item.end);
            const label = t(`items.${item.key}.label`);
            const sub = t(`items.${item.key}.sub`, '');
            const badge = item.hasBadge ? t(`items.${item.key}.badge`, '') : '';
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="mm-menu__row"
                  aria-current={active ? 'page' : undefined}
                >
                  <span className="mm-menu__row-main">
                    <span className="mm-menu__lbl">
                      {active ? <em>{label}</em> : label}
                      {badge && <span className="mm-menu__pill-inline">{badge}</span>}
                    </span>
                    {sub && <span className="mm-menu__sub">{sub}</span>}
                  </span>
                  <span className="mm-menu__arr"><ChevronRight /></span>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mm-menu__foot">
          <SearchButton
            className="mm-menu__search"
            onClick={() => {
              setNavOpen(false);
              setSearchOpen(true);
            }}
            label={t('search.label_long')}
          />
          <Link to="/booking" className="mm-menu__cta">
            {t('cta.book_a_trip')} <ChevronRight />
          </Link>
          <a
            className="mm-menu__wa"
            href={CONTACT_INFO.whatsappUrl}
            target="_blank"
            rel="noreferrer noopener"
            aria-label={t('whatsapp.chat_aria')}
          >
            <WhatsAppIcon />
          </a>
          <div className="mm-menu__utility">
            <LanguageSwitcher className="mm-menu__lang" />
            <button
              type="button"
              className="theme-toggle mm-menu__theme"
              aria-label={tFooter('theme.group_label')}
              aria-pressed={theme === 'dark'}
              onClick={() => onThemeModeChange?.(theme === 'dark' ? 'light' : 'dark')}
            >
              <SunIcon className="theme-toggle__sun" />
              <MoonIcon className="theme-toggle__moon" />
            </button>
          </div>
        </div>
      </div>
      <SiteSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </nav>
  );
}
