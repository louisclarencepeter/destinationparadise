import { useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ResponsiveImage from '../components/ResponsiveImage.jsx';
import { ALL_SAFARI_PRODUCTS, INCLUDED_LIST } from '../data/safariPageData.js';
import usePageMeta, { clampDescription } from '../hooks/usePageMeta.js';
import { touristTripJsonLd } from '../utils/productJsonLd.js';
import { useCurrency } from '../context/useCurrency.js';
import { arrayFromTranslation } from '../utils/translationValues.js';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js';
import '../styles/homepage.css';
import '../styles/excursions.css';
import '../styles/safaris.css';

const PRACTICAL_COLUMNS = ['included', 'not_included', 'booking'];

function cleanInclude(item = '') {
  return item.replace(/^✓\s*/, '').trim();
}

export default function SafariDetail() {
  const { t, i18n, ready } = useTranslation('safaris');
  const { id } = useParams();
  const { format } = useCurrency();
  const safari = ALL_SAFARI_PRODUCTS.find((item) => item.id === id);
  const pageRef = useRef(null);

  // Key on the route id too: detail routes reuse one component instance across
  // :id changes, so without it the observer wouldn't re-scan the new product's
  // reveal elements and they'd stay hidden.
  useRevealOnScroll(pageRef, '.reveal:not(.is-visible)', ready ? `${i18n.resolvedLanguage}-${id}` : 'loading');

  usePageMeta(
    safari
      ? {
          title: `${safari.title} · Destination Paradise`,
          description: clampDescription(
            safari.blurb ||
              safari.intro ||
              `${safari.title} — a guided Tanzania safari with park fees, professional guide, and full-board lodging.`,
          ),
          jsonLd: touristTripJsonLd({
            name: safari.title,
            description: safari.blurb || safari.intro,
            path: `/safaris/${safari.id}`,
            image: safari.image,
            price: safari.publicPrice?.lowSeason ?? (typeof safari.price === 'number' ? safari.price : undefined),
          }),
        }
      : { title: t('detail.not_found_page_title'), noindex: true },
  );

  if (!ready) return null;

  if (!safari) {
    return (
      <main className="safaris-page">
        <section className="exc-day" style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>
            <span className="section-eyebrow">{t('detail.not_found_eyebrow')}</span>
            <h1 className="section-title">{t('detail.not_found_title')}</h1>
            <p className="section-lead">{t('detail.not_found_text')}</p>
            <Link className="btn btn--ghost-dark" to="/safaris" style={{ marginTop: '1.5rem' }}>{t('detail.back_to_safaris')}</Link>
          </div>
        </section>
      </main>
    );
  }

  const included = safari.includesList || safari.highlights || safari.includes.split('·').map(cleanInclude);
  const price = safari.publicPrice;
  const upsells = safari.upsells || [];

  return (
    <main className="safaris-page exc-detail saf-detail" ref={pageRef}>
      <nav className="exc-detail__crumbs reveal" aria-label={t('detail.breadcrumb_aria')}>
        <Link to="/">{t('detail.breadcrumb_home')}</Link>
        <span aria-hidden="true">→</span>
        <Link to="/safaris">{t('detail.breadcrumb_safaris')}</Link>
        <span aria-hidden="true">→</span>
        <span>{safari.title}</span>
      </nav>

      <article id={safari.id} className="exc-block exc-block--detail">
        <div className="exc-block__img reveal">
          <ResponsiveImage src={safari.image} alt={safari.alt || safari.title} />
          <span className="exc-block__cat">{safari.category}</span>
          {safari.feature && <span className="exc-block__season">{t('detail.most_popular')}</span>}
        </div>
        <div className="exc-block__body">
          <span className="exc-block__eyebrow reveal" style={{ '--reveal-index': 0 }}>{safari.rib}</span>
          <h1 className="exc-block__title reveal" style={{ '--reveal-index': 1 }}>{safari.title}</h1>
          <p className="exc-block__desc reveal" style={{ '--reveal-index': 2 }}>{safari.intro}</p>
          <dl className="exc-block__facts">
            <div className="reveal" style={{ '--reveal-index': 0 }}><dt>{t('detail.facts.duration')}</dt><dd>{safari.duration}<small>{t('detail.facts.duration_sub')}</small></dd></div>
            <div className="reveal" style={{ '--reveal-index': 1 }}><dt>{t('detail.facts.starts_from')}</dt><dd>{safari.from}<small>{t('detail.facts.starts_from_sub')}</small></dd></div>
            <div className="reveal" style={{ '--reveal-index': 2 }}><dt>{t('detail.facts.style')}</dt><dd>{safari.positioning || safari.category}<small>{t('detail.facts.style_sub')}</small></dd></div>
            <div className="reveal" style={{ '--reveal-index': 3 }}>
              <dt>{t('detail.facts.price')}</dt>
              <dd>
                {format(price ? price.lowSeason : safari.price)}
                {price && `–${format(price.peakSeason)}`}
                <small>{price?.unit || safari.priceSub}</small>
              </dd>
            </div>
          </dl>
          <div className="exc-block__cols">
            <div className="exc-block__col reveal" style={{ '--reveal-index': 0 }}>
              <h4>{safari.productType ? t('detail.highlights') : t('detail.included_in_route')}</h4>
              <ul>{included.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div className="exc-block__col reveal" style={{ '--reveal-index': 1 }}>
              <h4>{safari.idealFor?.length ? t('detail.ideal_for') : t('detail.typical_inclusions')}</h4>
              <ul>{(safari.idealFor?.length ? safari.idealFor : INCLUDED_LIST.slice(0, 4)).map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>
          {upsells.length > 0 && (
            <div className="exc-block__cols">
              <div className="exc-block__col reveal" style={{ '--reveal-index': 0 }}>
                <h4>{t('detail.optional_upgrades')}</h4>
                <ul>{upsells.map((item) => <li key={item.name}>{item.name} · +{format(item.price)}</li>)}</ul>
              </div>
            </div>
          )}
          <div className="exc-block__actions">
            <span className="exc-block__price reveal" style={{ '--reveal-index': 0 }}>
              {format(price ? price.lowSeason : safari.price)}
              <small>{price ? t('detail.price_low_peak', { price: format(price.peakSeason) }) : safari.priceSub}</small>
            </span>
            <span className="exc-block__price-note reveal" style={{ '--reveal-index': 1 }}>{t('detail.price_note')}</span>
            <Link className="btn reveal" style={{ '--reveal-index': 2 }} to={`/booking?type=safari&item=${encodeURIComponent(safari.id)}`}>{t('detail.book_route')}</Link>
            <Link className="btn btn--ghost-dark reveal" style={{ '--reveal-index': 3 }} to="/safaris">{t('detail.all_safaris')}</Link>
          </div>
        </div>
      </article>

      {safari.days?.length > 0 && (
        <section className="exc-day" id="route">
          <div className="exc-day__head">
            <span className="section-eyebrow reveal" style={{ '--reveal-index': 0 }}>{t('detail.route.eyebrow')}</span>
            <h2 className="section-title reveal" style={{ '--reveal-index': 1 }}>{t('detail.route.title')}</h2>
            <p className="section-lead reveal" style={{ '--reveal-index': 2 }}>{t('detail.route.lead')}</p>
          </div>
          <div className="exc-day__timeline">
            {safari.days.map((day, i) => (
              <div className="exc-day__row reveal" key={day.d} style={{ '--reveal-index': i }}>
                <div className="exc-day__time">{day.d}</div>
                <div className="exc-day__what"><strong>{day.h}</strong><p>{day.p}</p></div>
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
                {arrayFromTranslation(t(`detail.practical.${key}.items`, { returnObjects: true })).map((item) => (
                  <li key={item}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="saf-cta">
        <div className="saf-cta__bg">
          <ResponsiveImage className="dp-drift" src={safari.image} alt="" />
        </div>
        <div className="saf-cta__inner">
          <h2 className="reveal" style={{ '--reveal-index': 0 }}>{t('detail.cta.title', { title: safari.title })}</h2>
          <p className="reveal" style={{ '--reveal-index': 1 }}>{t('detail.cta.text')}</p>
          <div className="saf-cta__btns reveal" style={{ '--reveal-index': 2 }}>
            <Link className="btn btn--lg btn--accent" to={`/booking?type=safari&item=${encodeURIComponent(safari.id)}`}>{t('cta.get_quote')}</Link>
            <Link className="btn btn--ghost-light btn--lg" to="/trip-planner">{t('cta.ai_planner')}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
