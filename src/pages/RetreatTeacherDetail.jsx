import { useEffect, useMemo, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ResponsiveImage from '../components/ResponsiveImage.jsx';
import { useCurrency } from '../context/useCurrency.js';
import { RETREAT_PRODUCTS } from '../data/retreatProducts.js';
import { RETREAT_TEACHER_IMAGES, RETREAT_TYPE_IMAGES } from '../data/retreatsPageData.js';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js';
import usePageMeta, { clampDescription } from '../hooks/usePageMeta.js';
import { arrayFromTranslation } from '../utils/translationValues.js';
import '../styles/retreats.css';

const optionCopyBySlug = (item) => new Map(
  arrayFromTranslation(item?.options).map((option) => [option.slug, option]),
);

export default function RetreatTeacherDetail() {
  const { teacherId } = useParams();
  const { t, i18n, ready } = useTranslation('retreats');
  const { format } = useCurrency();
  const pageRef = useRef(null);

  const teachers = arrayFromTranslation(t('teachers.items', { returnObjects: true }));
  const retreatTypes = arrayFromTranslation(t('retreat_types.items', { returnObjects: true }));
  const teacherIndex = teachers.findIndex((item) => item.id === teacherId);
  const teacher = teacherIndex >= 0 ? teachers[teacherIndex] : null;
  const productBySlug = useMemo(() => new Map(RETREAT_PRODUCTS.map((product) => [product.slug, product])), []);
  const retreatTypeBySlug = useMemo(
    () => new Map(retreatTypes.map((item, index) => [item.slug, { item, index }])),
    [retreatTypes],
  );
  const teacherRetreats = teacher
    ? arrayFromTranslation(teacher.retreats).flatMap((slug) => {
        const retreat = retreatTypeBySlug.get(slug);
        if (!retreat) return [];
        return [{
          ...retreat,
          image: RETREAT_TYPE_IMAGES[retreat.index % RETREAT_TYPE_IMAGES.length],
          product: productBySlug.get(slug),
        }];
      })
    : [];
  const primaryRetreat = teacherRetreats[0]?.item;
  const teacherImage = RETREAT_TEACHER_IMAGES[
    Math.max(teacherIndex, 0) % RETREAT_TEACHER_IMAGES.length
  ];

  useRevealOnScroll(
    pageRef,
    '.reveal:not(.is-visible)',
    ready ? `${i18n.resolvedLanguage}-${teacherId}` : 'loading',
  );

  useEffect(() => {
    document.body.classList.add('has-retreat-teacher-detail');
    return () => document.body.classList.remove('has-retreat-teacher-detail');
  }, []);

  usePageMeta(
    teacher
      ? {
          title: t('teachers.detail.page_title', {
            teacher: teacher.name,
            defaultValue: `${teacher.name} Retreats · Destination Paradise`,
          }),
          description: clampDescription(
            teacher.text ||
              t('teachers.detail.meta_description', {
                teacher: teacher.name,
                defaultValue: `Teacher-led Zanzibar retreats with ${teacher.name}.`,
              }),
          ),
        }
      : { title: t('teachers.detail.not_found_page_title'), noindex: true },
  );

  if (!ready) return null;

  if (!teacher) {
    return (
      <main className="retreat-page ret-teacher-detail-page">
        <section className="ret-teacher-detail-empty">
          <div>
            <span className="ret-eyebrow">{t('teachers.detail.not_found_eyebrow')}</span>
            <h1 className="ret-title">{t('teachers.detail.not_found_title')}</h1>
            <p>{t('teachers.detail.not_found_text')}</p>
            <Link className="btn btn--ghost-dark" to="/retreats#teachers">
              {t('teachers.detail.back_to_teachers')}
            </Link>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="retreat-page ret-teacher-detail-page" ref={pageRef}>
      <nav className="ret-detail-crumbs reveal" aria-label={t('teachers.detail.breadcrumb_aria')}>
        <Link to="/">{t('teachers.detail.breadcrumb_home')}</Link>
        <span aria-hidden="true">→</span>
        <Link to="/retreats">{t('teachers.detail.breadcrumb_retreats')}</Link>
        <span aria-hidden="true">→</span>
        <span>{teacher.name}</span>
      </nav>

      <section className="ret-teacher-detail-hero">
        <div className="ret-teacher-detail-hero__media reveal">
          <ResponsiveImage
            src={teacherImage}
            alt={teacher.image_alt}
            fetchpriority="high"
            loading="eager"
            sizes="(max-width: 900px) 100vw, 44vw"
          />
        </div>
        <div className="ret-teacher-detail-hero__copy">
          <span className="ret-eyebrow reveal" style={{ '--ret-reveal-index': 0 }}>
            {t('teachers.detail.hero_label')}
          </span>
          <h1 className="ret-title reveal" style={{ '--ret-reveal-index': 1 }}>
            {teacher.name}
          </h1>
          <p className="ret-teacher-detail-hero__role reveal" style={{ '--ret-reveal-index': 2 }}>
            {teacher.role}
          </p>
          <p className="ret-teacher-detail-hero__text reveal" style={{ '--ret-reveal-index': 3 }}>
            {teacher.text}
          </p>
          <ul className="ret-teacher-detail-focus-list reveal" style={{ '--ret-reveal-index': 4 }}>
            {arrayFromTranslation(teacher.specialties).map((specialty) => (
              <li key={specialty}>{specialty}</li>
            ))}
          </ul>
          <div className="ret-teacher-detail-hero__actions reveal" style={{ '--ret-reveal-index': 5 }}>
            {primaryRetreat && (
              <Link className="btn" to={`/booking?type=retreat&item=${primaryRetreat.slug}`}>
                {t('teachers.detail.plan_with_teacher', { teacher: teacher.name })}
              </Link>
            )}
            <Link className="btn btn--ghost-dark" to="/retreats#teachers">
              {t('teachers.detail.all_teachers')}
            </Link>
          </div>
        </div>
      </section>

      <section className="ret-teacher-detail-band">
        <div className="ret-teacher-detail-band__copy reveal">
          <span>{t('teachers.detail.focus_eyebrow')}</span>
          <h2>{t('teachers.detail.focus_title', { teacher: teacher.name })}</h2>
          <p>{t('teachers.detail.focus_lead')}</p>
        </div>
        <div className="ret-teacher-detail-band__list">
          {arrayFromTranslation(teacher.specialties).map((specialty, index) => (
            <article className="reveal" key={specialty} style={{ '--ret-reveal-index': index }}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{specialty}</h3>
            </article>
          ))}
        </div>
      </section>

      <section className="ret-teacher-detail-retreats" id="teacher-retreats">
        <header className="ret-teacher-retreats__head reveal">
          <span>{t('teachers.detail.retreats_eyebrow')}</span>
          <h2>{t('teachers.detail.retreats_title', { teacher: teacher.name })}</h2>
          <p>{t('teachers.detail.retreats_lead')}</p>
        </header>
        <div className="ret-teacher-retreats__grid ret-teacher-retreats__grid--detail">
          {teacherRetreats.map(({ item, product, image }, index) => {
            const productOptions = product && 'options' in product && Array.isArray(product.options) ? product.options : [];
            const optionCopy = optionCopyBySlug(item);
            return (
              <article
                className="ret-teacher-retreat-card reveal"
                key={`${teacher.id}-${item.slug}`}
                style={{ '--ret-reveal-index': index }}
              >
                <div className="ret-teacher-retreat-card__media">
                  <ResponsiveImage src={image} alt={item.image_alt} sizes="(max-width: 900px) 100vw, 42vw" />
                </div>
                <div className="ret-teacher-retreat-card__copy">
                  <span>{item.duration}</span>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                  <ul>
                    {arrayFromTranslation(item.highlights).map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                  {productOptions.length > 0 && (
                    <div className="ret-type-card__options ret-type-card__options--teacher">
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

      <section className="ret-teacher-detail-cta reveal">
        <h2>{t('teachers.detail.cta_title', { teacher: teacher.name })}</h2>
        <p>{t('teachers.detail.cta_text')}</p>
        <div>
          <Link className="btn btn--lg btn--accent" to="/booking?type=retreat">
            {t('teachers.detail.cta_primary')}
          </Link>
          <Link className="btn btn--ghost-light btn--lg" to="/retreats">
            {t('teachers.detail.cta_secondary')}
          </Link>
        </div>
      </section>
    </main>
  );
}
