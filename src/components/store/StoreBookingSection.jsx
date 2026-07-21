import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getInstantExperience } from '../../data/commerceCatalog.js';
import { useRevealOnScroll } from '../../hooks/useRevealOnScroll.js';
import { trackEvent } from '../../utils/analytics.js';
import BookingPanel from './BookingPanel.jsx';
import { CheckIcon } from './StoreIcons.jsx';
import '../../styles/store.css';

// Excursion-page section for pilot experiences: intro copy + the instant
// booking panel. Renders nothing for products outside the instant allowlist,
// so mounting it is safe on every excursion. Parent gates on the store flag.
export default function StoreBookingSection({ excursionId }) {
  const { t, i18n, ready } = useTranslation('store');
  const sectionRef = useRef(null);
  const experience = getInstantExperience(excursionId);

  useRevealOnScroll(
    sectionRef,
    '.reveal:not(.is-visible)',
    ready ? `${i18n.resolvedLanguage}-${excursionId}` : 'loading',
  );

  useEffect(() => {
    if (experience) trackEvent('view_item', { item_id: experience.id });
  }, [experience]);

  if (!experience || !ready) return null;

  const points = ['point_instant', 'point_cart', 'point_codes'];

  return (
    <section className="store-book" id="book" ref={sectionRef} aria-labelledby="store-book-title">
      <div className="store-book__inner">
        <div className="store-book__intro">
          <span className="section-eyebrow reveal" style={{ '--reveal-index': 0 }}>{t('section.eyebrow')}</span>
          <h2 className="section-title reveal" id="store-book-title" style={{ '--reveal-index': 1 }}>
            {t('section.title')}
          </h2>
          <p className="section-lead reveal" style={{ '--reveal-index': 2 }}>{t('section.lead')}</p>
          <ul className="store-book__points">
            {points.map((key, index) => (
              <li className="reveal" style={{ '--reveal-index': 3 + index }} key={key}>
                <CheckIcon size={18} strokeWidth={1.8} />
                {t(`section.${key}`)}
              </li>
            ))}
          </ul>
          <p className="store-book__pickup reveal" style={{ '--reveal-index': 6 }}>
            <strong>{t('section.pickup_label')}</strong> {experience.pickup}
          </p>
        </div>
        <div className="store-book__panel reveal" style={{ '--reveal-index': 2 }}>
          <BookingPanel experience={experience} />
        </div>
      </div>
    </section>
  );
}
