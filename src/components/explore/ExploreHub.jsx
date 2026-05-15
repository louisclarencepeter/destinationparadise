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
    <section className="explore-hub reveal" aria-live="polite">
      <div className="explore-hub__inner">
        <div className="explore-hub__copy">
          <span className="section-eyebrow">{hub.type}</span>
          <h2 className="section-title">{hub.title}</h2>
          <p className="section-lead">{hub.text}</p>
          <div className="explore-hub__tags">
            {hub.bestFor.map((item) => <span key={item}>{item}</span>)}
          </div>
          <Link className="btn btn--ghost-dark" to={plannerHref}>{t('hub.plan_around', { title: hub.title })}</Link>
        </div>
        <div className="explore-hub__matches">
          {matches.map(([label, items]) => (
            <div className="explore-hub__match" key={label}>
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
