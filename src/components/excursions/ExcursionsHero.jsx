import { Link } from 'react-router-dom';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { CATEGORIES, EXCURSIONS } from '../../data/excursionsData.js';
import { EXCURSIONS_HERO_IMAGE, MIN_EXCURSION_PRICE } from '../../data/excursionsPageContent.js';

export default function ExcursionsHero() {
  return (
    <section className="exc-hero">
      <div className="exc-hero__bg">
        <ResponsiveImage src={EXCURSIONS_HERO_IMAGE} alt="" fetchpriority="high" loading="eager" decoding="sync" />
      </div>
      <div className="exc-hero__inner">
        <span className="exc-hero__eyebrow">Zanzibar i wybrzeże · wybrane wycieczki jednodniowe</span>
        <h1 className="exc-hero__title">Jedna wyspa. <em>{EXCURSIONS.length}+ niezapomnianych tras.</em></h1>
        <p className="exc-hero__lead">Zamień resortową rutynę na prawdziwy Zanzibar: popłyń tradycyjnym dhow, przejdź Stone Town z lokalnym przewodnikiem, zanurkuj przy rafach Mnemba, spróbuj kitesurfingu w Paje albo dołącz do festiwalu w Stone Town.</p>
        <div className="exc-hero__tags" aria-label="Najważniejsze cechy wycieczek">
          <span>Odbiór z hotelu w cenie</span>
          <span>Dostępne opcje prywatne</span>
          <span>Lokalni przewodnicy</span>
        </div>
        <div className="exc-hero__row">
          <a className="btn btn--lg" href="#list">Zobacz wycieczki</a>
          <Link className="btn btn--ghost btn--lg" to="/trip-planner">Zbuduj mój plan →</Link>
        </div>
        <div className="exc-hero__meta">
          <div><strong>{EXCURSIONS.length}</strong><span>Wycieczek</span></div>
          {MIN_EXCURSION_PRICE !== null && <div><strong>${MIN_EXCURSION_PRICE}</strong><span>Od, za osobę</span></div>}
          <div><strong>{CATEGORIES.length}</strong><span>Kategorii</span></div>
          <div><strong>Prywatne</strong><span>Opcje dostępne</span></div>
        </div>
      </div>
    </section>
  );
}
