import { Link } from 'react-router-dom';
import { WHATSAPP_LINK } from '../../constants/links';
import './StickyMobileCTA.scss';

const StickyMobileCTA = () => (
  <div className="sticky-cta" role="complementary" aria-label="Quick booking actions">
    <a
      href={WHATSAPP_LINK}
      target="_blank"
      rel="noopener noreferrer"
      className="sticky-cta__btn sticky-cta__btn--whatsapp"
    >
      <i className="fab fa-whatsapp" aria-hidden="true"></i>
      WhatsApp
    </a>
    <Link to="/excursions" className="sticky-cta__btn sticky-cta__btn--primary">
      Book Now
    </Link>
  </div>
);

export default StickyMobileCTA;
