import { PARKS } from '../../data/safariPageData.js';

export default function SafariParks() {
  return (
    <section className="parks reveal" id="parks">
      <header className="parks__head">
        <span className="section-eyebrow">Północny szlak i dalej</span>
        <h2 className="section-title">Pięć parków. Każdy jest osobnym światem.</h2>
      </header>
      <div className="parks__grid">
        {PARKS.map((park) => (
          <article className={`park-card${park.size === 'lg' ? ' park-card--lg' : ''}`} key={park.name}>
            <div className="park-card__img"><img src={park.image} alt="" loading="lazy" /></div>
            <div className="park-card__body">
              <div className="park-card__meta"><span>{park.label}</span><span>{park.area}</span></div>
              <h3>{park.name}</h3>
              <p>{park.blurb}</p>
              <ul className="park-card__tags">
                {park.tags.map((tag) => <li key={tag}>{tag}</li>)}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
