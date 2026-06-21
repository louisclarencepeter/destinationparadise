import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ExploreHub({ hub, plannerHref }) {
  const { t } = useTranslation('explore');
  const matches = [
    [t('hub.matches.excursions'), hub.excursions],
    [t('hub.matches.safaris'), hub.safaris],
    [t('hub.matches.packages'), hub.packages],
  ];

  return (
    <section className="explore-hub" aria-live="polite">
      <div className="explore-hub__inner">
        <div className="explore-hub__copy">
          <span className="section-eyebrow reveal" style={{ '--reveal-index': 0 }}>{hub.type}</span>
          <h2 className="section-title reveal" style={{ '--reveal-index': 1 }}>{hub.title}</h2>
          <p className="section-lead reveal" style={{ '--reveal-index': 2 }}>{hub.text}</p>
          <div className="explore-hub__tags reveal" style={{ '--reveal-index': 3 }}>
            {hub.bestFor.map((item) => <span key={item}>{item}</span>)}
          </div>
          <Link className="btn btn--ghost-dark reveal" style={{ '--reveal-index': 4 }} to={plannerHref}>{t('hub.plan_around', { title: hub.title })}</Link>
        </div>
        <div className="explore-hub__matches">
          {matches.map(([label, items], index) => (
            <div className="explore-hub__match reveal" style={{ '--reveal-index': index }} key={label}>
              <h3>{label}</h3>
              {items && items.length > 0 ? (
                <ul>{items.map((item) => <li key={item.to}><Link to={item.to}>{item.label}</Link></li>)}</ul>
              ) : (
                <p>{t('hub.no_fit')}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
