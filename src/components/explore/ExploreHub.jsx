import { Link } from 'react-router-dom';

export default function ExploreHub({ hub, plannerHref }) {
  return (
    <section className="explore-hub reveal" aria-live="polite">
      <div className="explore-hub__inner">
        <div className="explore-hub__copy">
          <span className="section-eyebrow">{hub.type}</span>
          <h2 className="section-title">{hub.title}</h2>
          <p className="section-lead">{hub.text}</p>
          <div className="explore-hub__tags">
            {hub.bestFor.map((item) => <span key={item}>{item}</span>)}
          </div>
          <Link className="btn btn--ghost-dark" to={plannerHref}>Zaplanuj wokół {hub.title}</Link>
        </div>
        <div className="explore-hub__matches">
          {[
            ['Wycieczki', hub.excursions],
            ['Safari', hub.safaris],
            ['Pakiety', hub.packages],
          ].map(([label, items]) => (
            <div className="explore-hub__match" key={label}>
              <h3>{label}</h3>
              {items && items.length > 0 ? (
                <ul>{items.map((item) => <li key={item.to}><Link to={item.to}>{item.label}</Link></li>)}</ul>
              ) : (
                <p>To nie jest tutaj główny wybór.</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
