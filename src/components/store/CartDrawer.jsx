import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../context/useCurrency.js';
import { useBookingCart } from '../../context/useBookingCart.js';
import { getInstantExperience } from '../../data/commerceCatalog.js';
import { priceSelection, quoteCartItems } from '../../lib/storeApi.js';
import { trackEvent } from '../../utils/analytics.js';
import CartItem from './CartItem.jsx';
import { ArrowRightIcon, CloseIcon } from './StoreIcons.jsx';
import '../../styles/store.css';

// Slide-in multi-trip cart, mounted once at layout level. Every open triggers a
// re-quote so prices/availability shown are fresh, never the persisted copy.
export default function CartDrawer() {
  const { t } = useTranslation('store');
  const { format } = useCurrency();
  const { state, dispatch } = useBookingCart();
  const navigate = useNavigate();
  const drawerRef = useRef(/** @type {HTMLElement | null} */ (null));
  const closeBtnRef = useRef(/** @type {HTMLButtonElement | null} */ (null));
  const [quote, setQuote] = useState(
    /** @type {{ quotes: {id: string, status: string}[], subtotalUsd: number } | null} */ (null),
  );

  const open = state.drawerOpen;
  const close = () => dispatch({ type: 'close_drawer' });

  // Resolve items against the catalog; drop lines whose product no longer exists.
  const lines = useMemo(
    () =>
      state.items
        .map((item) => ({ item, experience: getInstantExperience(item.experienceId) }))
        .filter((line) => line.experience),
    [state.items],
  );

  const subtotalUsd = useMemo(
    () =>
      lines.reduce(
        (sum, { item, experience }) => sum + priceSelection(experience, item.mode, item.guests).totalUsd,
        0,
      ),
    [lines],
  );

  // Re-check availability whenever the drawer opens or the items change.
  useEffect(() => {
    if (!open || state.items.length === 0) return undefined;
    let active = true;
    quoteCartItems(state.items).then((result) => {
      if (active) setQuote(result);
    });
    return () => {
      active = false;
    };
  }, [open, state.items]);

  // Focus management + escape + scroll lock while open (mirrors SiteNav's menu).
  useEffect(() => {
    const drawer = drawerRef.current;
    if (!drawer) return undefined;
    if (!open) {
      drawer.setAttribute('inert', '');
      return undefined;
    }
    drawer.removeAttribute('inert');

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const trigger = document.activeElement;
    const focusTimer = window.requestAnimationFrame(() => closeBtnRef.current?.focus());

    const handleKey = (event) => {
      if (event.key === 'Escape') {
        dispatch({ type: 'close_drawer' });
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = /** @type {NodeListOf<HTMLElement>} */ (
        drawer.querySelectorAll('a[href], button:not([disabled])')
      );
      if (focusable.length === 0) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', handleKey);
    return () => {
      window.cancelAnimationFrame(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
      if (trigger instanceof HTMLElement) trigger.focus();
    };
  }, [open, dispatch]);

  const statusFor = (itemId) =>
    quote?.quotes?.find((entry) => entry.id === itemId)?.status || 'available';

  const editItem = (line) => {
    dispatch({ type: 'close_drawer' });
    navigate(`/excursions/${line.experience.sourceKey}?edit=${line.item.id}#book`);
  };

  const removeItem = (line) => {
    dispatch({ type: 'remove', id: line.item.id });
    trackEvent('remove_from_cart', { item_id: line.item.experienceId });
  };

  const beginCheckout = () => {
    dispatch({ type: 'close_drawer' });
    trackEvent('begin_checkout', { value: subtotalUsd, currency: 'USD', items: lines.length });
    navigate('/store/checkout');
  };

  return (
    <>
      {open && <div className="cart-scrim" onClick={close} aria-hidden="true" />}
      <aside
        ref={drawerRef}
        className={`cart-drawer${open ? ' is-open' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={t('cart.title')}
      >
        <div className="cart-drawer__head">
          <div>
            <h3 className="cart-drawer__title">{t('cart.title')}</h3>
            <p className="cart-drawer__sub">{t('cart.subhead', { count: lines.length })}</p>
          </div>
          <button type="button" ref={closeBtnRef} className="cart-drawer__close" aria-label={t('cart.close')} onClick={close}>
            <CloseIcon />
          </button>
        </div>

        <div className="cart-drawer__body">
          {lines.length === 0 ? (
            <div className="cart-drawer__empty">
              <p>{t('cart.empty')}</p>
              <button type="button" className="cart-drawer__browse" onClick={() => { close(); navigate('/store'); }}>
                {t('cart.browse')}
              </button>
            </div>
          ) : (
            lines.map((line) => (
              <CartItem
                key={line.item.id}
                item={line.item}
                experience={line.experience}
                status={statusFor(line.item.id)}
                totalUsd={priceSelection(line.experience, line.item.mode, line.item.guests).totalUsd}
                onEdit={() => editItem(line)}
                onRemove={() => removeItem(line)}
              />
            ))
          )}
        </div>

        {lines.length > 0 && (
          <div className="cart-drawer__foot">
            <div className="cart-drawer__subtotal">
              <span>{t('cart.subtotal')}</span>
              <strong>{format(subtotalUsd)}</strong>
            </div>
            <button type="button" className="cart-drawer__checkout" onClick={beginCheckout}>
              {t('cart.checkout_cta')}
              <ArrowRightIcon size={17} />
            </button>
            <p className="cart-drawer__note">{t('cart.note')}</p>
          </div>
        )}
      </aside>
    </>
  );
}
