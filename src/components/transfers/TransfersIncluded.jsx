import { useTranslation } from 'react-i18next';

export default function TransfersIncluded() {
  const { t } = useTranslation('transfers');
  const included = t('included.items', { returnObjects: true });

  return (
    <section className="tr-included">
      <div className="tr-included__wrap">
        <div className="tr-included__copy">
          <span className="section-eyebrow">{t('included.eyebrow')}</span>
          <h2 className="section-title">{t('included.title')}</h2>
          <p className="section-lead">{t('included.lead')}</p>
          <a className="btn btn--accent btn--lg" href="#transfer-types">
            {t('included.choose_route')}
          </a>
        </div>
        <ul className="tr-included__list">
          {Array.isArray(included) && included.map((item) => (
            <li key={item}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
