import TransfersCta from '../components/transfers/TransfersCta.jsx';
import TransfersFaq from '../components/transfers/TransfersFaq.jsx';
import TransfersFleet from '../components/transfers/TransfersFleet.jsx';
import TransfersHero from '../components/transfers/TransfersHero.jsx';
import TransfersHow from '../components/transfers/TransfersHow.jsx';
import TransfersIncluded from '../components/transfers/TransfersIncluded.jsx';
import TransfersTypes from '../components/transfers/TransfersTypes.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';
import '../styles/homepage.css';
import '../styles/transfers.css';

const PAGE_TITLE = 'Airport & Island Transfers · Zanzibar · Destination Paradise';
const PAGE_DESCRIPTION = 'Premium Zanzibar airport transfers, private hotel transfers, VIP concierge arrivals, and group transport from Destination Paradise. Meet & greet, flight tracking, AC vehicles, 24/7.';

export default function Transfers() {
  usePageMeta(PAGE_TITLE, PAGE_DESCRIPTION);

  return (
    <main className="transfers-page">
      <TransfersHero />
      <TransfersTypes />
      <TransfersHow />
      <TransfersIncluded />
      <TransfersFleet />
      <TransfersFaq />
      <TransfersCta />
    </main>
  );
}
