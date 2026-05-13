import { Link } from 'react-router-dom';
import { ArrowIcon } from './Icons.jsx';
import { TRANSFER_PRODUCTS } from '../../data/transferProducts.js';

const FEATURED_TRANSFER_SLUGS = [
  'airport-paje',
  'airport-nungwi',
  'vip-airport-service',
];

const transferCards = FEATURED_TRANSFER_SLUGS
  .map((slug) => TRANSFER_PRODUCTS.find((item) => item.slug === slug))
  .filter(Boolean);

const getTransferTag = (transfer) => {
  if (transfer.slug === 'vip-airport-service') return 'VIP';
  if (transfer.slug === 'airport-nungwi') return 'North coast';
  if (transfer.slug === 'airport-paje') return 'Beach resorts';
  return 'Transfer';
};

export default function TransfersSection() {
  return (
    <section className="home-transfers reveal" id="transfers">
      <header className="home-transfers__head">
        <span className="section-eyebrow">Private transfers</span>
        <h2 className="section-title">Arrive smoothly, before the trip even begins.</h2>
        <p className="section-lead">
          Airport meet &amp; greet, private AC vehicles, flight tracking, luggage help, and VIP arrival options across Zanzibar.
        </p>
      </header>

      <div className="home-transfers__grid">
        {transferCards.map((transfer) => (
          <article className={`home-transfer-card${transfer.featured ? ' home-transfer-card--feature' : ''}`} key={transfer.slug}>
            {transfer.featured && <span className="home-transfer-card__rib">VIP</span>}
            <div className="home-transfer-card__head">
              <span className="home-transfer-card__tag">{getTransferTag(transfer)}</span>
              <h3>{transfer.title}</h3>
              <p>{transfer.description}</p>
            </div>

            <ul className="home-transfer-card__list">
              {transfer.pricing.slice(0, 3).map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <div className="home-transfer-card__foot">
              <div>
                <span className="home-transfer-card__from">From</span>
                <span className="home-transfer-card__price">{transfer.priceSummary.replace(/^.* from /i, '')}</span>
                <span className="home-transfer-card__pp">{transfer.duration}</span>
              </div>
              <Link className="btn" to={`/booking?type=transfer&item=${transfer.slug}#booking-details`}>
                Book transfer <ArrowIcon size={14} />
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="home-transfers__more">
        <Link className="btn btn--on-light" to="/transfers">View all transfers <ArrowIcon size={16} /></Link>
      </div>
    </section>
  );
}
