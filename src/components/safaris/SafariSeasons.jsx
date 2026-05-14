import { SEASONS } from '../../data/safarisPageContent.js';

export default function SafariSeasons() {
  return (
    <section className="when reveal" id="when">
      <header className="when__head">
        <span className="section-eyebrow">Kiedy jechać</span>
        <h2 className="section-title">Nie ma jednego idealnego terminu. Są różne rytmy safari.</h2>
      </header>
      <div className="when__grid">
        {SEASONS.map((season) => (
          <article className={`when-card when-card--${season.mod}`} key={season.title}>
            <div className="when-card__months">{season.months}</div>
            <h4>{season.title}</h4>
            <p>{season.blurb}</p>
            <span className="when-card__rating">{season.rating}</span>
          </article>
        ))}
      </div>
    </section>
  );
}
