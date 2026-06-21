import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ResponsiveImage from '../components/ResponsiveImage.jsx';
import { EXCURSIONS } from '../data/excursionsData.js';
import usePageMeta, { clampDescription } from '../hooks/usePageMeta.js';
import { touristTripJsonLd } from '../utils/productJsonLd.js';
import { useCurrency } from '../context/useCurrency.js';
import { arrayFromTranslation } from '../utils/translationValues.js';
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
  const { t, ready } = useTranslation('excursions');
  const { id } = useParams();
  const { format } = useCurrency();
  const excursion = EXCURSIONS.find((item) => item.id === id);

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
    <main className="excursions-page exc-detail">
      <nav className="exc-detail__crumbs" aria-label={t('detail.breadcrumb_aria')}>
        <Link to="/">{t('detail.breadcrumb_home')}</Link>
        <span aria-hidden="true">→</span>
        <Link to="/excursions">{t('detail.breadcrumb_excursions')}</Link>
        <span aria-hidden="true">→</span>
        <span>{e.title}</span>
      </nav>

      <article id={e.id} data-cat={categoryToSlug(e.category)} className="exc-block exc-block--detail">
        <div className="exc-block__img">
          <ResponsiveImage src={e.image} alt={e.imageNeeded ? '' : e.alt || e.title} />
          <span className="exc-block__cat" data-cat={categoryToSlug(e.category)}>{e.category}</span>
          {e.season && <span className="exc-block__season">{t('detail.season_prefix')} · {e.season}</span>}
        </div>
        <div className="exc-block__body">
          <span className="exc-block__eyebrow">{e.eyebrow}</span>
          <h1 className="exc-block__title">{e.title}</h1>
          <p className="exc-block__desc">{e.intro || e.description}</p>
          {e.facts && (
            <dl className="exc-block__facts">
              {e.facts.map(([dt, dd, sub]) => (
                <div key={dt}><dt>{dt}</dt><dd>{dd}<small>{sub}</small></dd></div>
              ))}
            </dl>
          )}
          {e.cols && (
            <div className="exc-block__cols">
              {e.cols.map((col) => (
                <div className="exc-block__col" key={col.h}>
                  <h4>{col.h}</h4>
                  <ul>{col.items.map((it) => <li key={it}>{it}</li>)}</ul>
                </div>
              ))}
            </div>
          )}
          {e.highlights && !e.cols && (
            <div className="exc-block__cols">
              <div className="exc-block__col">
                <h4>{t('detail.highlights')}</h4>
                <ul>{e.highlights.map((it) => <li key={it}>{it}</li>)}</ul>
              </div>
            </div>
          )}
          {pricingTiers.length > 0 && (
            <div className="exc-block__cols">
              <div className="exc-block__col">
                <h4>{t('detail.experience_pricing')}</h4>
                <ul>{pricingTiers.map((tier) => <li key={tier.label}>{tier.label}: {t('detail.from')} {format(tier.price)}</li>)}</ul>
              </div>
            </div>
          )}
          <div className="exc-block__actions">
            {typeof e.price === 'number' ? (
              <span className="exc-block__price">{format(e.price)}<small>{e.priceSub || t('detail.per_person')}</small></span>
            ) : (
              <span className="exc-block__price-note">{t('detail.price_on_request')}</span>
            )}
            {e.priceNote && <span className="exc-block__price-note">{e.priceNote}</span>}
            <Link className="btn" to={`/booking?type=excursion&item=${encodeURIComponent(e.id)}`}>{t('detail.book_this')}</Link>
            <Link className="btn btn--ghost-dark" to="/excursions">{t('detail.all_excursions')}</Link>
          </div>
        </div>
      </article>

      {e.timeline && e.timeline.length > 0 && (
        <section className="exc-day" id="day">
          <div className="exc-day__head">
            <span className="section-eyebrow">{t('detail.timeline.eyebrow')}</span>
            <h2 className="section-title">{t('detail.timeline.title')}</h2>
            <p className="section-lead">{t('detail.timeline.lead')}</p>
          </div>
          <div className="exc-day__timeline">
            {e.timeline.map(([t, h, p]) => (
              <div className="exc-day__row" key={t}>
                <div className="exc-day__time">{t}</div>
                <div className="exc-day__what"><strong>{h}</strong><p>{p}</p></div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="exc-prac">
        <div className="exc-prac__grid">
          {PRACTICAL_COLUMNS.map((key) => (
            <div className="exc-prac__col" key={key}>
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
        <div className="exc-cta__bg"><ResponsiveImage src={e.imageNeeded ? '/assets/images/excursions/safari-blue-sandbank.webp' : e.image} alt="" /></div>
        <div className="exc-cta__inner">
          <h2>{t('detail.cta.title', { title: e.title })}</h2>
          <p>{t('detail.cta.text')}</p>
          <div className="exc-cta__btns">
            <Link className="btn btn--lg" to={`/booking?type=excursion&item=${encodeURIComponent(e.id)}`}>{t('cta.get_in_touch')}</Link>
            <Link className="btn btn--ghost-light btn--lg" to="/trip-planner">{t('cta.ai_planner')}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
