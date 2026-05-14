import ResponsiveImage from '../ResponsiveImage.jsx';
import { ABOUT_HERO_IMAGE } from '../../data/aboutPageData.js';

export default function AboutHero() {
  return (
    <section className="ab-hero" id="ab-top">
      <div className="ab-hero__bg">
        <ResponsiveImage src={ABOUT_HERO_IMAGE} alt="Crowned cranes in long grass at dawn" fetchpriority="high" loading="eager" decoding="sync" />
      </div>
      <div className="ab-hero__inner">
        <span className="ab-hero__eyebrow">About Destination Paradise</span>
        <h1 className="ab-hero__title">A vision, <em>finally</em> taking its first journey.</h1>
        <p className="ab-hero__lead">Destination Paradise was born from a dream — to connect people to the beauty, culture and spirit of Tanzania. After years of preparation, we are officially launching from Unguja, Zanzibar.</p>
        <div className="ab-hero__stats">
          <div><strong><em>Now</em></strong><span>Unguja</span></div>
          <div><strong><em>Now</em></strong><span>Mainland</span></div>
          <div><strong>Next</strong><span>Pemba</span></div>
          <div><strong>Next</strong><span>Mafia Island</span></div>
        </div>
      </div>
    </section>
  );
}
