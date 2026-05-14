import { INCLUDED_LIST } from '../../data/safariPageData.js';

export default function SafariIncluded() {
  return (
    <section className="included reveal">
      <div className="included__wrap">
        <div className="included__copy">
          <span className="section-eyebrow">Co jest w cenie</span>
          <h2 className="section-title">Jedna cena. Bez niespodzianek na końcu.</h2>
          <p className="section-lead">Dawno nauczyliśmy się, że "od $X" i dwanaście dopłat później psuje całą radość. W naszych wycenach uwzględniamy poniższe elementy.</p>
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
