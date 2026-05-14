import { Link } from 'react-router-dom';
import { EXCURSION_COMBINATIONS } from '../../data/excursionCombinations.js';

export default function ExcursionsPairings() {
  return (
    <section className="exc-pair reveal">
      <div className="exc-pair__head">
        <span className="section-eyebrow">Locals&apos; picks</span>
        <h2 className="section-title">Combinations that work</h2>
        <p className="section-lead">Some excursions pair beautifully across one or two days. Here&apos;s how we&apos;d sequence them.</p>
      </div>
      <div className="exc-pair__grid">
        {EXCURSION_COMBINATIONS.map((p) => (
          <Link className="exc-pair__card" key={p.title} to={`/excursions/combinations/${p.id}`} aria-label={`Explore ${p.title}`}>
            <div className="exc-pair__combo">
              <span>{p.combo[0]}</span>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              <span>{p.combo[1]}</span>
            </div>
            <h3 className="exc-pair__title">{p.title}</h3>
            <p className="exc-pair__desc">{p.desc}</p>
            <div className="exc-pair__foot"><span>{p.length}</span><strong>{p.price || 'On request'}</strong></div>
          </Link>
        ))}
      </div>
    </section>
  );
}
