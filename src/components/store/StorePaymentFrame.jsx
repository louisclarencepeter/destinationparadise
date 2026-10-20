import { useId, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isSafePaymentUrl } from '../../lib/storeApi.js';

/**
 * Pesapal owns the payment form. Loading this frame does not confirm payment;
 * only the parent page's authenticated order-status check can do that.
 *
 * @param {{
 *   paymentUrl: string,
 *   onCheckStatus: () => void | Promise<void>,
 *   checking?: boolean,
 *   showExternalLink?: boolean,
 *   title?: string,
 * }} props
 */
export default function StorePaymentFrame({
  paymentUrl,
  onCheckStatus,
  checking = false,
  showExternalLink = true,
  title,
}) {
  const { t } = useTranslation('store');
  const id = useId();
  const [reloadCount, setReloadCount] = useState(0);
  const [loadedFrame, setLoadedFrame] = useState(/** @type {string | null} */ (null));
  const frameKey = `${reloadCount}:${paymentUrl}`;
  const loading = loadedFrame !== frameKey;

  if (!isSafePaymentUrl(paymentUrl, 'pesapal')) {
    return <p className="store-payment-frame__unavailable" role="alert">{t('payment.unavailable')}</p>;
  }

  return (
    <section className="store-payment-frame" aria-labelledby={`${id}-title`}>
      <div className="store-payment-frame__head">
        <span className="store-payment-frame__provider">{t('payment.provider')}</span>
        <h2 id={`${id}-title`} className="store-payment-frame__title">
          {title || t('payment.frame_title')}
        </h2>
        <p id={`${id}-description`} className="store-payment-frame__description">
          {t('payment.description')}
        </p>
        <p className="store-payment-frame__terms">{t('payment.terms_hint')}</p>
      </div>

      <p className="store-payment-frame__load-status" role="status" aria-live="polite">
        {loading && <span className="store-payment-frame__spinner" aria-hidden="true" />}
        {t(loading ? 'payment.loading' : 'payment.ready')}
      </p>

      <div className="store-payment-frame__viewport" aria-busy={loading}>
        <iframe
          key={frameKey}
          className="store-payment-frame__iframe"
          src={paymentUrl}
          title={t('payment.iframe_title')}
          aria-describedby={`${id}-description`}
          referrerPolicy="no-referrer"
          onLoad={() => setLoadedFrame(frameKey)}
        />
      </div>

      <div className="store-payment-frame__actions">
        <button
          type="button"
          className="store-payment-frame__check"
          disabled={checking}
          onClick={() => onCheckStatus()}
          aria-busy={checking}
        >
          {t(checking ? 'payment.checking' : 'payment.check_status')}
        </button>
        <button
          type="button"
          className="store-payment-frame__reload"
          aria-describedby={`${id}-reload-hint`}
          onClick={() => setReloadCount((count) => count + 1)}
        >
          {t('payment.reload')}
        </button>
      </div>
      <p id={`${id}-reload-hint`} className="store-payment-frame__reload-hint">
        {t('payment.reload_hint')}
      </p>

      {showExternalLink && (
        <p className="store-payment-frame__fallback">
          <span>{t('payment.external_hint')}</span>{' '}
          <a href={paymentUrl} rel="noreferrer" referrerPolicy="no-referrer">
            {t('payment.external_link')}
          </a>
        </p>
      )}
    </section>
  );
}
