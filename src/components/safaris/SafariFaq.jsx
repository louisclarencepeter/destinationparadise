import { Link } from 'react-router-dom';
import { FAQS } from '../../data/safarisPageContent.js';

export default function SafariFaq() {
  return (
    <section className="saf-faq reveal" id="faq">
      <header className="saf-faq__head">
        <span className="section-eyebrow">FAQ</span>
        <h2 className="section-title">Pytania, które słyszymy najczęściej.</h2>
      </header>
      <div className="saf-faq__list">
        {FAQS.map((faq) => (
          <details className="saf-faq__item" key={faq.q} {...(faq.open ? { open: true } : {})}>
            <summary>{faq.q}</summary>
            <div className="saf-faq__body">
              {faq.extendLink ? (
                <>
                  Tak, i to bardzo dobry pomysł. Projektujemy safari tak, żeby naturalnie przechodziło w pobyt na plaży. Zobacz nasz{' '}
                  <Link to="/packages">pakiet Safari i plaża</Link> jako przykład 10 nocy.
                </>
              ) : faq.a}
            </div>
          </details>
        ))}
      </div>
    </section>
  );
}
