import { TRANSFERS_HOW_IT_WORKS } from '../../data/transfersPageContent.js';

export default function TransfersHow() {
  return (
    <section className="tr-how">
      <header className="tr-how__head">
        <span className="section-eyebrow">How it works</span>
        <h2 className="section-title">Three steps from landing to check-in.</h2>
      </header>
      <div className="tr-how__steps">
        {TRANSFERS_HOW_IT_WORKS.map((item) => (
          <article className="tr-step" key={item.step}>
            <span className="tr-step__num">{item.step}</span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
