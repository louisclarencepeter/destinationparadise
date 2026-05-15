import { useTranslation } from 'react-i18next';

export default function TransfersFaq() {
  const { t } = useTranslation('transfers');
  const faqs = t('faq.items', { returnObjects: true });

  return (
    <section className="tr-faq">
      <header className="tr-faq__head">
        <span className="section-eyebrow">{t('faq.eyebrow')}</span>
        <h2 className="section-title">{t('faq.title')}</h2>
      </header>
      <div className="tr-faq__list">
        {Array.isArray(faqs) && faqs.map((faq) => (
          <details className="tr-faq__item" key={faq.q} {...(faq.open ? { open: true } : {})}>
            <summary>{faq.q}</summary>
            <div className="tr-faq__body">{faq.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
