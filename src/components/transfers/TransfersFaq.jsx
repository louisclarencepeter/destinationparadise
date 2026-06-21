import { useTranslation } from 'react-i18next';

export default function TransfersFaq() {
  const { t } = useTranslation('transfers');
  const faqs = t('faq.items', { returnObjects: true });

  return (
    <section className="tr-faq">
      <header className="tr-faq__head">
        <span className="section-eyebrow reveal" style={{ '--reveal-index': 0 }}>{t('faq.eyebrow')}</span>
        <h2 className="section-title reveal" style={{ '--reveal-index': 1 }}>{t('faq.title')}</h2>
      </header>
      <div className="tr-faq__list">
        {Array.isArray(faqs) && faqs.map((faq, i) => (
          <details className="tr-faq__item reveal" key={faq.q} style={{ '--reveal-index': i }} {...(faq.open ? { open: true } : {})}>
            <summary>{faq.q}</summary>
            <div className="tr-faq__body">{faq.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
