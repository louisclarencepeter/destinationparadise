import { useTranslation } from 'react-i18next';

export default function TransfersHow() {
  const { t } = useTranslation('transfers');
  const steps = t('how.items', { returnObjects: true });

  return (
    <section className="tr-how">
      <header className="tr-how__head">
        <span className="section-eyebrow">{t('how.eyebrow')}</span>
        <h2 className="section-title">{t('how.title')}</h2>
      </header>
      <div className="tr-how__steps">
        {Array.isArray(steps) && steps.map((item) => (
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
