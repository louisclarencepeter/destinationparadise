import { useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ResponsiveImage from '../components/ResponsiveImage.jsx';
import { ALL_SAFARI_PRODUCTS, SAFARI_TYPES } from '../data/safariPageData.js';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js';
import usePageMeta, { clampDescription } from '../hooks/usePageMeta.js';
import { touristTripJsonLd } from '../utils/productJsonLd.js';
import { useCurrency } from '../context/useCurrency.js';
import '../styles/homepage.css';
import '../styles/excursions.css';
import '../styles/safaris.css';

export default function SafariTypeDetail() {
  const { t, i18n, ready } = useTranslation('safaris');
  const { typeId } = useParams();
  const { format } = useCurrency();
  const type = SAFARI_TYPES.find((item) => item.id === typeId);
  const pageRef = useRef(null);

  // Key on the route param too: the route reuses one component instance across
  // :typeId changes, so without it the observer wouldn't re-scan the new type's
  // reveal elements and they'd stay hidden.
  useRevealOnScroll(pageRef, '.reveal:not(.is-visible)', ready ? `${i18n.resolvedLanguage}-${typeId}` : 'loading');

  usePageMeta(
    type
      ? {
          title: `${type.title} · Destination Paradise`,
          description: clampDescription(
            type.blurb ||
              type.intro ||
              `${type.title} safaris across Tanzania — handpicked routes, expert guides, and tailored itineraries.`,
          ),
          jsonLd: touristTripJsonLd({
            name: type.title,
            description: type.blurb || type.intro || type.desc,
            path: `/safaris/types/${type.id}`,
            image: type.image,
          }),
        }
      : { title: t('type_detail.not_found_page_title'), noindex: true },
  );

  if (!ready) return null;

  if (!type) {
    return (
      <main className="safaris-page">
        <section className="exc-day" style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>
            <span className="section-eyebrow">{t('type_detail.not_found_eyebrow')}</span>
            <h1 className="section-title">{t('type_detail.not_found_title')}</h1>
            <p className="section-lead">{t('type_detail.not_found_text')}</p>
            <Link className="btn btn--ghost-dark" to="/safaris#safari-types" style={{ marginTop: '1.5rem' }}>{t('type_detail.back_to_styles')}</Link>
          </div>
        </section>
      </main>
    );
  }

  const routes = ALL_SAFARI_PRODUCTS.filter((route) => type.routeIds.includes(route.id));

  return (
    <main className="safaris-page exc-detail saf-type-detail" ref={pageRef}>
      <nav className="exc-detail__crumbs reveal" aria-label={t('type_detail.breadcrumb_aria')}>
        <Link to="/">{t('type_detail.breadcrumb_home')}</Link>
        <span aria-hidden="true">→</span>
        <Link to="/safaris">{t('type_detail.breadcrumb_safaris')}</Link>
        <span aria-hidden="true">→</span>
        <span>{type.title}</span>
      </nav>

      <article className="exc-block exc-block--detail">
        <div className="exc-block__img reveal">
          <ResponsiveImage src={type.image} alt={type.alt || type.title} />
          <span className="exc-block__cat">{t('type_detail.cat')}</span>
        </div>
        <div className="exc-block__body">
          <span className="exc-block__eyebrow reveal" style={{ '--reveal-index': 0 }}>{t('type_detail.best_for', { audience: type.bestFor })}</span>
          <h1 className="exc-block__title reveal" style={{ '--reveal-index': 1 }}>{type.title}</h1>
          <p className="exc-block__desc reveal" style={{ '--reveal-index': 2 }}>{type.desc}</p>
          <div className="exc-block__cols">
            <div className="exc-block__col reveal" style={{ '--reveal-index': 0 }}>
              <h4>{t('type_detail.why_choose')}</h4>
              <ul>{type.highlights.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div className="exc-block__col reveal" style={{ '--reveal-index': 1 }}>
              <h4>{t('type_detail.matching_routes')}</h4>
              <ul>{routes.map((route) => <li key={route.id}>{route.title}</li>)}</ul>
            </div>
          </div>
          <div className="exc-block__actions">
            <Link className="btn btn--ghost-dark reveal" style={{ '--reveal-index': 0 }} to={`/booking?type=custom&title=${encodeURIComponent(type.title)}`}>{t('cta.get_quote')}</Link>
            <Link className="btn btn--ghost-dark reveal" style={{ '--reveal-index': 1 }} to="/safaris">{t('type_detail.all_safaris')}</Link>
          </div>
        </div>
      </article>

      <section className="itineraries">
        <header className="itineraries__head">
          <span className="section-eyebrow reveal" style={{ '--reveal-index': 0 }}>{t('type_detail.routes.eyebrow')}</span>
          <h2 className="section-title reveal" style={{ '--reveal-index': 1 }}>{t('type_detail.routes.title')}</h2>
          <p className="section-lead reveal" style={{ '--reveal-index': 2 }}>{t('type_detail.routes.lead')}</p>
        </header>
        <div className="exc-grid saf-route-grid">
          {routes.map((route, i) => (
            <Link key={route.id} to={`/safaris/${route.id}`} className="exc-card saf-route-card reveal" style={{ '--reveal-index': i }} aria-label={t('itineraries.explore_aria', { title: route.title })}>
              <div className="exc-card__img">
                <img src={route.image} alt={route.alt || route.title} loading="lazy" />
                <span className="exc-card__cat">{route.category}</span>
                {route.feature && <span className="exc-card__season">{t('itineraries.most_popular')}</span>}
              </div>
              <div className="exc-card__body">
                <span className="exc-card__eyebrow">{route.rib}</span>
                <h3 className="exc-card__title">{route.title}</h3>
                <p className="exc-card__desc">{route.intro}</p>
                <div className="exc-card__meta">
                  <span>{route.duration}</span>
                  <span>{route.from}</span>
                </div>
                <div className="exc-card__foot">
                  <span className="exc-card__price">{t('itineraries.card.from')} <strong>{format(route.price)}</strong> {route.priceSub}</span>
                  <span className="exc-card__cta">{t('itineraries.card.explore_cta')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="saf-cta">
        <div className="saf-cta__bg">
          <ResponsiveImage src={type.image} alt="" className="dp-drift" />
        </div>
        <div className="saf-cta__inner">
          <h2 className="reveal" style={{ '--reveal-index': 0 }}>{t('type_detail.cta.title')}</h2>
          <p className="reveal" style={{ '--reveal-index': 1 }}>{t('type_detail.cta.text')}</p>
          <div className="saf-cta__btns reveal" style={{ '--reveal-index': 2 }}>
            <Link className="btn btn--lg btn--accent" to={`/booking?type=custom&title=${encodeURIComponent(type.title)}`}>{t('cta.get_quote')}</Link>
            <Link className="btn btn--ghost-light btn--lg" to="/trip-planner">{t('type_detail.cta.plan_ai')}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
