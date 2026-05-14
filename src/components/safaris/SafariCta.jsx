import { Link } from 'react-router-dom';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { safariImg } from '../../data/safarisPageContent.js';

export default function SafariCta() {
  return (
    <section className="saf-cta">
      <div className="saf-cta__bg">
        <ResponsiveImage src={safariImg('lioness-and-cub-resting.webp')} alt="" />
      </div>
      <div className="saf-cta__inner">
        <h2>Gotowi zaplanować safari?</h2>
        <p>Napisz, kiedy możesz lecieć, kto jedzie i jaki klimat podróży masz w głowie. Wrócimy w 24 godziny z realnym planem i realną ceną.</p>
        <div className="saf-cta__btns">
          <Link className="btn btn--lg btn--accent" to="/booking">Poproś o wycenę →</Link>
          <Link className="btn btn--ghost-light btn--lg" to="/trip-planner">Porozmawiaj z planerem AI</Link>
        </div>
      </div>
    </section>
  );
}
