import { useTranslation } from 'react-i18next';

export default function SafariIncluded() {
  const { t } = useTranslation('safaris');
  const items = t('included.items', { returnObjects: true });
  return (
    <section className="included reveal">
      <div className="included__wrap">
        <div className="included__copy">
          <span className="section-eyebrow">{t('included.eyebrow')}</span>
          <h2 className="section-title">{t('included.title')}</h2>
          <p className="section-lead">{t('included.lead')}</p>
        </div>
        <ul className="included__list">
          {items.map((item) => (
            <li key={item}><span>✓</span> {item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
