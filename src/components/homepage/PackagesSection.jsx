import { ArrowIcon } from './Icons.jsx';

export default function PackagesSection() {
  return (
    <section className="packages reveal" id="packages">
      <header className="packages__head">
        <span className="section-eyebrow">All-in-One</span>
        <h2 className="section-title">Curated packages — hotels, safaris &amp; excursions</h2>
        <p className="section-lead">A single price, every transfer covered. We pair a hand-picked hotel with safaris on the mainland and excursions on the island.</p>
      </header>
      <div className="packages__grid">
        <article className="pkg-card">
          <div className="pkg-card__rib">Most popular</div>
          <div className="pkg-card__head">
            <span className="pkg-card__nights">7 nights</span>
            <h3>Island Essentials</h3>
            <p className="pkg-card__lead">Stone Town heritage, beach days in Matemwe, one full-day Safari Blue dhow.</p>
          </div>
          <ul className="pkg-card__list">
            <li><span className="pkg-tag pkg-tag--hotel">Hotel</span> Park Hyatt Stone Town · 2 nts</li>
            <li><span className="pkg-tag pkg-tag--hotel">Hotel</span> Zuri Zanzibar Matemwe · 5 nts</li>
            <li><span className="pkg-tag pkg-tag--exc">Excursion</span> Stone Town Heritage Walk</li>
            <li><span className="pkg-tag pkg-tag--exc">Excursion</span> Safari Blue Dhow &amp; Snorkel</li>
            <li><span className="pkg-tag pkg-tag--exc">Excursion</span> Spice &amp; Culture Tour</li>
            <li><span className="pkg-tag pkg-tag--inc">Included</span> Airport pickup, all transfers</li>
          </ul>
          <div className="pkg-card__foot">
            <div><span className="pkg-card__from">From</span><span className="pkg-card__price">$2,490</span><span className="pkg-card__pp">per person</span></div>
            <a className="btn" href="#contact">Build this trip <ArrowIcon size={14} /></a>
          </div>
        </article>
        <article className="pkg-card pkg-card--feature">
          <div className="pkg-card__rib pkg-card__rib--gold">Signature</div>
          <div className="pkg-card__head">
            <span className="pkg-card__nights">10 nights</span>
            <h3>Bush &amp; Beach</h3>
            <p className="pkg-card__lead">Three nights on safari in the Serengeti, then unwind on a private Matemwe beachfront villa.</p>
          </div>
          <ul className="pkg-card__list">
            <li><span className="pkg-tag pkg-tag--saf">Safari</span> Serengeti — Sayari Camp · 3 nts</li>
            <li><span className="pkg-tag pkg-tag--saf">Safari</span> Ngorongoro — &amp;Beyond · 2 nts</li>
            <li><span className="pkg-tag pkg-tag--hotel">Hotel</span> Zanzibar White Sand Villas · 5 nts</li>
            <li><span className="pkg-tag pkg-tag--exc">Excursion</span> Dream Dhow Sunset Cruise</li>
            <li><span className="pkg-tag pkg-tag--exc">Excursion</span> Dolphin Snorkeling</li>
            <li><span className="pkg-tag pkg-tag--inc">Included</span> Bush flights, ranger fees, all meals</li>
          </ul>
          <div className="pkg-card__foot">
            <div><span className="pkg-card__from">From</span><span className="pkg-card__price">$5,790</span><span className="pkg-card__pp">per person</span></div>
            <a className="btn" href="#contact">Build this trip <ArrowIcon size={14} /></a>
          </div>
        </article>
        <article className="pkg-card">
          <div className="pkg-card__head">
            <span className="pkg-card__nights">5 nights</span>
            <h3>Honeymoon Hideaway</h3>
            <p className="pkg-card__lead">A quiet northern villa, two private excursions, and a candle-lit dhow dinner for two.</p>
          </div>
          <ul className="pkg-card__list">
            <li><span className="pkg-tag pkg-tag--hotel">Hotel</span> The Residence Zanzibar · 5 nts</li>
            <li><span className="pkg-tag pkg-tag--exc">Excursion</span> Private Dream Dhow at sunset</li>
            <li><span className="pkg-tag pkg-tag--exc">Excursion</span> Mnemba Atoll snorkel — private</li>
            <li><span className="pkg-tag pkg-tag--inc">Included</span> Couples spa, bush picnic, transfers</li>
          </ul>
          <div className="pkg-card__foot">
            <div><span className="pkg-card__from">From</span><span className="pkg-card__price">$3,180</span><span className="pkg-card__pp">per person</span></div>
            <a className="btn" href="#contact">Build this trip <ArrowIcon size={14} /></a>
          </div>
        </article>
      </div>
      <div className="packages__note">Every package is a starting point — message us and we'll adjust nights, hotels, and routes around your dates.</div>
    </section>
  );
}
