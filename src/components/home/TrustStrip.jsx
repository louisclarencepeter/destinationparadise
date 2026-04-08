import './TrustStrip.scss';

const items = [
  { icon: '★', label: '4.9/5 Rating', sub: '500+ verified reviews' },
  { icon: '👥', label: '2,000+ Travelers', sub: 'Hosted since 2015' },
  { icon: '🏝', label: 'Local Experts', sub: 'Born & raised in Zanzibar' },
  { icon: '✓', label: 'Best Price', sub: 'Direct booking, no markup' },
];

const TrustStrip = () => (
  <section className="trust-strip" aria-label="Why travelers trust us">
    <div className="trust-strip__inner">
      {items.map((it) => (
        <div key={it.label} className="trust-strip__item">
          <span className="trust-strip__icon" aria-hidden="true">{it.icon}</span>
          <div className="trust-strip__text">
            <strong>{it.label}</strong>
            <span>{it.sub}</span>
          </div>
        </div>
      ))}
    </div>
  </section>
);

export default TrustStrip;
