import { INCLUDED_LIST } from '../../data/safariPageData.js';

export default function SafariIncluded() {
  return (
    <section className="included reveal">
      <div className="included__wrap">
        <div className="included__copy">
          <span className="section-eyebrow">What’s included</span>
          <h2 className="section-title">One price. Nothing surprise-charged.</h2>
          <p className="section-lead">We learnt a long time ago that "from $X" with twelve add-ons makes guests miserable. Our quotes include everything below.</p>
        </div>
        <ul className="included__list">
          {INCLUDED_LIST.map((item) => (
            <li key={item}><span>✓</span> {item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
