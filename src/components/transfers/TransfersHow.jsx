import { useTranslation } from 'react-i18next';

export default function TransfersHow() {
  const { t } = useTranslation('transfers');
  const steps = t('how.items', { returnObjects: true });

  return (
    <section className="tr-how">
      <header className="tr-how__head">
        <span className="section-eyebrow reveal" style={{ '--reveal-index': 0 }}>{t('how.eyebrow')}</span>
        <h2 className="section-title reveal" style={{ '--reveal-index': 1 }}>{t('how.title')}</h2>
      </header>
      <div className="tr-how__steps">
        {Array.isArray(steps) && steps.map((item, i) => (
          <article className="tr-step reveal" key={item.step} style={{ '--reveal-index': i }}>
            <span className="tr-step__num">{item.step}</span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
