import { useTranslation } from 'react-i18next';
import ResponsiveImage from '../ResponsiveImage.jsx';
import { ABOUT_HERO_IMAGE } from '../../data/aboutPageData.js';

export default function AboutHero() {
  const { t } = useTranslation('about');
  const stats = t('hero.stats', {
    returnObjects: true,
    defaultValue: [
      { value: 'Now', label: 'Unguja', em: true },
      { value: 'Now', label: 'Mainland', em: true },
      { value: 'Next', label: 'Pemba' },
      { value: 'Next', label: 'Mafia Island' },
    ],
  });

  return (
    <section className="ab-hero" id="ab-top">
      <div className="ab-hero__bg">
        <ResponsiveImage src={ABOUT_HERO_IMAGE} alt={t('hero.image_alt', { defaultValue: 'Crowned cranes in long grass at dawn' })} fetchpriority="high" loading="eager" decoding="sync" />
      </div>
      <div className="ab-hero__inner">
        <span className="ab-hero__eyebrow">{t('hero.eyebrow', { defaultValue: 'About Destination Paradise' })}</span>
        <h1 className="ab-hero__title">
          {t('hero.title_prefix', { defaultValue: 'A vision,' })}{' '}
          <em>{t('hero.title_em', { defaultValue: 'finally' })}</em>{' '}
          <span className="ab-hero__title-tail">{t('hero.title_suffix', { defaultValue: 'taking its first journey.' })}</span>
        </h1>
        <p className="ab-hero__lead">{t('hero.lead', { defaultValue: 'Destination Paradise was born from a dream — to connect people to the beauty, culture and spirit of Tanzania. After years of preparation, we are officially launching from Unguja, Zanzibar.' })}</p>
        <div className="ab-hero__stats">
          {Array.isArray(stats) && stats.map((item) => (
            <div key={`${item.value}-${item.label}`}>
              <strong>{item.em ? <em>{item.value}</em> : item.value}</strong>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
