import { Link } from 'react-router-dom';
import '../styles/homepage.css';
import { CONTACT_INFO, SOCIAL_LINKS } from '../constants/contactInfo.js';

export const WHATSAPP_URL = CONTACT_INFO.whatsappUrl;

export const WhatsAppIcon = ({ size = 20 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.47-.148-.669.15-.198.296-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.372-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413" />
  </svg>
);

export function WhatsAppFab() {
  return (
    <a className="whatsapp-fab" href={WHATSAPP_URL} target="_blank" rel="noreferrer" aria-label="Chat with the team on WhatsApp">
      <WhatsAppIcon />
      <span className="whatsapp-fab__dot" aria-hidden="true"></span>
      <span className="whatsapp-fab__label">Chat with the team</span>
    </a>
  );
}

export default function SiteFooter() {
  return (
    <footer className="footer">
      <div className="footer__inner">
        <div className="footer__brand">
          <div className="footer__logo">
            <img src="/assets/brand/destination-paradise-logo.png" alt="Destination Paradise" />
            <span className="footer__logo-text">Destination Paradise<small>Zanzibar Island</small></span>
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
        <div className="footer__col"><h4>Pages</h4><ul><li><Link to="/">Home</Link></li><li><Link to="/excursions">Excursions</Link></li><li><Link to="/safaris">Safaris</Link></li><li><Link to="/packages">Packages</Link></li><li><Link to="/trip-planner">Trip Planner</Link></li><li><Link to="/explore">Explore</Link></li></ul></div>
        <div className="footer__col"><h4>Company</h4><ul><li><Link to="/aboutus">Our story</Link></li><li><Link to="/aboutus">Guides</Link></li><li><Link to="/aboutus">Sustainability</Link></li><li><Link to="/aboutus">Press</Link></li><li><Link to="/aboutus">Careers</Link></li></ul></div>
        <div className="footer__col"><h4>Get in touch</h4><ul><li><a href={`mailto:${CONTACT_INFO.email}`}>{CONTACT_INFO.email}</a></li><li><a href={`tel:${CONTACT_INFO.phones[0]}`}>+255 768 779 517</a></li><li><a href={`tel:${CONTACT_INFO.phones[1]}`}>+255 748 352 657</a></li><li><Link to="/#contact">{CONTACT_INFO.location}</Link></li><li><a href={WHATSAPP_URL} target="_blank" rel="noreferrer">WhatsApp us</a></li></ul></div>
      </div>
      <div className="footer__bottom">
        <span>© {new Date().getFullYear()} Destination Paradise · Zanzibar, Tanzania</span>
        <span><Link to="/privacy-policy">Privacy</Link> <Link to="/terms-of-service">Terms</Link> <Link to="/cookies-policy">Cookies</Link></span>
      </div>
    </footer>
  );
}
