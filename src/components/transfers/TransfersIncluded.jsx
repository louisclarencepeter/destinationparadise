import { useTranslation } from 'react-i18next';

export default function TransfersIncluded() {
  const { t } = useTranslation('transfers');
  const included = t('included.items', { returnObjects: true });

  return (
    <section className="tr-included">
      <div className="tr-included__wrap">
        <div className="tr-included__copy">
          <span className="section-eyebrow reveal" style={{ '--reveal-index': 0 }}>{t('included.eyebrow')}</span>
          <h2 className="section-title reveal" style={{ '--reveal-index': 1 }}>{t('included.title')}</h2>
          <p className="section-lead reveal" style={{ '--reveal-index': 2 }}>{t('included.lead')}</p>
          <a className="btn btn--accent btn--lg reveal" style={{ '--reveal-index': 3 }} href="#transfer-types">
            {t('included.choose_route')}
          </a>
        </div>
        <ul className="tr-included__list">
          {Array.isArray(included) && included.map((item, i) => (
            <li className="reveal" key={item} style={{ '--reveal-index': i }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
