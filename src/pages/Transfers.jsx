import { useTranslation } from 'react-i18next';
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

export default function Transfers() {
  const { t } = useTranslation('transfers');
  usePageMeta(t('page_title'), t('page_description'));

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
