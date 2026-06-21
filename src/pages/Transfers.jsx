import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import TransfersCta from '../components/transfers/TransfersCta.jsx';
import TransfersFaq from '../components/transfers/TransfersFaq.jsx';
import TransfersFleet from '../components/transfers/TransfersFleet.jsx';
import TransfersHero from '../components/transfers/TransfersHero.jsx';
import TransfersHow from '../components/transfers/TransfersHow.jsx';
import TransfersIncluded from '../components/transfers/TransfersIncluded.jsx';
import TransfersTypes from '../components/transfers/TransfersTypes.jsx';
import { usePageMeta } from '../hooks/usePageMeta.js';
import { useRevealOnScroll } from '../hooks/useRevealOnScroll.js';
import '../styles/homepage.css';
import '../styles/transfers.css';

export default function Transfers() {
  const { t, i18n, ready } = useTranslation('transfers');
  usePageMeta(t('page_title'), t('page_description'));

  const pageRef = useRef(null);
  useRevealOnScroll(pageRef, '.reveal:not(.is-visible)', ready ? i18n.resolvedLanguage : 'loading');

  return (
    <main className="transfers-page" ref={pageRef}>
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
