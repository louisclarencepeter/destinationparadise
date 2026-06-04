import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { buildLocalizedPackages, categoryText } from '../data/packagePresentation.js';
import { useCurrency } from '../context/useCurrency.js';
import ResponsiveImage from '../components/ResponsiveImage.jsx';
import '../styles/homepage.css';
import '../styles/excursions.css';
import '../styles/safaris.css';

const FILTERS = [
  { key: 'all', match: () => true },
  { key: 'safari', match: (pkg) => /safari packages|serengeti|migration|tanzania parks|classic safari/i.test(categoryText(pkg)) },
  { key: 'honeymoon', match: (pkg) => /honeymoon|couples/i.test(categoryText(pkg)) },
  { key: 'fly-in', match: (pkg) => /fly-in|return flight|domestic flight/i.test(categoryText(pkg)) },
  { key: 'luxury', match: (pkg) => /luxury|premium|vip|migration/i.test(categoryText(pkg)) },
  { key: 'family', match: (pkg) => /family|children/i.test(categoryText(pkg)) },
  { key: 'kilimanjaro', match: (pkg) => /kilimanjaro|machame|mountain/i.test(categoryText(pkg)) },
  { key: 'culture', match: (pkg) => /culture|stone town|spice|swahili/i.test(categoryText(pkg)) },
  { key: 'marine', match: (pkg) => /marine|diving|snorkeling|mnemba|dolphin/i.test(categoryText(pkg)) },
  { key: 'tailor', match: (pkg) => /tailor|nomad|long-term|remote workers/i.test(categoryText(pkg)) },
];

const INITIAL_PACKAGE_COUNT = 6;
const PACKAGE_BATCH_COUNT = 6;

export default function Packages() {
  const { t, ready } = useTranslation('packages');
  const { format } = useCurrency();
  const priceText = (pricing) => (pricing.to ? `${format(pricing.from)} – ${format(pricing.to)}` : format(pricing.from));
  const pageRef = useRef(null);
  const [filter, setFilter] = useState('all');
  const [visibleCount, setVisibleCount] = useState(INITIAL_PACKAGE_COUNT);
  const packages = useMemo(() => buildLocalizedPackages(t), [t]);
  const packageFilters = useMemo(() => FILTERS.map((filterItem) => ({
    ...filterItem,
    label: t(`filters.${filterItem.key}`),
    count: packages.filter(filterItem.match).length,
  })), [packages, t]);
  const minPackagePrice = useMemo(() => Math.min(...packages.map((pkg) => pkg.price)), [packages]);
  const packageMatches = t('matches.items', { returnObjects: true });
  const marketCategories = t('market.items', { returnObjects: true });
  const packageIncluded = t('included.items', { returnObjects: true });
  const packageSteps = t('steps.items', { returnObjects: true });
  const activeFilter = packageFilters.find((item) => item.key === filter) || packageFilters[0];
  const filteredPackages = useMemo(() => packages.filter(activeFilter.match), [packages, activeFilter]);
  const visible = useMemo(
    () => filteredPackages.slice(0, visibleCount),
    [filteredPackages, visibleCount],
  );
  const hasHiddenPackages = visibleCount < filteredPackages.length;

  useEffect(() => {
    setVisibleCount(INITIAL_PACKAGE_COUNT);
  }, [filter]);

  useEffect(() => {
    document.title = t('page_title');
  }, [t]);

  useEffect(() => {
    const root = pageRef.current;
    if (!root) return undefined;
    const items = root.querySelectorAll('.reveal:not(.is-visible)');
    if (!('IntersectionObserver' in window)) {
      items.forEach((item) => item.classList.add('is-visible'));
      return undefined;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [visible]);

  if (!ready) return null;

  return (
    <main className="excursions-page packages-page" ref={pageRef}>
      <section className="exc-hero pkg-hero">
        <div className="exc-hero__bg"><ResponsiveImage src="/assets/images/safaris/eland-grazing.webp" alt="" fetchpriority="high" loading="eager" decoding="sync" /></div>
        <div className="exc-hero__inner">
          <span className="exc-hero__eyebrow">{t('hero.eyebrow')}</span>
          <h1 className="exc-hero__title">{t('hero.title_prefix')} <em>{t('hero.title_em')}</em></h1>
          <p className="exc-hero__lead">{t('hero.lead')}</p>
          <div className="exc-hero__row">
            <a className="btn btn--lg" href="#packages">{t('hero.browse')}</a>
            <Link className="btn btn--ghost btn--lg" to="/trip-planner">{t('hero.build_plan')}</Link>
          </div>
          <div className="exc-hero__meta">
            <div><strong>{packages.length}</strong><span>{t('hero.stat_packages')}</span></div>
            <div><strong>{format(minPackagePrice)}</strong><span>{t('hero.stat_from')}</span></div>
            <div><strong>10</strong><span>{t('hero.stat_styles')}</span></div>
            <div><strong>24h</strong><span>{t('hero.stat_quote_time')}</span></div>
          </div>
        </div>
      </section>

      <section className="exc-grid-wrap" id="packages">
        <header className="exc-list__head">
          <span className="section-eyebrow">{t('grid.eyebrow')}</span>
          <h2 className="section-title">{t('grid.title')}</h2>
          <p className="section-lead">{t('grid.lead')}</p>
        </header>

        <div className="exc-filter">
          <span className="exc-filter__label">{t('grid.filter_label')}</span>
          {packageFilters.map((item) => (
            <button
              key={item.key}
              type="button"
              className={`exc-filter__btn${filter === item.key ? ' is-active' : ''}`}
              onClick={() => setFilter(item.key)}
              aria-pressed={filter === item.key}
            >
              {item.label} <span className="exc-filter__count">{item.count}</span>
            </button>
          ))}
        </div>

        <div className="exc-grid">
          {visible.map((pkg) => (
            <Link key={pkg.id} to={`/packages/${pkg.id}`} className="exc-card reveal" aria-label={t('grid.explore_aria', { title: pkg.title })}>
              <div className="exc-card__img">
                <img src={pkg.image} alt="" loading="lazy" />
                <span className="exc-card__cat">{pkg.category}</span>
              </div>
              <div className="exc-card__body">
                <span className="exc-card__eyebrow">{pkg.duration}</span>
                <h3 className="exc-card__title">{pkg.title}</h3>
                <p className="exc-card__desc">{pkg.description}</p>
                <div className="exc-card__meta">
                  <span>{pkg.duration}</span>
                  <span>{pkg.category}</span>
                </div>
                <div className="exc-card__foot">
                  <span className="exc-card__price">{t('grid.from')} <strong>{priceText(pkg.pricing)}</strong> {pkg.priceSub}</span>
                  <span className="exc-card__cta">{t('grid.explore_cta')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        {filteredPackages.length > INITIAL_PACKAGE_COUNT && (
          <div className="exc-grid__actions">
            {hasHiddenPackages ? (
              <button
                type="button"
                className="btn btn--ghost btn--lg"
                onClick={() => setVisibleCount((count) => Math.min(count + PACKAGE_BATCH_COUNT, filteredPackages.length))}
              >
                {t('grid.show_more')}
              </button>
            ) : (
              <button
                type="button"
                className="btn btn--ghost btn--lg"
                onClick={() => {
                  setVisibleCount(INITIAL_PACKAGE_COUNT);
                  document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
              >
                {t('grid.show_fewer')}
              </button>
            )}
            <span>{t('grid.showing_count', { visible: Math.min(visibleCount, filteredPackages.length), total: filteredPackages.length })}</span>
          </div>
        )}
      </section>

      <section className="saf-compare reveal">
        <header className="saf-compare__head">
          <span className="section-eyebrow">{t('matches.eyebrow')}</span>
          <h2 className="section-title">{t('matches.title')}</h2>
          <p className="section-lead">{t('matches.lead')}</p>
        </header>
        <div className="saf-compare__grid">
          {packageMatches.map((item) => (
            <Link className="saf-compare__card" key={item.slug} to={`/packages/${item.slug}`} aria-label={t('matches.explore_aria', { pick: item.pick })}>
              <span>{item.label}</span>
              <h3>{item.pick}</h3>
              <p>{item.note}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="included reveal">
        <div className="included__wrap">
          <div className="included__copy">
            <span className="section-eyebrow">{t('market.eyebrow')}</span>
            <h2 className="section-title">{t('market.title')}</h2>
            <p className="section-lead">{t('market.lead')}</p>
          </div>
          <ul className="included__list">
            {marketCategories.map((item) => (
              <li key={item}><span>✓</span> {item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="included reveal">
        <div className="included__wrap">
          <div className="included__copy">
            <span className="section-eyebrow">{t('included.eyebrow')}</span>
            <h2 className="section-title">{t('included.title')}</h2>
            <p className="section-lead">{t('included.lead')}</p>
          </div>
          <ul className="included__list">
            {packageIncluded.map((item) => (
              <li key={item}><span>✓</span> {item}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="saf-steps reveal">
        <header className="saf-steps__head">
          <span className="section-eyebrow">{t('steps.eyebrow')}</span>
          <h2 className="section-title">{t('steps.title')}</h2>
        </header>
        <div className="saf-steps__grid">
          {packageSteps.map((item) => (
            <article className="saf-step" key={item.step}>
              <span>{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="exc-cta">
        <div className="exc-cta__bg"><ResponsiveImage src="/assets/images/excursions/prison-island-tortoise.webp" alt="" /></div>
        <div className="exc-cta__inner">
          <h2>{t('cta.title')}</h2>
          <p>{t('cta.text')}</p>
          <div className="exc-cta__btns">
            <Link className="btn btn--lg btn--accent" to="/booking">{t('cta.get_quote')}</Link>
            <Link className="btn btn--ghost-light btn--lg" to="/trip-planner">{t('cta.ai_planner')}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
