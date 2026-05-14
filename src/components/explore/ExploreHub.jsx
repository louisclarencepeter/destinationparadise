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
          <Link className="btn btn--ghost-dark" to={plannerHref}>Plan around {hub.title}</Link>
        </div>
        <div className="explore-hub__matches">
          {[
            ['Excursions', hub.excursions],
            ['Safaris', hub.safaris],
            ['Packages', hub.packages],
          ].map(([label, items]) => (
            <div className="explore-hub__match" key={label}>
              <h3>{label}</h3>
              {items && items.length > 0 ? (
                <ul>{items.map((item) => <li key={item.to}><Link to={item.to}>{item.label}</Link></li>)}</ul>
              ) : (
                <p>Not the main fit here.</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
