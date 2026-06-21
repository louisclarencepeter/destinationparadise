import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ResponsiveImage from '../components/ResponsiveImage.jsx';
import { EXCURSIONS } from '../data/excursionsData.js';
import { EXCURSION_COMBINATIONS } from '../data/excursionCombinations.js';
import usePageMeta, { clampDescription } from '../hooks/usePageMeta.js';
import { touristTripJsonLd } from '../utils/productJsonLd.js';
import { useCurrency } from '../context/useCurrency.js';
import { arrayFromTranslation } from '../utils/translationValues.js';
import '../styles/homepage.css';
import '../styles/excursions.css';

const fallbackImage = '/assets/images/excursions/safari-blue-sandbank.webp';

export default function ExcursionCombinationDetail() {
  const { t, ready } = useTranslation('excursions');
  const { id } = useParams();
  const { format } = useCurrency();
  const combo = EXCURSION_COMBINATIONS.find((item) => item.id === id);
  const excursions = /** @type {Array<(typeof EXCURSIONS)[number]>} */ (
    combo
      ? combo.excursionIds
          .map((excursionId) => EXCURSIONS.find((item) => item.id === excursionId))
          .filter(Boolean)
      : []
  );
  const heroExcursion = excursions.find((item) => !item.imageTBD) || excursions[0];
  const heroImage = heroExcursion && !heroExcursion.imageTBD ? heroExcursion.image : fallbackImage;
  const minPrice = excursions.reduce((total, item) => total + (typeof item.price === 'number' ? item.price : 0), 0);

  usePageMeta(
    combo
      ? {
          title: `${combo.title} · Excursion Combination · Destination Paradise`,
          description: clampDescription(
            combo.desc ||
              `${combo.title} — a combined Zanzibar day pairing ${combo.combo ? combo.combo.join(' and ') : 'two excursions'}, with hotel pickup and local guides.`,
          ),
          jsonLd: touristTripJsonLd({
            name: combo.title,
            description: combo.desc,
            path: `/excursions/combinations/${combo.id}`,
            image: heroImage,
            price: minPrice > 0 ? minPrice : undefined,
          }),
        }
      : { title: t('combination.not_found_page_title'), noindex: true },
  );

  if (!ready) return null;

  if (!combo) {
    return (
      <main className="excursions-page">
        <section className="exc-day" style={{ textAlign: 'center', minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div>
            <span className="section-eyebrow">{t('combination.not_found_eyebrow')}</span>
            <h1 className="section-title">{t('combination.not_found_title')}</h1>
            <p className="section-lead">{t('combination.not_found_text')}</p>
            <Link className="btn" to="/excursions" style={{ marginTop: '1.5rem' }}>{t('combination.back_to_excursions')}</Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="excursions-page exc-detail">
      <nav className="exc-detail__crumbs" aria-label={t('combination.breadcrumb_aria')}>
        <Link to="/">{t('combination.breadcrumb_home')}</Link>
        <span aria-hidden="true">→</span>
        <Link to="/excursions">{t('combination.breadcrumb_excursions')}</Link>
        <span aria-hidden="true">→</span>
        <span>{combo.title}</span>
      </nav>

      <article id={combo.id} className="exc-block exc-block--detail">
        <div className="exc-block__img">
          <ResponsiveImage src={heroImage} alt="" />
          <span className="exc-block__cat">{t('combination.category')}</span>
        </div>
        <div className="exc-block__body">
          <span className="exc-block__eyebrow">{combo.combo.join(' + ')}</span>
          <h1 className="exc-block__title">{combo.title}</h1>
          <p className="exc-block__desc">{combo.desc}</p>
          <dl className="exc-block__facts">
            <div><dt>{t('combination.facts.length')}</dt><dd>{combo.length}<small>{t('combination.facts.length_sub')}</small></dd></div>
            <div><dt>{t('combination.facts.stops')}</dt><dd>{combo.combo.length}<small>{combo.combo.join(' + ')}</small></dd></div>
            <div><dt>{t('combination.facts.style')}</dt><dd>{t('combination.facts.style_value')}<small>{t('combination.facts.style_sub')}</small></dd></div>
            <div><dt>{t('combination.facts.quote')}</dt><dd>24h<small>{t('combination.facts.quote_sub')}</small></dd></div>
          </dl>
          <div className="exc-block__cols">
            <div className="exc-block__col">
              <h4>{t('combination.included_experiences')}</h4>
              <ul>{combo.combo.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
            <div className="exc-block__col">
              <h4>{t('combination.ideal_for')}</h4>
              <ul>{combo.idealFor.map((item) => <li key={item}>{item}</li>)}</ul>
            </div>
          </div>
          <div className="exc-block__cols">
            <div className="exc-block__col">
              <h4>{t('combination.open_each_stop')}</h4>
              <ul>
                {excursions.map((item) => (
                  <li key={item.id}><Link to={`/excursions/${item.id}`}>{item.title}</Link></li>
                ))}
              </ul>
            </div>
            <div className="exc-block__col">
              <h4>{t('combination.planning_note')}</h4>
              <ul>
                {arrayFromTranslation(t('combination.planning_note_items', { returnObjects: true })).map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
          </div>
          <div className="exc-block__actions">
            {minPrice > 0 ? (
              <span className="exc-block__price">{format(minPrice)}<small>{t('combination.price_estimated')}</small></span>
            ) : (
              <span className="exc-block__price-note">{t('combination.price_on_request')}</span>
            )}
            <span className="exc-block__price-note">{t('combination.price_note')}</span>
            <Link className="btn" to={`/booking?type=custom&title=${encodeURIComponent(combo.title)}`}>{t('combination.book_this')}</Link>
            <Link className="btn btn--ghost-dark" to="/excursions">{t('combination.all_excursions')}</Link>
          </div>
        </div>
      </article>

      <section className="exc-day" id="sequence">
        <div className="exc-day__head">
          <span className="section-eyebrow">{t('combination.sequence.eyebrow')}</span>
          <h2 className="section-title">{t('combination.sequence.title')}</h2>
          <p className="section-lead">{t('combination.sequence.lead')}</p>
        </div>
        <div className="exc-day__timeline">
          {combo.rhythm.map(([time, title, text]) => (
            <div className="exc-day__row" key={`${time}-${title}`}>
              <div className="exc-day__time">{time}</div>
              <div className="exc-day__what"><strong>{title}</strong><p>{text}</p></div>
            </div>
          ))}
        </div>
      </section>

      <section className="exc-cta">
        <div className="exc-cta__bg"><ResponsiveImage src={heroImage} alt="" /></div>
        <div className="exc-cta__inner">
          <h2>{t('combination.cta.title', { title: combo.title })}</h2>
          <p>{t('combination.cta.text')}</p>
          <div className="exc-cta__btns">
            <Link className="btn btn--lg" to={`/booking?type=custom&title=${encodeURIComponent(combo.title)}`}>{t('cta.get_in_touch')}</Link>
            <Link className="btn btn--ghost-light btn--lg" to="/trip-planner">{t('combination.cta.plan_ai')}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
