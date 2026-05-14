import ResponsiveImage from '../ResponsiveImage.jsx';
import { ABOUT_HERO_IMAGE } from '../../data/aboutPageData.js';

export default function AboutHero() {
  return (
    <section className="ab-hero" id="ab-top">
      <div className="ab-hero__bg">
        <ResponsiveImage src={ABOUT_HERO_IMAGE} alt="Żurawie koroniaste w wysokiej trawie o świcie" fetchpriority="high" loading="eager" decoding="sync" />
      </div>
      <div className="ab-hero__inner">
        <span className="ab-hero__eyebrow">O Destination Paradise</span>
        <h1 className="ab-hero__title">Wizja, która <em>wreszcie</em> rusza w pierwszą podróż.</h1>
        <p className="ab-hero__lead">Destination Paradise narodziło się z marzenia: łączyć ludzi z pięknem, kulturą i duchem Tanzanii. Po latach przygotowań oficjalnie startujemy z Ungui na Zanzibarze.</p>
        <div className="ab-hero__stats">
          <div><strong><em>Teraz</em></strong><span>Unguja</span></div>
          <div><strong><em>Teraz</em></strong><span>Kontynent</span></div>
          <div><strong>Wkrótce</strong><span>Pemba</span></div>
          <div><strong>Wkrótce</strong><span>Mafia Island</span></div>
        </div>
      </div>
    </section>
  );
}
