import { useTranslation } from 'react-i18next';
import {
  MIN_EXPLORE_EXCURSION_PRICE,
  MIN_PACKAGE_PRICE,
  MIN_SAFARI_PRICE,
} from '../../data/explorePageContent.js';

export default function ExploreDoorways() {
  const { t } = useTranslation('explore');
  const prices = [
    MIN_PACKAGE_PRICE.toLocaleString(),
    MIN_EXPLORE_EXCURSION_PRICE.toLocaleString(),
    MIN_SAFARI_PRICE.toLocaleString(),
  ];
  const items = t('doorways.items', { returnObjects: true });

  return (
    <section className="saf-steps reveal">
      <header className="saf-steps__head">
        <span className="section-eyebrow">{t('doorways.eyebrow')}</span>
        <h2 className="section-title">{t('doorways.title')}</h2>
      </header>
      <div className="saf-steps__grid">
        {items.map((item, index) => (
          <article className="saf-step" key={item.step}>
            <span>{item.step}</span>
            <h3>{item.title}</h3>
            <p>{t(`doorways.items.${index}.text`, { price: prices[index] })}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
