import { Link } from 'react-router-dom';
import { FAQS } from '../../data/safarisPageContent.js';

export default function SafariFaq() {
  return (
    <section className="saf-faq reveal" id="faq">
      <header className="saf-faq__head">
        <span className="section-eyebrow">FAQs</span>
        <h2 className="section-title">The questions everyone asks.</h2>
      </header>
      <div className="saf-faq__list">
        {FAQS.map((faq) => (
          <details className="saf-faq__item" key={faq.q} {...(faq.open ? { open: true } : {})}>
            <summary>{faq.q}</summary>
            <div className="saf-faq__body">
              {faq.extendLink ? (
                <>
                  Yes — and you should. We design every safari to flow into a beach stay. See our{' '}
                  <Link to="/packages">Bush &amp; Beach package</Link> for a 10-night example.
                </>
              ) : faq.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
