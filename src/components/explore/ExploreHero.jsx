import { Link } from 'react-router-dom';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { EXCURSIONS } from '../../data/excursionsData.js';
import { destinationParadisePackages } from '../../data/destinationParadisePackages.js';
import { destinationParadiseSafariPricing } from '../../data/safariPricing.js';
import { EXPLORE_HERO_IMAGE, MIN_PACKAGE_PRICE } from '../../data/explorePageContent.js';

export default function ExploreHero() {
  return (
    <section className="exc-hero explore-hero">
      <div className="exc-hero__bg">
        <ResponsiveImage src={EXPLORE_HERO_IMAGE} alt="" fetchpriority="high" loading="eager" decoding="sync" />
      </div>
      <div className="exc-hero__inner">
        <span className="exc-hero__eyebrow">Odkryj Zanzibar i Tanzanię</span>
        <h1 className="exc-hero__title">Zacznij od miejsca <em>albo od stylu podróży.</em></h1>
        <p className="exc-hero__lead">Potraktuj tę stronę jak mapę: pakiety, gdy chcesz mieć wszystko ułożone; wycieczki, gdy jesteś już na Zanzibarze; safari, gdy celem jest dzika przyroda; planer, gdy jeszcze się wahasz.</p>
        <div className="exc-hero__row">
          <a className="btn btn--lg" href="#paths">Wybierz kierunek</a>
          <Link className="btn btn--ghost btn--lg" to="/trip-planner">Zaplanuj z AI</Link>
        </div>
        <div className="exc-hero__meta">
          <div><strong>{destinationParadisePackages.length}</strong><span>Pakietów</span></div>
          <div><strong>{destinationParadiseSafariPricing.length}</strong><span>Głównych safari</span></div>
          <div><strong>{EXCURSIONS.length}</strong><span>Wycieczek</span></div>
          <div><strong>${MIN_PACKAGE_PRICE.toLocaleString()}</strong><span>Pakiet od</span></div>
        </div>
      </div>
    </section>
  );
}
