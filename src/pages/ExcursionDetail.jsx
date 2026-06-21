import { useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ResponsiveImage from '../components/ResponsiveImage.jsx';
import { EXCURSIONS } from '../data/excursionsData.js';
import usePageMeta, { clampDescription } from '../hooks/usePageMeta.js';
import { touristTripJsonLd } from '../utils/productJsonLd.js';
import { useCurrency } from '../context/useCurrency.js';
import { arrayFromTranslation } from '../utils/translationValues.js';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js';
import '../styles/homepage.css';
import '../styles/excursions.css';

function categoryToSlug(cat) {
  return cat.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

const PRACTICAL_COLUMNS = ['included', 'not_included', 'booking'];

function formatTierName(key) {
  return key.replace(/([A-Z])/g, ' $1').replace(/^./, (letter) => letter.toUpperCase());
}

export default function ExcursionDetail() {
  const { t, i18n, ready } = useTranslation('excursions');
  const { id } = useParams();
  const { format } = useCurrency();
  const pageRef = useRef(null);
  const excursion = EXCURSIONS.find((item) => item.id === id);

  // Key on the route id too: detail routes reuse one component instance across
  // :id changes, so without it the observer wouldn't re-scan the new product's
  // reveal elements and they'd stay hidden.
  useRevealOnScroll(pageRef, '.reveal:not(.is-visible)', ready ? `${i18n.resolvedLanguage}-${id}` : 'loading');

  usePageMeta(
    excursion
      ? {
          title: `${excursion.title} · Destination Paradise`,
          description: clampDescription(
            excursion.description ||
              excursion.intro ||
              `${excursion.title} — a guided Zanzibar excursion with hotel pickup, small groups, and local guides.`,
          ),
          jsonLd: touristTripJsonLd({
            name: excursion.title,
            description: excursion.description || excursion.intro,
            path: `/excursions/${excursion.id}`,
            image: excursion.imageNeeded ? undefined : excursion.image,
            price: typeof excursion.price === 'number' ? excursion.price : undefined,
          }),
        }
      : { title: t('detail.not_found_page_title'), noindex: true },
  );

  if (!ready) return null;

  if (!excursion) {
    return (
      <main className="excursions-page">
        <section className="exc-day" style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>
            <span className="section-eyebrow">{t('detail.not_found_eyebrow')}</span>
            <h1 className="section-title">{t('detail.not_found_title')}</h1>
            <p className="section-lead">{t('detail.not_found_text')}</p>
            <Link className="btn" to="/excursions" style={{ marginTop: '1.5rem' }}>{t('detail.back_to_excursions')}</Link>
          </div>
        </section>
      </main>
    );
  }

  const e = excursion;
  const pricingTiers = e.pricing ? Object.entries(e.pricing).map(([key, value]) => ({
    label: formatTierName(key),
    price: value.from,
    currency: value.currency || 'USD',
  })) : [];

  return (
    <main className="excursions-page exc-detail" ref={pageRef}>
      <nav className="exc-detail__crumbs reveal" aria-label={t('detail.breadcrumb_aria')}>
        <Link to="/">{t('detail.breadcrumb_home')}</Link>
        <span aria-hidden="true">→</span>
        <Link to="/excursions">{t('detail.breadcrumb_excursions')}</Link>
        <span aria-hidden="true">→</span>
        <span>{e.title}</span>
      </nav>

      <article id={e.id} data-cat={categoryToSlug(e.category)} className="exc-block exc-block--detail">
        <div className="exc-block__img reveal">
          <ResponsiveImage src={e.image} alt={e.imageNeeded ? '' : e.alt || e.title} />
          <span className="exc-block__cat" data-cat={categoryToSlug(e.category)}>{e.category}</span>
          {e.season && <span className="exc-block__season">{t('detail.season_prefix')} · {e.season}</span>}
        </div>
        <div className="exc-block__body">
          <span className="exc-block__eyebrow reveal" style={{ '--reveal-index': 0 }}>{e.eyebrow}</span>
          <h1 className="exc-block__title reveal" style={{ '--reveal-index': 1 }}>{e.title}</h1>
          <p className="exc-block__desc reveal" style={{ '--reveal-index': 2 }}>{e.intro || e.description}</p>
          {e.facts && (
            <dl className="exc-block__facts">
              {e.facts.map(([dt, dd, sub], i) => (
                <div className="reveal" style={{ '--reveal-index': i }} key={dt}><dt>{dt}</dt><dd>{dd}<small>{sub}</small></dd></div>
              ))}
            </dl>
          )}
          {e.cols && (
            <div className="exc-block__cols">
              {e.cols.map((col, i) => (
                <div className="exc-block__col reveal" style={{ '--reveal-index': i }} key={col.h}>
                  <h4>{col.h}</h4>
                  <ul>{col.items.map((it) => <li key={it}>{it}</li>)}</ul>
                </div>
              ))}
            </div>
          )}
          {e.highlights && !e.cols && (
            <div className="exc-block__cols">
              <div className="exc-block__col reveal" style={{ '--reveal-index': 0 }}>
                <h4>{t('detail.highlights')}</h4>
                <ul>{e.highlights.map((it) => <li key={it}>{it}</li>)}</ul>
              </div>
            </div>
          )}
          {pricingTiers.length > 0 && (
            <div className="exc-block__cols">
              <div className="exc-block__col reveal" style={{ '--reveal-index': 0 }}>
                <h4>{t('detail.experience_pricing')}</h4>
                <ul>{pricingTiers.map((tier) => <li key={tier.label}>{tier.label}: {t('detail.from')} {format(tier.price)}</li>)}</ul>
              </div>
            </div>
          )}
          <div className="exc-block__actions">
            {typeof e.price === 'number' ? (
              <span className="exc-block__price reveal" style={{ '--reveal-index': 0 }}>{format(e.price)}<small>{e.priceSub || t('detail.per_person')}</small></span>
            ) : (
              <span className="exc-block__price-note reveal" style={{ '--reveal-index': 0 }}>{t('detail.price_on_request')}</span>
            )}
            {e.priceNote && <span className="exc-block__price-note reveal" style={{ '--reveal-index': 1 }}>{e.priceNote}</span>}
            <Link className="btn reveal" style={{ '--reveal-index': 2 }} to={`/booking?type=excursion&item=${encodeURIComponent(e.id)}`}>{t('detail.book_this')}</Link>
            <Link className="btn btn--ghost-dark reveal" style={{ '--reveal-index': 3 }} to="/excursions">{t('detail.all_excursions')}</Link>
          </div>
        </div>
      </article>

      {e.timeline && e.timeline.length > 0 && (
        <section className="exc-day" id="day">
          <div className="exc-day__head">
            <span className="section-eyebrow reveal" style={{ '--reveal-index': 0 }}>{t('detail.timeline.eyebrow')}</span>
            <h2 className="section-title reveal" style={{ '--reveal-index': 1 }}>{t('detail.timeline.title')}</h2>
            <p className="section-lead reveal" style={{ '--reveal-index': 2 }}>{t('detail.timeline.lead')}</p>
          </div>
          <div className="exc-day__timeline">
            {e.timeline.map(([t, h, p], i) => (
              <div className="exc-day__row reveal" key={t} style={{ '--reveal-index': i }}>
                <div className="exc-day__time">{t}</div>
                <div className="exc-day__what"><strong>{h}</strong><p>{p}</p></div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="exc-prac">
        <div className="exc-prac__grid">
          {PRACTICAL_COLUMNS.map((key, i) => (
            <div className="exc-prac__col reveal" key={key} style={{ '--reveal-index': i }}>
              <h4>{t(`detail.practical.${key}.heading`)}</h4>
              <ul>
                {arrayFromTranslation(t(`detail.practical.${key}.items`, { returnObjects: true })).map((it) => (
                  <li key={it}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="exc-cta">
        <div className="exc-cta__bg"><ResponsiveImage className="dp-drift" src={e.imageNeeded ? '/assets/images/excursions/safari-blue-sandbank.webp' : e.image} alt="" /></div>
        <div className="exc-cta__inner">
          <h2 className="reveal" style={{ '--reveal-index': 0 }}>{t('detail.cta.title', { title: e.title })}</h2>
          <p className="reveal" style={{ '--reveal-index': 1 }}>{t('detail.cta.text')}</p>
          <div className="exc-cta__btns reveal" style={{ '--reveal-index': 2 }}>
            <Link className="btn btn--lg" to={`/booking?type=excursion&item=${encodeURIComponent(e.id)}`}>{t('cta.get_in_touch')}</Link>
            <Link className="btn btn--ghost-light btn--lg" to="/trip-planner">{t('cta.ai_planner')}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
