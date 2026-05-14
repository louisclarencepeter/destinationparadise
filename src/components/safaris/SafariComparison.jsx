import { Link } from 'react-router-dom';
import { SAFARI_COMPARISON } from '../../data/safarisPageContent.js';

export default function SafariComparison() {
  return (
    <section className="saf-compare reveal" id="choose">
      <header className="saf-compare__head">
        <span className="section-eyebrow">Not sure yet?</span>
        <h2 className="section-title">Choose by what you want most.</h2>
        <p className="section-lead">Most guests do not know the park names yet. Start with the outcome, then open the route that fits.</p>
      </header>
      <div className="saf-compare__grid">
        {SAFARI_COMPARISON.map((item) => (
          <Link className="saf-compare__card" key={item.label} to={`/safaris/${item.slug}`} aria-label={`Explore ${item.pick}`}>
            <span>{item.label}</span>
            <h3>{item.pick}</h3>
            <p>{item.note}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
