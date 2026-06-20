import { useTranslation } from 'react-i18next';
import { PARKS } from '../../data/safariPageData.js';
import { arrayFromTranslation, textFromTranslation } from '../../utils/translationValues.js';

const PARK_KEYS = {
  'Serengeti National Park': 'serengeti',
  'Ngorongoro Crater': 'ngorongoro',
  'Tarangire National Park': 'tarangire',
  'Nyerere (Selous)': 'nyerere',
  'Lake Manyara': 'manyara',
};

export default function SafariParks() {
  const { t } = useTranslation('safaris');
  return (
    <section className="parks reveal" id="parks">
      <header className="parks__head">
        <span className="section-eyebrow">{t('parks.eyebrow')}</span>
        <h2 className="section-title">{t('parks.title')}</h2>
      </header>
      <div className="parks__grid">
        {PARKS.map((park) => {
          const key = PARK_KEYS[park.name];
          const name = key ? textFromTranslation(t(`parks.items.${key}.name`, { defaultValue: park.name }), park.name) : park.name;
          const blurb = key ? textFromTranslation(t(`parks.items.${key}.blurb`, { defaultValue: park.blurb }), park.blurb) : park.blurb;
          const tags = key ? arrayFromTranslation(t(`parks.items.${key}.tags`, { returnObjects: true, defaultValue: park.tags }), park.tags) : park.tags;
          return (
            <article className={`park-card${park.size === 'lg' ? ' park-card--lg' : ''}`} key={park.name}>
              <div className="park-card__img"><img src={park.image} alt="" loading="lazy" /></div>
              <div className="park-card__body">
                <div className="park-card__meta"><span>{park.label}</span><span>{park.area}</span></div>
                <h3>{name}</h3>
                <p>{blurb}</p>
                <ul className="park-card__tags">
                  {tags.map((tag) => <li key={tag}>{tag}</li>)}
                </ul>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
