import { useTranslation } from 'react-i18next';
import { CONTACT_INFO } from '../../constants/contactInfo.js';
import { TRANSFERS_HERO_IMAGE } from '../../data/transfersPageContent.js';

export default function TransfersHero() {
  const { t } = useTranslation('transfers');
  const stats = t('hero.stats', { returnObjects: true });

  return (
    <section className="tr-hero">
      <div className="tr-hero__bg">
        <img
          src={TRANSFERS_HERO_IMAGE}
          alt=""
          fetchpriority="high"
          loading="eager"
          decoding="sync"
        />
      </div>
      <div className="tr-hero__inner">
        <span className="tr-hero__eyebrow">{t('hero.eyebrow')}</span>
        <h1 className="tr-hero__title">
          {t('hero.title_prefix')} <em>{t('hero.title_em')}</em> {t('hero.title_suffix')}
        </h1>
        <p className="tr-hero__lead">{t('hero.lead')}</p>
        <div className="tr-hero__cta">
          <a className="btn btn--lg" href="#transfer-types">{t('hero.route_pricing')}</a>
          <a className="btn btn--ghost btn--lg" href={CONTACT_INFO.whatsappUrl} target="_blank" rel="noreferrer">
            {t('hero.whatsapp')}
          </a>
        </div>
        <div className="tr-hero__stats">
          {Array.isArray(stats) && stats.map((item) => (
            <div key={item.label}><strong>{item.value}</strong><span>{item.label}</span></div>
          ))}
        </div>
      </div>
    </section>
  );
}
