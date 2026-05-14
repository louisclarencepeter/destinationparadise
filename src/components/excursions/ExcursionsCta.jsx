import { Link } from 'react-router-dom';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { EXCURSIONS_CTA_IMAGE } from '../../data/excursionsPageContent.js';

export default function ExcursionsCta() {
  return (
    <section className="exc-cta">
      <div className="exc-cta__bg"><ResponsiveImage src={EXCURSIONS_CTA_IMAGE} alt="" /></div>
      <div className="exc-cta__inner">
        <h2>Chcesz zarezerwować termin?</h2>
        <p>Napisz, kiedy jesteś na miejscu i które wycieczki Cię interesują. Wrócimy w 24 godziny z dostępnymi datami, godziną odbioru i finalną ceną.</p>
        <div className="exc-cta__btns">
          <Link className="btn btn--lg btn--accent" to="/booking">Napisz do nas →</Link>
          <Link className="btn btn--ghost-light btn--lg" to="/trip-planner">Porozmawiaj z planerem AI</Link>
        </div>
      </div>
    </section>
  );
}
