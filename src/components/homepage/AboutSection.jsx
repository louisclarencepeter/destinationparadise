import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { ArrowIcon } from './Icons.jsx';
import { ABOUT_HERO_IMAGE } from '../../data/aboutPageData.js';

export default function AboutSection() {
  const { t } = useTranslation('home');
  const highlights = t('about.highlights', { returnObjects: true, defaultValue: [] });

  return (
    <section className="home-about reveal" id="about-intro">
      <div className="home-about__inner">
        <figure className="home-about__media">
          <ResponsiveImage
            src={ABOUT_HERO_IMAGE}
            alt={t('about.image_alt', { defaultValue: 'Crowned cranes in long grass at dawn' })}
            loading="lazy"
            decoding="async"
          />
          <figcaption className="home-about__sig">
            <span className="home-about__sig-name">Destination Paradise</span>
            <span className="home-about__sig-role">{t('about.signature_role', { defaultValue: 'Zanzibar & Tanzania · Born from a dream' })}</span>
          </figcaption>
        </figure>

        <div className="home-about__copy">
          <span className="section-eyebrow">{t('about.eyebrow', { defaultValue: 'About us' })}</span>
          <h2 className="home-about__title">
            {t('about.title_prefix', { defaultValue: 'A vision,' })}{' '}
            <em>{t('about.title_em', { defaultValue: 'finally' })}</em>{' '}
            <span className="home-about__title-tail">{t('about.title_suffix', { defaultValue: 'taking its first journey.' })}</span>
          </h2>
          <p className="home-about__lead">
            {t('about.lead', {
              defaultValue: 'Destination Paradise was born from a dream — to connect people to the beauty, culture and spirit of Tanzania. After years of preparation, we are officially launching from Unguja, Zanzibar.',
            })}
          </p>

          {Array.isArray(highlights) && highlights.length > 0 && (
            <ul className="home-about__highlights">
              {highlights.map((item) => (
                <li key={`${item.value}-${item.label}`}>
                  <strong>{item.em ? <em>{item.value}</em> : item.value}</strong>
                  <span>{item.label}</span>
                </li>
              ))}
            </ul>
          )}

          <div className="home-about__cta">
            <Link className="btn" to="/aboutus">
              {t('about.cta', { defaultValue: 'Read our story' })} <ArrowIcon size={14} />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
