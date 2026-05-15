import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const FAQ_ITEMS = [
  { key: 'days', open: true },
  { key: 'kids' },
  { key: 'malaria' },
  { key: 'big_five' },
  { key: 'camera' },
  { key: 'extend', extendLink: true },
];

export default function SafariFaq() {
  const { t } = useTranslation('safaris');
  return (
    <section className="saf-faq reveal" id="faq">
      <header className="saf-faq__head">
        <span className="section-eyebrow">{t('faq.eyebrow')}</span>
        <h2 className="section-title">{t('faq.title')}</h2>
      </header>
      <div className="saf-faq__list">
        {FAQ_ITEMS.map((faq) => (
          <details className="saf-faq__item" key={faq.key} {...(faq.open ? { open: true } : {})}>
            <summary>{t(`faq.items.${faq.key}.q`)}</summary>
            <div className="saf-faq__body">
              {faq.extendLink ? (
                <>
                  {t(`faq.items.${faq.key}.a_prefix`)}
                  <Link to="/packages">{t(`faq.items.${faq.key}.a_link`)}</Link>
                  {t(`faq.items.${faq.key}.a_suffix`)}
                </>
              ) : (
                t(`faq.items.${faq.key}.a`)
              )}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
