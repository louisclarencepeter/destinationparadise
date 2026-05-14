import { Link } from 'react-router-dom';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { safariImg } from '../../data/safarisPageContent.js';

export default function SafariHero({ safariCount, minSafariPrice }) {
  return (
    <section className="saf-hero">
      <div className="saf-hero__bg">
        <ResponsiveImage src={safariImg('male-lion-in-grass.webp')} alt="" />
      </div>
      <div className="saf-hero__inner">
        <span className="saf-hero__eyebrow">Tanzania kontynentalna · serce naszej pracy</span>
        <h1 className="saf-hero__title">Tam, gdzie dzikość <em>wciąż</em> jest prawdziwa.</h1>
        <p className="saf-hero__lead">
          Od falujących równin Serengeti po osobny świat krateru Ngorongoro, prowadzimy kameralne safari z rangerami, pilotami i właścicielami lodge, których znamy od lat. Bez wycieczek autobusowych. Bez półprawd. Po prostu dobrze zrobiony bush.
        </p>
        <div className="saf-hero__cta">
          <a className="btn btn--lg" href="#itineraries">Zobacz safari</a>
          <Link className="btn btn--ghost btn--lg" to="/trip-planner">Zaplanuj z AI →</Link>
        </div>
        <div className="saf-hero__stats">
          <div><strong>{safariCount}</strong><span>Safari</span></div>
          <div><strong>2.0M</strong><span>Gnu w migracji</span></div>
          <div><strong>${minSafariPrice.toLocaleString()}</strong><span>Od, za osobę</span></div>
          <div><strong>3</strong><span>Szlaki safari</span></div>
        </div>
      </div>
    </section>
  );
}
