import { Link } from 'react-router-dom';
import { CONTACT_INFO } from '../../constants/contactInfo.js';
import { TRANSFERS_CTA_IMAGE } from '../../data/transfersPageContent.js';

function PhoneIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.35 1.9.66 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.31 1.84.53 2.8.66A2 2 0 0 1 22 16.92Z" />
    </svg>
  );
}

export default function TransfersCta() {
  return (
    <section className="tr-cta">
      <div className="tr-cta__bg">
        <img src={TRANSFERS_CTA_IMAGE} alt="" loading="lazy" />
        <div className="tr-cta__overlay" />
      </div>
      <div className="tr-cta__inner">
        <span className="section-eyebrow">Ready to book?</span>
        <h2>Tell us your route. We&apos;ll match the right vehicle.</h2>
        <p>
          Share your flight, hotel, guest count, and luggage needs on WhatsApp. We&apos;ll confirm the best private, premium, or VIP option.
        </p>
        <div className="tr-cta__btns">
          <a
            className="btn btn--lg btn--accent"
            href={CONTACT_INFO.whatsappUrl}
            target="_blank"
            rel="noreferrer"
          >
            Book on WhatsApp →
          </a>
          <Link className="btn btn--ghost-light btn--lg" to="/booking?type=transfer#booking-details">
            Use the booking form
          </Link>
        </div>
        <div className="tr-cta__contacts">
          <a href={`tel:${CONTACT_INFO.phones[0]}`}>
            <PhoneIcon />
            +255 768 779 517
          </a>
          <a href={`tel:${CONTACT_INFO.phones[1]}`}>
            <PhoneIcon />
            +255 748 352 657
          </a>
        </div>
      </div>
    </section>
  );
}
