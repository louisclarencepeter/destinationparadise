import { useTranslation } from 'react-i18next';
import { arrayFromTranslation } from '../../utils/translationValues.js';

export default function SafariIncluded() {
  const { t } = useTranslation('safaris');
  const items = arrayFromTranslation(t('included.items', { returnObjects: true }));
  return (
    <section className="included">
      <div className="included__wrap">
        <div className="included__copy">
          <span className="section-eyebrow reveal" style={{ '--reveal-index': 0 }}>{t('included.eyebrow')}</span>
          <h2 className="section-title reveal" style={{ '--reveal-index': 1 }}>{t('included.title')}</h2>
          <p className="section-lead reveal" style={{ '--reveal-index': 2 }}>{t('included.lead')}</p>
        </div>
        <ul className="included__list">
          {items.map((item, i) => (
            <li className="reveal" style={{ '--reveal-index': i }} key={item}><span>✓</span> {item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
