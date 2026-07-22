import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { getInstantExperience, getRequestExperience } from '../../data/commerceCatalog.js';
import { useRevealOnScroll } from '../../hooks/useRevealOnScroll.js';
import { trackEvent } from '../../utils/analytics.js';
import BookingPanel from './BookingPanel.jsx';
import RequestPanel from './RequestPanel.jsx';
import { CheckIcon } from './StoreIcons.jsx';
import '../../styles/store.css';

// Excursion-page store section: the instant booking panel for pilot products,
// the request-to-book panel for requestable ones, nothing for the rest —
// mounting it is safe on every excursion. Parent gates on the store flag.
export default function StoreBookingSection({ excursionId }) {
  const { t, i18n, ready } = useTranslation('store');
  const sectionRef = useRef(null);
  const instant = getInstantExperience(excursionId);
  const requestable = instant ? null : getRequestExperience(excursionId);
  const experience = instant || requestable;

  useRevealOnScroll(
    sectionRef,
    '.reveal:not(.is-visible)',
    ready ? `${i18n.resolvedLanguage}-${excursionId}` : 'loading',
  );

  useEffect(() => {
    if (experience) trackEvent('view_item', { item_id: experience.id });
  }, [experience]);

  if (!experience || !ready) return null;

  const copy = instant ? 'section' : 'request_section';
  const points = instant
    ? ['point_instant', 'point_cart', 'point_codes']
    : ['point_no_charge', 'point_confirm', 'point_one_payment'];

  return (
    <section className="store-book" id="book" ref={sectionRef} aria-labelledby="store-book-title">
      <div className="store-book__inner">
        <div className="store-book__intro">
          <span className="section-eyebrow reveal" style={{ '--reveal-index': 0 }}>{t(`${copy}.eyebrow`)}</span>
          <h2 className="section-title reveal" id="store-book-title" style={{ '--reveal-index': 1 }}>
            {t(`${copy}.title`)}
          </h2>
          <p className="section-lead reveal" style={{ '--reveal-index': 2 }}>{t(`${copy}.lead`)}</p>
          <ul className="store-book__points">
            {points.map((key, index) => (
              <li className="reveal" style={{ '--reveal-index': 3 + index }} key={key}>
                <CheckIcon size={18} strokeWidth={1.8} />
                {t(`${copy}.${key}`)}
              </li>
            ))}
          </ul>
          <p className="store-book__pickup reveal" style={{ '--reveal-index': 6 }}>
            <strong>{t('section.pickup_label')}</strong> {experience.pickup || t('request_section.pickup_fallback')}
          </p>
        </div>
        <div className="store-book__panel reveal" style={{ '--reveal-index': 2 }}>
          {instant ? <BookingPanel experience={instant} /> : <RequestPanel experience={requestable} />}
        </div>
      </div>
    </section>
  );
}
