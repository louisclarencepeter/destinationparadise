import { useTranslation } from 'react-i18next';
import { useBookingCart } from '../../context/useBookingCart.js';
import { cartItemCount } from '../../lib/storeCart.js';
import { CartIcon } from './StoreIcons.jsx';

// Nav-bar cart trigger with an item-count badge. Catalog-free on purpose so it
// can live in the shell bundle; the drawer itself is lazy-loaded.
export default function CartNavButton({ className = '' }) {
  const { t } = useTranslation('nav');
  const { state, dispatch } = useBookingCart();
  const count = cartItemCount(state);

  return (
    <button
      type="button"
      className={`cart-nav-btn ${className}`.trim()}
      aria-label={t('cart.open_aria')}
      onClick={() => dispatch({ type: 'open_drawer' })}
    >
      <CartIcon size={18} />
      <span className="cart-nav-btn__text">{t('cart.label')}</span>
      {count > 0 && <span className="cart-nav-btn__badge">{count}</span>}
    </button>
  );
}
