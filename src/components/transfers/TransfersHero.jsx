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
        <span className="tr-hero__eyebrow">Transfery prywatne z lotniska, hotelu i po wyspie</span>
        <h1 className="tr-hero__title">
          Pierwsze i ostatnie <em>wrażenie z Zanzibaru</em> — dopracowane.
        </h1>
        <p className="tr-hero__lead">
          Zarezerwuj przejazd przed przylotem, a kierowca będzie czekał z tabliczką, pomoże z bagażem i zawiezie Cię prosto do hotelu klimatyzowanym samochodem.
        </p>
        <div className="tr-hero__cta">
          <a className="btn btn--lg" href="#transfer-types">Zobacz ceny tras</a>
          <a className="btn btn--ghost btn--lg" href={CONTACT_INFO.whatsappUrl} target="_blank" rel="noreferrer">
            Rezerwuj na WhatsApp →
          </a>
        </div>
        <div className="tr-hero__stats">
          <div><strong>Od $25</strong><span>Za pojazd</span></div>
          <div><strong>Prywatnie</strong><span>Powitanie na miejscu</span></div>
          <div><strong>3 poziomy</strong><span>Standard · Premium · VIP</span></div>
          <div><strong>24 / 7</strong><span>Śledzenie lotu</span></div>
        </div>
      </div>
    </section>
  );
}
