import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../styles/homepage.css';
import { CONTACT_INFO, SOCIAL_LINKS } from '../constants/contactInfo.js';

export const WHATSAPP_URL = CONTACT_INFO.whatsappUrl;

export const WhatsAppIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.47-.148-.669.15-.198.296-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
  </svg>
);

const ThemeIcon = ({ theme }) => (
  theme === 'dark' ? (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
    </svg>
  ) : (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
);

const FOOTER_ICONS = {
  home: ['M3 10.5 12 3l9 7.5', 'M5 9.5V21h5v-6h4v6h5V9.5'],
  compass: ['M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z', 'm15.5 8.5-2 5-5 2 2-5 5-2Z'],
  binoculars: ['M7 6h3l2 8h-5L5 9a3 3 0 0 1 2-3Z', 'M17 6h-3l-2 8h5l2-5a3 3 0 0 0-2-3Z', 'M7 14a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z', 'M17 14a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z'],
  suitcase: ['M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2', 'M5 7h14a2 2 0 0 1 2 2v9a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V9a2 2 0 0 1 2-2Z', 'M3 13h18'],
  route: ['M5 18a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z', 'M19 10a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z', 'M7 16h4a4 4 0 0 0 0-8h6'],
  map: ['M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Z', 'M9 3v15', 'M15 6v15'],
  book: ['M4 5a3 3 0 0 1 3-3h13v17H7a3 3 0 0 0-3 3V5Z', 'M4 5v17'],
  users: ['M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2', 'M9.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z', 'M22 21v-2a4 4 0 0 0-3-3.87', 'M16 3.13a4 4 0 0 1 0 7.75'],
  leaf: ['M20 4c-7.5.5-12.5 4.5-13 11 4.5.5 9.5-1.5 13-11Z', 'M5 19c3-5 7-8 12-10'],
  newspaper: ['M4 5h13a3 3 0 0 1 3 3v11H7a3 3 0 0 1-3-3V5Z', 'M8 9h5', 'M8 13h8', 'M8 17h6'],
  briefcase: ['M9 6V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1', 'M4 6h16v12a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3V6Z', 'M4 12h16'],
  mail: ['M4 5h16v14H4V5Z', 'm4 7 8 6 8-6'],
  phone: ['M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.35 1.9.66 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.31 1.84.53 2.8.66A2 2 0 0 1 22 16.92Z'],
  pin: ['M12 21s7-5.8 7-12a7 7 0 1 0-14 0c0 6.2 7 12 7 12Z', 'M12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z'],
  message: ['M21 12a8 8 0 0 1-8 8H6l-3 3v-7a8 8 0 1 1 18-4Z'],
  plane: ['M21 16 3 21l5-9-5-9 18 5-8 4 8 4Z'],
};

const FooterIcon = ({ name }) => (
  <svg className="footer__link-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {FOOTER_ICONS[name].map((path) => <path key={path} d={path} />)}
  </svg>
);

const HERO_SELECTOR = [
  'section.hero',
  'section.exc-hero',
  'section.saf-hero',
  'section.trip-hero',
  'section.booking-hero',
  'section[class*="-hero"]',
].join(', ');

function getFloatGap() {
  if (window.innerWidth <= 360) return 11;
  if (window.innerWidth <= 720) return 16;
  return 24;
}

function getNavHeight() {
  const value = getComputedStyle(document.documentElement).getPropertyValue('--nav-height');
  return Number.parseFloat(value) || 66;
}

function getPageHero() {
  return document.querySelector(HERO_SELECTOR) || document.querySelector('#root section');
}

export function WhatsAppFab({ locationKey }) {
  const fabRef = useRef(null);
  const [placement, setPlacement] = useState({ isVisible: false, isParked: false, top: 0 });

  useEffect(() => {
    let frameId = 0;

    const updatePlacement = () => {
      frameId = 0;

      const fab = fabRef.current;
      const footer = document.querySelector('.footer');
      const hero = getPageHero();
      const scrollY = window.scrollY || document.documentElement.scrollTop || 0;
      const gap = getFloatGap();
      const navHeight = getNavHeight();
      const fabHeight = fab?.offsetHeight || 52;
      const heroBottom = hero ? hero.getBoundingClientRect().bottom + scrollY : 0;
      const isVisible = hero ? scrollY + navHeight >= heroBottom - 8 : scrollY > 120;

      let isParked = false;
      let top = 0;

      if (footer) {
        const footerTop = footer.getBoundingClientRect().top + scrollY;
        const fixedBottom = window.innerHeight - gap;
        isParked = footer.getBoundingClientRect().top <= fixedBottom + gap;
        top = Math.max(heroBottom + gap, footerTop - fabHeight - gap);
      }

      setPlacement((current) => {
        if (current.isVisible === isVisible && current.isParked === isParked && Math.abs(current.top - top) < 1) {
          return current;
        }
        return { isVisible, isParked, top };
      });
    };

    const requestUpdate = () => {
      if (!frameId) frameId = window.requestAnimationFrame(updatePlacement);
    };

    setPlacement({ isVisible: false, isParked: false, top: 0 });
    requestUpdate();

    const timeoutId = window.setTimeout(requestUpdate, 150);
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
      if (frameId) window.cancelAnimationFrame(frameId);
    };
  }, [locationKey]);

  const className = [
    'whatsapp-fab',
    placement.isVisible ? 'is-visible' : 'is-hidden',
    placement.isParked ? 'is-parked' : '',
  ].filter(Boolean).join(' ');

  return (
    <a
      ref={fabRef}
      className={className}
      href={WHATSAPP_URL}
      target="_blank"
      rel="noreferrer"
      aria-label="Chat with the team on WhatsApp"
      style={placement.isParked ? { top: `${placement.top}px` } : undefined}
    >
      <WhatsAppIcon />
      <span className="whatsapp-fab__dot" aria-hidden="true"></span>
      <span className="whatsapp-fab__label">Chat with the team</span>
    </a>
  );
}

export default function SiteFooter({ theme = 'light', onThemeToggle }) {
  const nextTheme = theme === 'dark' ? 'light' : 'dark';

  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <div className="footer__logo">
            <img src="/assets/brand/destination-paradise-logo.png" alt="Destination Paradise" />
            <span className="footer__logo-text">Destination Paradise<small>Zanzibar &amp; Tanzania</small></span>
          </div>
          <p>A small, local travel company on the shores of Zanzibar. Unhurried days, traditional boats, and guides who grew up here.</p>
          <p className="footer__script">your next trip to paradise...</p>
          <div className="footer__socials">
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" aria-label="WhatsApp"><WhatsAppIcon /></a>
            <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noreferrer" aria-label="Instagram"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75"><rect x="2" y="2" width="20" height="20" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" y1="6.5" x2="17.51" y2="6.5" strokeWidth="2" /></svg></a>
            <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noreferrer" aria-label="Facebook"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg></a>
            <a href={SOCIAL_LINKS.youtube} target="_blank" rel="noreferrer" aria-label="YouTube"><svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" /></svg></a>
            <a href={SOCIAL_LINKS.x} target="_blank" rel="noreferrer" aria-label="X"><svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" /></svg></a>
          </div>
        </div>
        <div className="footer__col">
          <h4>Pages</h4>
          <ul>
            <li><Link to="/"><FooterIcon name="home" />Home</Link></li>
            <li><Link to="/excursions"><FooterIcon name="compass" />Excursions</Link></li>
            <li><Link to="/safaris"><FooterIcon name="binoculars" />Safaris</Link></li>
            <li><Link to="/packages"><FooterIcon name="suitcase" />Packages</Link></li>
            <li><Link to="/trip-planner"><FooterIcon name="route" />Trip Planner</Link></li>
            <li><Link to="/explore"><FooterIcon name="map" />Explore</Link></li>
          </ul>
        </div>
        <div className="footer__col">
          <h4>Company</h4>
          <ul>
            <li><Link to="/aboutus"><FooterIcon name="book" />Our story</Link></li>
            <li><Link to="/aboutus"><FooterIcon name="users" />Guides</Link></li>
            <li><Link to="/aboutus"><FooterIcon name="leaf" />Sustainability</Link></li>
            <li><Link to="/aboutus"><FooterIcon name="newspaper" />Press</Link></li>
            <li><Link to="/aboutus"><FooterIcon name="briefcase" />Careers</Link></li>
          </ul>
        </div>
        <div className="footer__col">
          <h4>Get in touch</h4>
          <ul>
            <li><a href={`mailto:${CONTACT_INFO.email}`}><FooterIcon name="mail" />{CONTACT_INFO.email}</a></li>
            <li><a href={`tel:${CONTACT_INFO.phones[0]}`}><FooterIcon name="phone" />+255 768 779 517</a></li>
            <li><a href={`tel:${CONTACT_INFO.phones[1]}`}><FooterIcon name="phone" />+255 748 352 657</a></li>
            <li><Link to="/#contact"><FooterIcon name="pin" />{CONTACT_INFO.location}</Link></li>
            <li><a href={WHATSAPP_URL} target="_blank" rel="noreferrer"><FooterIcon name="message" />WhatsApp us</a></li>
            <li><a href={WHATSAPP_URL} target="_blank" rel="noreferrer"><FooterIcon name="plane" />Airport &amp; island transfers</a></li>
          </ul>
        </div>
      </div>
      <div className="footer__theme-row">
        <button
          className="footer__theme-toggle"
          type="button"
          aria-label={`Switch to ${nextTheme} theme`}
          onClick={() => onThemeToggle?.(nextTheme)}
        >
          <ThemeIcon theme={theme} />
          <span>{theme === 'dark' ? 'Light mode' : 'Dark mode'}</span>
        </button>
      </div>
      <div className="footer__bottom">
        <span className="footer__copyright">© {new Date().getFullYear()} Destination Paradise · Zanzibar, Tanzania</span>
        <span className="footer__policy-links"><Link to="/privacy-policy">Privacy</Link> <Link to="/terms-of-service">Terms</Link> <Link to="/cookies-policy">Cookies</Link></span>
      </div>
    </footer>
  );
}
