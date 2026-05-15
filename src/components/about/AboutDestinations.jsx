import { useTranslation } from 'react-i18next';
import { aboutDestinations } from '../../data/aboutPageData.js';

export default function AboutDestinations() {
  const { t } = useTranslation('about');
  const destinations = t('destinations.items', { returnObjects: true, defaultValue: aboutDestinations });

  return (
    <section className="ab-press reveal" id="destinations">
      <div className="ab-press__head">
        <div>
          <span className="ab-story__eyebrow">{t('destinations.eyebrow', { defaultValue: 'Where we go' })}</span>
          <h2>{t('destinations.title_prefix', { defaultValue: 'From Unguja,' })} <em>{t('destinations.title_em', { defaultValue: 'outward' })}</em>{t('destinations.title_suffix', { defaultValue: '.' })}</h2>
        </div>
        <p>{t('destinations.lead', { defaultValue: 'We begin in Unguja, Zanzibar — the place this journey started — and across mainland Tanzania, where the wider story unfolds. Pemba and Mafia Island will follow, each in the time it deserves.' })}</p>
      </div>

      <div className="ab-dest__grid">
        {Array.isArray(destinations) && destinations.map((destination, index) => (
          <article className="ab-dest reveal" key={`destination-${index}`} style={{ transitionDelay: `${index * 90}ms` }}>
            <span className="ab-dest__tag">{destination.tag}</span>
            <h3 className="ab-dest__name">{destination.name}</h3>
            <p className="ab-dest__body">{destination.body}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
