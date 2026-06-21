import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('transfers');

  return (
    <section className="tr-cta">
      <div className="tr-cta__bg">
        <img className="dp-drift" src={TRANSFERS_CTA_IMAGE} alt="" loading="lazy" />
        <div className="tr-cta__overlay" />
      </div>
      <div className="tr-cta__inner">
        <span className="section-eyebrow reveal" style={{ '--reveal-index': 0 }}>{t('cta.eyebrow')}</span>
        <h2 className="reveal" style={{ '--reveal-index': 1 }}>{t('cta.title')}</h2>
        <p className="reveal" style={{ '--reveal-index': 2 }}>{t('cta.text')}</p>
        <div className="tr-cta__btns reveal" style={{ '--reveal-index': 3 }}>
          <a
            className="btn btn--lg btn--accent"
            href={CONTACT_INFO.whatsappUrl}
            target="_blank"
            rel="noreferrer"
          >
            {t('cta.whatsapp')}
          </a>
          <Link className="btn btn--ghost-light btn--lg" to="/booking?type=transfer#booking-details">
            {t('cta.booking_form')}
          </Link>
        </div>
        <div className="tr-cta__contacts reveal" style={{ '--reveal-index': 4 }}>
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
