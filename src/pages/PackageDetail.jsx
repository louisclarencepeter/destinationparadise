import { useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ResponsiveImage from '../components/ResponsiveImage.jsx';
import { buildLocalizedPackages } from '../data/packagePresentation.js';
import '../styles/homepage.css';
import '../styles/excursions.css';
import '../styles/safaris.css';

export default function PackageDetail() {
  const { t, ready } = useTranslation('packages');
  const { id } = useParams();
  const packages = useMemo(() => buildLocalizedPackages(t), [t]);
  const pkg = packages.find((item) => item.id === id);

  useEffect(() => {
    document.title = pkg
      ? `${pkg.title} · Destination Paradise`
      : t('detail.not_found_page_title');
  }, [pkg, t]);

  if (!ready) return null;

  if (!pkg) {
    return (
      <main className="excursions-page">
        <section className="exc-day" style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>
            <span className="section-eyebrow">{t('detail.not_found_eyebrow')}</span>
            <h1 className="section-title">{t('detail.not_found_title')}</h1>
            <p className="section-lead">{t('detail.not_found_text')}</p>
            <Link className="btn btn--ghost-dark" to="/packages" style={{ marginTop: '1.5rem' }}>{t('detail.back_to_packages')}</Link>
          </div>
        </section>
      </main>
    );
  }

  const audience = pkg.targetAudience || pkg.idealFor || [];
  const upsells = pkg.upsells || [];
  const routeItems = pkg.route || pkg.destinations || [];
  const contextItems = [
    pkg.split && t('detail.context.trip_split', { value: pkg.split }),
    pkg.focus && t('detail.context.focus', { value: pkg.focus }),
    pkg.season && t('detail.context.season', { value: pkg.season }),
    pkg.benchmark,
  ].filter(Boolean);

  return (
    <main className="excursions-page exc-detail package-detail">
      <nav className="exc-detail__crumbs" aria-label={t('detail.breadcrumb_aria')}>
        <Link to="/">{t('detail.breadcrumb_home')}</Link>
        <span aria-hidden="true">→</span>
        <Link to="/packages">{t('detail.breadcrumb_packages')}</Link>
        <span aria-hidden="true">→</span>
        <span>{pkg.title}</span>
      </nav>

      <article id={pkg.id} className="exc-block exc-block--detail">
        <div className="exc-block__img">
          <ResponsiveImage src={pkg.image} alt="" />
          <span className="exc-block__cat">{pkg.category}</span>
        </div>
        <div className="exc-block__body">
          <span className="exc-block__eyebrow">{pkg.duration}</span>
          <h1 className="exc-block__title">{pkg.title}</h1>
          <p className="exc-block__desc">{pkg.description}</p>
          <dl className="exc-block__facts">
            <div><dt>{t('detail.facts.duration')}</dt><dd>{pkg.duration}<small>{t('detail.facts.flexible_pacing')}</small></dd></div>
            <div><dt>{t('detail.facts.category')}</dt><dd>{pkg.category}<small>{t('detail.facts.package_style')}</small></dd></div>
            <div><dt>{t('detail.facts.price')}</dt><dd>{pkg.priceLabel}<small>{pkg.priceSub}</small></dd></div>
            <div><dt>{t('detail.facts.quote')}</dt><dd>24h<small>{t('detail.facts.custom_proposal')}</small></dd></div>
          </dl>
          <div className="exc-block__cols">
            <div className="exc-block__col">
              <h4>{t('detail.included')}</h4>
              <ul>{pkg.includes.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div className="exc-block__col">
              <h4>{audience.length ? t('detail.ideal_for') : t('detail.route_notes')}</h4>
              <ul>{(audience.length ? audience : routeItems).map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>
          {(pkg.priceTiers || routeItems.length > 0 || contextItems.length > 0 || upsells.length > 0) && (
            <div className="exc-block__cols">
              {pkg.priceTiers && (
                <div className="exc-block__col">
                  <h4>{t('detail.starting_prices')}</h4>
                  <ul>{pkg.priceTiers.map((tier) => <li key={tier.label}>{tier.label}: ${tier.price.toLocaleString()}{tier.suffix || ''}</li>)}</ul>
                </div>
              )}
              {routeItems.length > 0 && audience.length > 0 && (
                <div className="exc-block__col">
                  <h4>{pkg.destinations ? t('detail.destination_options') : t('detail.route')}</h4>
                  <ul>{routeItems.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
              )}
              {contextItems.length > 0 && (
                <div className="exc-block__col">
                  <h4>{t('detail.planning_notes')}</h4>
                  <ul>{contextItems.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
              )}
              {upsells.length > 0 && (
                <div className="exc-block__col">
                  <h4>{t('detail.optional_upgrades')}</h4>
                  <ul>{upsells.map((item) => <li key={item}>{item}</li>)}</ul>
                </div>
              )}
            </div>
          )}
          <div className="exc-block__actions">
            <span className="exc-block__price">{pkg.priceLabel}<small>{pkg.priceSub}</small></span>
            <span className="exc-block__price-note">{t('detail.price_note')}</span>
            <Link className="btn" to={`/booking?type=package&item=${encodeURIComponent(pkg.slug)}`}>{t('detail.build_package')}</Link>
            <Link className="btn btn--ghost-dark" to="/packages">{t('detail.all_packages')}</Link>
          </div>
        </div>
      </article>

      <section className="exc-cta">
        <div className="exc-cta__bg"><ResponsiveImage src={pkg.image} alt="" /></div>
        <div className="exc-cta__inner">
          <h2>{t('detail.cta.title', { title: pkg.title })}</h2>
          <p>{t('detail.cta.text')}</p>
          <div className="exc-cta__btns">
            <Link className="btn btn--lg btn--accent" to={`/booking?type=package&item=${encodeURIComponent(pkg.slug)}`}>{t('cta.get_quote')}</Link>
            <Link className="btn btn--ghost-light btn--lg" to="/trip-planner">{t('cta.ai_planner')}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
