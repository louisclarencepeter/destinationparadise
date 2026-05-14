import { CONTACT_INFO } from '../../constants/contactInfo.js';
import { TRANSFERS_HERO_IMAGE } from '../../data/transfersPageContent.js';

export default function TransfersHero() {
  return (
    <section className="tr-hero">
      <div className="tr-hero__bg">
        <img
          src={TRANSFERS_HERO_IMAGE}
          alt=""
          fetchpriority="high"
          loading="eager"
          decoding="sync"
        />
      </div>
      <div className="tr-hero__inner">
        <span className="tr-hero__eyebrow">Private airport · hotel · island transfers</span>
        <h1 className="tr-hero__title">
          Your first and last <em>impression of Zanzibar</em> — done right.
        </h1>
        <p className="tr-hero__lead">
          Pre-booked private transfers with airport meet &amp; greet, AC vehicles, luggage help, and WhatsApp support from the moment you land.
        </p>
        <div className="tr-hero__cta">
          <a className="btn btn--lg" href="#transfer-types">See route pricing</a>
          <a className="btn btn--ghost btn--lg" href={CONTACT_INFO.whatsappUrl} target="_blank" rel="noreferrer">
            Book on WhatsApp →
          </a>
        </div>
        <div className="tr-hero__stats">
          <div><strong>From $25</strong><span>Per vehicle</span></div>
          <div><strong>Private</strong><span>Meet &amp; greet</span></div>
          <div><strong>3 tiers</strong><span>Standard · Premium · VIP</span></div>
          <div><strong>24 / 7</strong><span>Flight tracking</span></div>
        </div>
      </div>
    </section>
  );
}
