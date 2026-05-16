import { useTranslation } from 'react-i18next';
import { aboutPillars } from '../../data/aboutPageData.js';

const pillarIcons = {
  people: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="9" cy="7" r="3" /><circle cx="17" cy="11" r="3" /><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" /><path d="M14 21v-1a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3v1" /></svg>
  ),
  home: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21h18" /><path d="M5 21V8l7-5 7 5v13" /><path d="M9 21v-6h6v6" /></svg>
  ),
  network: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><circle cx="6" cy="6" r="2.5" /><circle cx="18" cy="6" r="2.5" /><circle cx="6" cy="18" r="2.5" /><circle cx="18" cy="18" r="2.5" /><circle cx="12" cy="12" r="2.5" /><path d="M8 7l3 4M16 7l-3 4M8 17l3-4M16 17l-3-4" /></svg>
  ),
  layers: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2 4 7l8 5 8-5-8-5z" /><path d="M4 12l8 5 8-5" /><path d="M4 17l8 5 8-5" /></svg>
  ),
};

export default function AboutCommunity() {
  const { t } = useTranslation('about');
  const pillars = t('community.pillars', { returnObjects: true, defaultValue: aboutPillars });
  const quote = t('community.quote', {
    returnObjects: true,
    defaultValue: [
      '“Every destination has a story. Every island has its own culture, energy and hidden beauty waiting to be experienced.',
      'This wasn’t built for scale. It was built for the moments — a slow morning at the reef, a story told in the back of a Land Cruiser, the first time you see the Serengeti go quiet at dusk.',
      'We hope, in time, you’ll have a story of your own to add.”',
    ],
  });

  return (
    <section className="ab-sus reveal" id="community">
      <div className="ab-sus__inner">
        <div className="ab-sus__head">
          <div>
            <span className="ab-story__eyebrow ab-sus__eyebrow">{t('community.eyebrow', { defaultValue: 'Community' })}</span>
            <h2>{t('community.title_prefix', { defaultValue: 'Built as a' })} <em>{t('community.title_em', { defaultValue: 'network' })}</em>, {t('community.title_suffix', { defaultValue: 'not a closed system.' })}</h2>
          </div>
          <p>{t('community.lead', { defaultValue: 'Destination Paradise is not only about travel. We believe tourism should also create real opportunities for the people who host you. From day one we are working hand-in-hand with local drivers, guides, hotels, restaurants and service providers — building something the wider community grows with, not around.' })}</p>
        </div>

        <div className="ab-sus__grid">
          <div className="ab-sus__pillars">
            {Array.isArray(pillars) && pillars.map((pillar, index) => (
              <div className="ab-pillar reveal" key={pillar.icon || `pillar-${index}`} style={{ transitionDelay: `${index * 90}ms` }}>
                <div className="ab-pillar__icon">{pillarIcons[pillar.icon]}</div>
                <h4>{pillar.title}</h4>
                <p>{pillar.body}</p>
              </div>
            ))}
          </div>

          <aside className="ab-sus__quote">
            {Array.isArray(quote) && quote.map((paragraph) => (
              <p className="ab-sus__quote-text" key={paragraph}>{paragraph}</p>
            ))}
            <div className="ab-sus__quote-who">
              <img
                className="ab-sus__quote-avatar"
                src="/assets/images/aboutus/louis-peter-portrait-144.webp"
                alt={t('community.avatar_alt', { defaultValue: 'Louis Peter, founder of Destination Paradise' })}
                width="48"
                height="48"
                loading="lazy"
                decoding="async"
              />
              <div>
                <strong>{t('community.quote_byline', { defaultValue: 'From our founding note' })}</strong>
                <span>{t('community.quote_meta', { defaultValue: 'Destination Paradise · 2026' })}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
