import { useTranslation } from 'react-i18next';

const FLEET_ICONS = {
  standard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 17h14l-1.5-5.5A2 2 0 0 0 15.6 10H8.4a2 2 0 0 0-1.9 1.5L5 17Z" />
      <path d="M7 17v2M17 17v2M6 14h12M8.5 10l1-3h5l1 3" />
      <circle cx="7.5" cy="17.5" r="1.5" />
      <circle cx="16.5" cy="17.5" r="1.5" />
    </svg>
  ),
  premium: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 16h18l-1.7-6.2A2.5 2.5 0 0 0 16.9 8H8.2a2.5 2.5 0 0 0-2.3 1.5L3 16Z" />
      <path d="M7 8l1-3h6.5l2.4 3M5 13h15M5 16v2M19 16v2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  ),
  vip: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="7" width="18" height="10" rx="2" />
      <path d="M7 7v10M11 7v10M3 12h18M17 7l2 5" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  ),
  group: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="4" width="16" height="13" rx="2" />
      <path d="M4 9h16M8 4v13M12 4v13M16 4v13M7 20h.01M17 20h.01" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  ),
};

const FALLBACK_FLEET = [
  {
    key: 'standard',
    type: 'Standard Private',
    capacity: 'Reliable AC vehicle',
    desc: 'Best for practical airport and hotel transfers with meet & greet, flight tracking, luggage help, and door-to-door service.',
  },
  {
    key: 'premium',
    type: 'Premium SUV',
    capacity: 'Couples · families',
    desc: 'A more spacious, elevated transfer for honeymooners, beach-resort guests, safari clients, and travellers with extra luggage.',
  },
  {
    key: 'vip',
    type: 'VIP Concierge',
    capacity: 'Luxury arrival',
    desc: 'Fast-track support, private concierge handling, luxury vehicle, cold towels, refreshments, and a highly polished arrival.',
  },
  {
    key: 'group',
    type: 'Group Transfer',
    capacity: '5 – 25 guests',
    desc: 'Minivans and coaster buses for families, wedding groups, corporate teams, and safari groups arriving together.',
  },
];

export default function TransfersFleet() {
  const { t } = useTranslation('transfers');
  const fleet = t('fleet.items', { returnObjects: true, defaultValue: FALLBACK_FLEET });

  return (
    <section className="tr-fleet">
      <header className="tr-fleet__head">
        <span className="section-eyebrow reveal" style={{ '--reveal-index': 0 }}>{t('fleet.eyebrow')}</span>
        <h2 className="section-title reveal" style={{ '--reveal-index': 1 }}>{t('fleet.title')}</h2>
        <p className="section-lead reveal" style={{ '--reveal-index': 2 }}>{t('fleet.lead')}</p>
      </header>
      <div className="tr-fleet__grid">
        {Array.isArray(fleet) && fleet.map((v, i) => (
          <article className="tr-vehicle reveal" key={v.type} style={{ '--reveal-index': i }}>
            <span className="tr-vehicle__icon">{FLEET_ICONS[v.key]}</span>
            <h3 className="tr-vehicle__type">{v.type}</h3>
            <span className="tr-vehicle__cap">{v.capacity}</span>
            <p>{v.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
