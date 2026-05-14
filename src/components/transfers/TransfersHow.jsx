import { TRANSFERS_HOW_IT_WORKS } from '../../data/transfersPageContent.js';

export default function TransfersHow() {
  return (
    <section className="tr-how">
      <header className="tr-how__head">
        <span className="section-eyebrow">Jak to działa</span>
        <h2 className="section-title">Trzy kroki od lądowania do check-in.</h2>
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
