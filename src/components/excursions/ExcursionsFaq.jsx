import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export default function ExcursionsFaq() {
  const { t } = useTranslation('excursions');
  return (
    <section className="exc-faq">
      <div className="exc-faq__head">
        <span className="section-eyebrow reveal" style={{ '--reveal-index': 0 }}>{t('faq.eyebrow')}</span>
        <h2 className="section-title reveal" style={{ '--reveal-index': 1 }}>{t('faq.title')}</h2>
      </div>
      <div className="exc-faq__list">
        <details className="exc-faq__item reveal" style={{ '--reveal-index': 0 }} open>
          <summary>{t('faq.items.private.q')}</summary>
          <div className="exc-faq__body">{t('faq.items.private.a')}</div>
        </details>
        <details className="exc-faq__item reveal" style={{ '--reveal-index': 1 }}>
          <summary>{t('faq.items.rain.q')}</summary>
          <div className="exc-faq__body">{t('faq.items.rain.a')}</div>
        </details>
        <details className="exc-faq__item reveal" style={{ '--reveal-index': 2 }}>
          <summary>{t('faq.items.pickup.q')}</summary>
          <div className="exc-faq__body">{t('faq.items.pickup.a')}</div>
        </details>
        <details className="exc-faq__item reveal" style={{ '--reveal-index': 3 }}>
          <summary>{t('faq.items.ramadan.q')}</summary>
          <div className="exc-faq__body">{t('faq.items.ramadan.a')}</div>
        </details>
        <details className="exc-faq__item reveal" style={{ '--reveal-index': 4 }}>
          <summary>{t('faq.items.safari.q')}</summary>
          <div className="exc-faq__body">
            {t('faq.items.safari.a_prefix')}
            <Link to="/packages">{t('faq.items.safari.a_packages_link')}</Link>
            {t('faq.items.safari.a_middle')}
            <Link to="/trip-planner">{t('faq.items.safari.a_planner_link')}</Link>
            {t('faq.items.safari.a_suffix')}
          </div>
        </details>
        <details className="exc-faq__item reveal" style={{ '--reveal-index': 5 }}>
          <summary>{t('faq.items.tipping.q')}</summary>
          <div className="exc-faq__body">{t('faq.items.tipping.a')}</div>
        </details>
      </div>
    </section>
  );
}
