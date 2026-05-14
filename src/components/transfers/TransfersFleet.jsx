const FLEET = [
  {
    type: 'Standard prywatny',
    capacity: 'Pewny samochód z klimatyzacją',
    desc: 'Najlepszy do praktycznych transferów z lotniska i hoteli: powitanie, śledzenie lotu, pomoc z bagażem i przejazd od drzwi do drzwi.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M5 17h14l-1.5-5.5A2 2 0 0 0 15.6 10H8.4a2 2 0 0 0-1.9 1.5L5 17Z" />
        <path d="M7 17v2M17 17v2M6 14h12M8.5 10l1-3h5l1 3" />
        <circle cx="7.5" cy="17.5" r="1.5" />
        <circle cx="16.5" cy="17.5" r="1.5" />
      </svg>
    ),
  },
  {
    type: 'Premium SUV',
    capacity: 'Pary · rodziny',
    desc: 'Bardziej przestronny i wygodny transfer dla par poślubnych, gości resortów plażowych, klientów safari i osób z większym bagażem.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M3 16h18l-1.7-6.2A2.5 2.5 0 0 0 16.9 8H8.2a2.5 2.5 0 0 0-2.3 1.5L3 16Z" />
        <path d="M7 8l1-3h6.5l2.4 3M5 13h15M5 16v2M19 16v2" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
  },
  {
    type: 'VIP Concierge',
    capacity: 'Luksusowy przyjazd',
    desc: 'Fast-track, prywatna obsługa concierge, luksusowy pojazd, chłodne ręczniki, napoje i dopracowany przyjazd.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="7" width="18" height="10" rx="2" />
        <path d="M7 7v10M11 7v10M3 12h18M17 7l2 5" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
  },
  {
    type: 'Transfer dla grup',
    capacity: '5-25 gości',
    desc: 'Minivany i małe autobusy dla rodzin, grup weselnych, zespołów firmowych i grup safari przyjeżdżających razem.',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="4" y="4" width="16" height="13" rx="2" />
        <path d="M4 9h16M8 4v13M12 4v13M16 4v13M7 20h.01M17 20h.01" />
        <circle cx="7" cy="17" r="2" />
        <circle cx="17" cy="17" r="2" />
      </svg>
    ),
  },
];

export default function TransfersFleet() {
  return (
    <section className="tr-fleet">
      <header className="tr-fleet__head">
        <span className="section-eyebrow">Poziomy obsługi</span>
        <h2 className="section-title">Przyjazd Standard, Premium albo VIP.</h2>
        <p className="section-lead">
          Dopasuj transfer do gościa: praktyczny prywatny komfort, podniesiony standard przyjazdu albo pełna obsługa concierge.
        </p>
      </header>
      <div className="tr-fleet__grid">
        {FLEET.map((v) => (
          <article className="tr-vehicle" key={v.type}>
            <span className="tr-vehicle__icon">{v.icon}</span>
            <h3 className="tr-vehicle__type">{v.type}</h3>
            <span className="tr-vehicle__cap">{v.capacity}</span>
            <p>{v.desc}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
