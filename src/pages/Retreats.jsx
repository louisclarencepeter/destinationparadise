import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trans, useTranslation } from 'react-i18next';
import ResponsiveImage from '../components/ResponsiveImage.jsx';
import { useCurrency } from '../context/useCurrency.js';
import usePageMeta from '../hooks/usePageMeta.js';
import { RETREAT_PRODUCTS } from '../data/retreatProducts.js';
import {
  RETREAT_GALLERY_IMAGES,
  RETREAT_HERO_IMAGES,
  RETREAT_PAGE_IMAGES,
  RETREAT_TEACHER_IMAGES,
  RETREAT_TYPE_IMAGES,
} from '../data/retreatsPageData.js';
import { arrayFromTranslation } from '../utils/translationValues.js';
import '../styles/excursions/hero.css';
import '../styles/retreats.css';

// Single source of truth for the retreat collection's "from" price.
const RETREAT_PRICE = Math.min(...RETREAT_PRODUCTS.map((product) => product.price));

const optionCopyBySlug = (item) => new Map(
  arrayFromTranslation(item?.options).map((option) => [option.slug, option]),
);

export default function Retreats() {
  const { t, ready } = useTranslation('retreats');
  const { format } = useCurrency();
  const pageRef = useRef(/** @type {HTMLElement | null} */ (null));
  const [openFaq, setOpenFaq] = useState(0);
  const [heroSlide, setHeroSlide] = useState(0);

  const practices = arrayFromTranslation(t('practice.items', { returnObjects: true }));
  const retreatTypes = arrayFromTranslation(t('retreat_types.items', { returnObjects: true }));
  const teachers = arrayFromTranslation(t('teachers.items', { returnObjects: true }));
  const journey = arrayFromTranslation(t('journey.items', { returnObjects: true }));
  const daySchedule = arrayFromTranslation(t('day.items', { returnObjects: true }));
  const galleryItems = arrayFromTranslation(t('gallery.items', { returnObjects: true }));
  const included = arrayFromTranslation(t('included.items', { returnObjects: true }));
  const faqs = arrayFromTranslation(t('faqs.items', { returnObjects: true }));

  usePageMeta({
    title: t('page_title'),
    description: t('meta_description', {
      defaultValue:
        'A yoga & wellness retreat in Zanzibar — guided practice, ocean-view sessions, Swahili cuisine, and curated island excursions. Fixed departures with limited spots.',
    }),
  });

  useEffect(() => {
    document.body.classList.add('has-retreat-page');
    return () => document.body.classList.remove('has-retreat-page');
  }, []);

  useEffect(() => {
    const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || RETREAT_HERO_IMAGES.length < 2) return undefined;
    const timer = window.setInterval(() => {
      setHeroSlide((index) => (index + 1) % RETREAT_HERO_IMAGES.length);
    }, 5200);
    return () => window.clearInterval(timer);
  }, []);

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
    }, { threshold: 0.12 });
    items.forEach((item) => observer.observe(item));
    return () => observer.disconnect();
  }, [ready]);

  if (!ready) return null;

  return (
    <main className="retreat-page" ref={pageRef}>
      {/* Hero — shared site hero pattern (mirrors excursions/safaris/packages) */}
      <section className="exc-hero">
        <div className="exc-hero__bg ret-hero-slideshow">
          {RETREAT_HERO_IMAGES.map((image, index) => (
            <div
              className={`ret-hero-slide${index === heroSlide ? ' is-active' : ''}`}
              key={image}
              aria-hidden="true"
            >
              <ResponsiveImage
                src={image}
                alt=""
                fetchpriority={index === 0 ? 'high' : 'auto'}
                loading={index === 0 ? 'eager' : 'lazy'}
                decoding={index === 0 ? 'sync' : 'async'}
                sizes="100vw"
              />
            </div>
          ))}
        </div>
        <div className="exc-hero__inner">
          <span className="exc-hero__eyebrow">{t('hero.eyebrow')}</span>
          <h1 className="exc-hero__title">{t('hero.title_prefix')} <em>{t('hero.title_em')}</em></h1>
          <p className="exc-hero__lead">{t('hero.subtitle')}</p>
          <div className="exc-hero__row">
            <a className="btn btn--lg" href="#retreat-types">{t('hero.see_day')}</a>
            <a className="btn btn--ghost btn--lg" href="#teachers">{t('hero.meet_teachers')}</a>
            <Link className="btn btn--ghost btn--lg" to="/booking?type=retreat">{t('hero.reserve')}</Link>
          </div>
          <div className="exc-hero__meta">
            <div><strong>{t('hero.stat_nights_value')}</strong><span>{t('hero.stat_nights')}</span></div>
            <div><strong>{t('hero.stat_guests_value')}</strong><span>{t('hero.stat_guests')}</span></div>
            <div><strong>{t('hero.stat_practices_value')}</strong><span>{t('hero.stat_practices')}</span></div>
            <div><strong>{t('hero.stat_levels_value')}</strong><span>{t('hero.stat_levels')}</span></div>
          </div>
        </div>
      </section>

      {/* Intention */}
      <section className="ret-intention reveal">
        <span className="ret-eyebrow">{t('intention.eyebrow')}</span>
        <p className="ret-intention__text">
          <Trans i18nKey="intention.text" ns="retreats" components={{ em: <em /> }} />
        </p>
      </section>

      {/* Teachers */}
      <section className="ret-teachers reveal" id="teachers">
        <header className="ret-teachers__head">
          <span className="ret-eyebrow">{t('teachers.eyebrow')}</span>
          <h2 className="ret-title">{t('teachers.title')}</h2>
          <p>{t('teachers.lead')}</p>
        </header>
        <div className="ret-teachers__grid">
          {teachers.map((teacher, i) => {
            return (
              <article className="ret-teacher-card" key={teacher.name}>
                <div className="ret-teacher-card__media">
                  <ResponsiveImage src={RETREAT_TEACHER_IMAGES[i % RETREAT_TEACHER_IMAGES.length]} alt={teacher.image_alt} sizes="(max-width: 900px) 100vw, 45vw" />
                </div>
                <div className="ret-teacher-card__copy">
                  <span>{teacher.role}</span>
                  <h3>{teacher.name}</h3>
                  <p>{teacher.text}</p>
                  <ul>
                    {arrayFromTranslation(teacher.specialties).map((specialty) => (
                      <li key={specialty}>{specialty}</li>
                    ))}
                  </ul>
                  <Link
                    className="ret-teacher-card__button"
                    to={`/retreats/teachers/${teacher.id}`}
                    aria-label={t('teachers.select_cta', { teacher: teacher.name })}
                  >
                    {t('teachers.select_cta', { teacher: teacher.name })}
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Retreat styles */}
      <section className="ret-dark ret-types" id="retreat-types">
        <header className="ret-dark__head reveal">
          <span className="ret-eyebrow ret-eyebrow--light">{t('retreat_types.eyebrow')}</span>
          <h2 className="ret-title ret-title--script">{t('retreat_types.title')}</h2>
          <p className="ret-dark__lead">{t('retreat_types.lead')}</p>
        </header>
        <div className="ret-types__grid">
          {retreatTypes.map((item, i) => {
            const product = RETREAT_PRODUCTS.find((entry) => entry.slug === item.slug);
            const productOptions = product && 'options' in product && Array.isArray(product.options) ? product.options : [];
            const optionCopy = optionCopyBySlug(item);
            return (
              <article className="ret-type-card reveal" key={item.slug} style={{ '--ret-reveal-index': i }}>
                <div className="ret-type-card__media">
                  <ResponsiveImage src={RETREAT_TYPE_IMAGES[i % RETREAT_TYPE_IMAGES.length]} alt={item.image_alt} sizes="(max-width: 900px) 100vw, 33vw" />
                </div>
                <div className="ret-type-card__copy">
                  <span>{item.duration}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <ul>
                    {arrayFromTranslation(item.highlights).map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                  {productOptions.length > 0 && (
                    <div className="ret-type-card__options">
                      {productOptions.map((option) => {
                        const copy = optionCopy.get(option.slug);
                        return (
                          <Link
                            className="ret-option-card"
                            key={option.slug}
                            to={`/booking?type=retreat&item=${item.slug}&option=${option.slug}`}
                          >
                            <span className="ret-option-card__copy">
                              <span>{copy?.label || option.label}</span>
                              <small>{copy?.text || option.duration}</small>
                            </span>
                            <strong>{format(option.price)}</strong>
                            <span className="ret-option-card__cta">{copy?.cta || item.cta}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                  {productOptions.length === 0 && (
                    <Link
                      className="ret-option-card ret-option-card--single"
                      to={`/booking?type=retreat&item=${item.slug}`}
                    >
                      <span className="ret-option-card__copy">
                        <span>{item.title}</span>
                        <small>{item.duration}</small>
                      </span>
                      {product && <strong>{format(product.price)}</strong>}
                      <span className="ret-option-card__cta">{item.cta}</span>
                    </Link>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Quote band */}
      <section className="ret-quote">
        <div className="ret-quote__bg"><ResponsiveImage src={RETREAT_PAGE_IMAGES.quote} alt="" sizes="100vw" /></div>
        <blockquote className="ret-quote__text">
          <Trans i18nKey="quote.text" ns="retreats" components={{ em: <em /> }} />
        </blockquote>
      </section>

      {/* Practice */}
      <section className="ret-dark ret-practice" id="practice">
        <header className="ret-dark__head reveal">
          <span className="ret-eyebrow ret-eyebrow--light">{t('practice.eyebrow')}</span>
          <h2 className="ret-title ret-title--script">{t('practice.title')}</h2>
          <p className="ret-dark__lead">{t('practice.lead')}</p>
        </header>
        <div className="ret-practice__grid">
          {practices.map((item, i) => (
            <article className="ret-practice__card reveal" key={item.step} style={{ '--ret-reveal-index': i }}>
              <span className="ret-practice__num">{item.step}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* The journey — high-level 14-day itinerary */}
      <section className="ret-dark ret-journey">
        <header className="ret-dark__head reveal">
          <span className="ret-eyebrow ret-eyebrow--light">{t('journey.eyebrow')}</span>
          <h2 className="ret-title ret-title--script">{t('journey.title')}</h2>
          <p className="ret-dark__lead">{t('journey.lead')}</p>
        </header>
        <div className="ret-journey__grid">
          {journey.map((item, i) => (
            <article className="ret-practice__card reveal" key={item.days} style={{ '--ret-reveal-index': i }}>
              <span className="ret-practice__num">{item.days}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
        <p className="ret-journey__note reveal">
          <Trans i18nKey="journey.note" ns="retreats" components={{ strong: <strong /> }} />
        </p>
      </section>

      {/* A day in the life */}
      <section className="ret-dark ret-day" id="day">
        <header className="ret-dark__head reveal">
          <span className="ret-eyebrow ret-eyebrow--light">{t('day.eyebrow')}</span>
          <h2 className="ret-title ret-title--script">{t('day.title')}</h2>
          <p className="ret-dark__lead">{t('day.lead')}</p>
        </header>
        <ol className="ret-timeline">
          {daySchedule.map((item, i) => (
            <li className="ret-timeline__item reveal" key={item.time} style={{ '--ret-reveal-index': i }}>
              <span className="ret-timeline__dot" aria-hidden="true" />
              <span className="ret-timeline__time">{item.time}</span>
              <div className="ret-timeline__body">
                <h3>{item.title}</h3>
                <p>{item.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* Gallery */}
      <section className="ret-dark ret-gallery">
        <header className="ret-dark__head reveal">
          <span className="ret-eyebrow ret-eyebrow--light">{t('gallery.eyebrow')}</span>
          <h2 className="ret-title ret-title--script">{t('gallery.title')}</h2>
          <p className="ret-dark__lead">{t('gallery.lead')}</p>
        </header>
        <div className="ret-gallery__grid">
          {galleryItems.map((item, i) => (
            <figure className={`ret-gallery__cell ret-gallery__cell--${i + 1} reveal`} key={`gallery-${i}`} style={{ '--ret-reveal-index': i }}>
              <ResponsiveImage src={RETREAT_GALLERY_IMAGES[i % RETREAT_GALLERY_IMAGES.length]} alt={item.caption} sizes="(max-width: 900px) 100vw, 50vw" />
              <figcaption aria-hidden="true">{item.caption}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* What's included */}
      <section className="ret-dark ret-included">
        <div className="ret-included__copy reveal">
          <span className="ret-eyebrow ret-eyebrow--light">{t('included.eyebrow')}</span>
          <h2 className="ret-title ret-title--script">{t('included.title')}</h2>
          <p className="ret-dark__lead">{t('included.lead')}</p>
          <p className="ret-included__price">
            {t('included.price_from')} <strong>{format(RETREAT_PRICE)}</strong> <span>{t('included.price_unit')}</span>
          </p>
        </div>
        <ul className="ret-included__list">
          {included.map((item, i) => (
            <li className="reveal" key={`included-${i}`} style={{ '--ret-reveal-index': i }}><span className="ret-check" aria-hidden="true">✓</span> {item}</li>
          ))}
        </ul>
      </section>

      {/* FAQs */}
      <section className="ret-dark ret-faq">
        <header className="ret-dark__head reveal">
          <span className="ret-eyebrow ret-eyebrow--light">{t('faqs.eyebrow')}</span>
          <h2 className="ret-title ret-title--script">{t('faqs.title')}</h2>
        </header>
        <div className="ret-faq__list">
          {faqs.map((item, i) => {
            const open = openFaq === i;
            const qId = `ret-faq-q-${i}`;
            const aId = `ret-faq-a-${i}`;
            // Open state lives on data-open, not className, so the scroll-reveal
            // observer's imperatively-added `is-visible` class survives re-renders.
            return (
              <div className="ret-faq__item reveal" data-open={open || undefined} key={`faq-${i}`} style={{ '--ret-reveal-index': i }}>
                <button
                  type="button"
                  id={qId}
                  className="ret-faq__q"
                  aria-expanded={open}
                  aria-controls={aId}
                  onClick={() => setOpenFaq(open ? -1 : i)}
                >
                  <span>{item.q}</span>
                  <span className="ret-faq__icon" aria-hidden="true">{open ? '×' : '+'}</span>
                </button>
                {open && <p className="ret-faq__a" id={aId} role="region" aria-labelledby={qId}>{item.a}</p>}
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="ret-cta reveal">
        <div className="ret-cta__bg"><ResponsiveImage src={RETREAT_PAGE_IMAGES.cta} alt="" sizes="100vw" /></div>
        <div className="ret-cta__inner">
          <h2 className="ret-title ret-title--light">{t('cta.title')}</h2>
          <p>{t('cta.text')}</p>
          <div className="ret-cta__btns">
            <Link className="btn btn--lg btn--accent" to="/booking?type=retreat">{t('cta.reserve')}</Link>
            <Link className="btn btn--ghost-light btn--lg" to="/trip-planner">{t('cta.ai_planner')}</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
