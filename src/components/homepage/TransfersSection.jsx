import { Link } from 'react-router-dom';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ArrowIcon } from './Icons.jsx';
import { buildLocalizedTransferProducts } from '../../data/transferProducts.js';

const FEATURED_TRANSFER_SLUGS = [
  'airport-paje',
  'airport-nungwi',
  'vip-airport-service',
];

const getTransferTagKey = (transfer) => {
  if (transfer.slug === 'vip-airport-service') return 'vip';
  if (transfer.slug === 'airport-nungwi') return 'north_coast';
  if (transfer.slug === 'airport-paje') return 'beach_resorts';
  return 'transfer';
};

export default function TransfersSection() {
  const { t } = useTranslation(['home', 'transfers']);
  const transferCards = useMemo(() => {
    const transferT = (key, options) => t(`transfers:${key}`, options);
    const products = buildLocalizedTransferProducts(transferT);
    return FEATURED_TRANSFER_SLUGS
      .map((slug) => products.find((item) => item.slug === slug))
      .filter(Boolean);
  }, [t]);

  return (
    <section className="home-transfers" id="transfers">
      <header className="home-transfers__head">
        <span className="section-eyebrow reveal" style={{ '--reveal-index': 0 }}>{t('transfers.eyebrow')}</span>
        <h2 className="section-title reveal" style={{ '--reveal-index': 1 }}>{t('transfers.title')}</h2>
        <p className="section-lead reveal" style={{ '--reveal-index': 2 }}>{t('transfers.lead')}</p>
      </header>

      <div className="home-transfers__grid">
        {transferCards.map((transfer, i) => (
          <article className={`home-transfer-card reveal dp-lift${transfer.featured ? ' home-transfer-card--feature' : ''}`} style={{ '--reveal-index': i }} key={transfer.slug}>
            {transfer.featured && <span className="home-transfer-card__rib">{t('transfers.tags.vip')}</span>}
            <div className="home-transfer-card__head">
              <span className="home-transfer-card__tag">{t(`transfers.tags.${getTransferTagKey(transfer)}`)}</span>
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
                <span className="home-transfer-card__from">{t('transfers.card.from')}</span>
                <span className="home-transfer-card__price">{transfer.homePrice || transfer.priceSummary.replace(/^.* from /i, '')}</span>
                <span className="home-transfer-card__pp">{transfer.duration}</span>
              </div>
              <Link className="btn" to={`/booking?type=transfer&item=${transfer.slug}#booking-details`}>
                {t('transfers.card.book_transfer')} <ArrowIcon size={14} />
              </Link>
            </div>
          </article>
        ))}
      </div>

      <div className="home-transfers__more">
        <Link className="btn btn--on-light reveal" style={{ '--reveal-index': 0 }} to="/transfers">{t('transfers.view_all')} <ArrowIcon size={16} /></Link>
      </div>
    </section>
  );
}
