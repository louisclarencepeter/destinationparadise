import { Link } from 'react-router-dom';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { EXPLORE_CTA_IMAGE } from '../../data/explorePageContent.js';

export default function ExploreCta() {
  return (
    <section className="exc-cta">
      <div className="exc-cta__bg"><ResponsiveImage src={EXPLORE_CTA_IMAGE} alt="" /></div>
      <div className="exc-cta__inner">
        <h2>Chcesz, żebyśmy ułożyli właściwą trasę?</h2>
        <p>Podaj miejsca, które Cię kuszą, daty i tempo podróży. Połączymy najlepsze pakiety, wycieczki i safari w jeden klarowny plan.</p>
        <div className="exc-cta__btns">
          <Link className="btn btn--lg btn--accent" to="/booking">Poproś o wycenę →</Link>
          <Link className="btn btn--ghost-light btn--lg" to="/trip-planner">Zaplanuj z AI</Link>
        </div>
      </div>
    </section>
  );
}
