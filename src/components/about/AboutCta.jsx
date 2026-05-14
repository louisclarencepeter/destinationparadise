import { Link } from 'react-router-dom';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { ABOUT_CTA_IMAGE } from '../../data/aboutPageData.js';

export default function AboutCta() {
  return (
    <section className="ab-cta">
      <div className="ab-cta__bg"><ResponsiveImage src={ABOUT_CTA_IMAGE} alt="" loading="lazy" /></div>
      <div className="ab-cta__inner">
        <span className="ab-story__eyebrow ab-cta__eyebrow">Karibu</span>
        <h2>Witamy w <em>Destination Paradise</em>.</h2>
        <p>Wszystkim, którzy wspierali tę podróż od początku — dziękujemy. A wszystkim, którzy dołączają teraz: wizja jest duża, droga długa, i bardzo się cieszymy, że jesteś z nami na starcie.</p>
        <div className="ab-cta__btns">
          <Link className="btn btn--lg btn--accent" to="/booking">Zaplanuj podróż →</Link>
          <Link className="btn btn--ghost-light btn--lg" to="/excursions">Zobacz wycieczki</Link>
        </div>
      </div>
    </section>
  );
}
