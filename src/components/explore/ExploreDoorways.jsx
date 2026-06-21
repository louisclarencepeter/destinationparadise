import { useTranslation } from 'react-i18next';
import {
  MIN_EXPLORE_EXCURSION_PRICE,
  MIN_PACKAGE_PRICE,
  MIN_SAFARI_PRICE,
} from '../../data/explorePageContent.js';
import { useCurrency } from '../../context/useCurrency.js';
import { arrayFromTranslation } from '../../utils/translationValues.js';

export default function ExploreDoorways() {
  const { t } = useTranslation('explore');
  const { format } = useCurrency();
  const prices = [
    format(MIN_PACKAGE_PRICE),
    format(MIN_EXPLORE_EXCURSION_PRICE),
    format(MIN_SAFARI_PRICE),
  ];
  const items = arrayFromTranslation(t('doorways.items', { returnObjects: true }));

  return (
    <section className="saf-steps">
      <header className="saf-steps__head">
        <span className="section-eyebrow reveal" style={{ '--reveal-index': 0 }}>{t('doorways.eyebrow')}</span>
        <h2 className="section-title reveal" style={{ '--reveal-index': 1 }}>{t('doorways.title')}</h2>
      </header>
      <div className="saf-steps__grid">
        {items.map((item, index) => (
          <article className="saf-step reveal" style={{ '--reveal-index': index }} key={item.step}>
            <span>{item.step}</span>
            <h3>{item.title}</h3>
            <p>{t(`doorways.items.${index}.text`, { price: prices[index] })}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
