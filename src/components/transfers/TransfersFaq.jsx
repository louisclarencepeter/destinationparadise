import { TRANSFERS_FAQS } from '../../data/transfersPageContent.js';

export default function TransfersFaq() {
  return (
    <section className="tr-faq">
      <header className="tr-faq__head">
        <span className="section-eyebrow">FAQs</span>
        <h2 className="section-title">Before you book.</h2>
      </header>
      <div className="tr-faq__list">
        {TRANSFERS_FAQS.map((faq) => (
          <details className="tr-faq__item" key={faq.q} {...(faq.open ? { open: true } : {})}>
            <summary>{faq.q}</summary>
            <div className="tr-faq__body">{faq.a}</div>
          </details>
        ))}
      </div>
    </section>
  );
}
