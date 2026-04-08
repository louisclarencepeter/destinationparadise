import { Link } from 'react-router-dom';
import { WHATSAPP_LINK } from '../../constants/links';
import './FinalCTA.scss';

const FinalCTA = () => (
  <section className="final-cta">
    <div className="final-cta__inner">
      <span className="final-cta__eyebrow">Ready when you are</span>
      <h2 className="final-cta__title">
        Start planning your <em>Zanzibar</em> escape
      </h2>
      <p className="final-cta__text">
        Tell us what you&rsquo;re dreaming of — we&rsquo;ll craft a personal
        itinerary, free of charge. No pressure, just possibilities.
      </p>
      <div className="final-cta__buttons">
        <a
          href={WHATSAPP_LINK}
          target="_blank"
          rel="noopener noreferrer"
          className="final-cta__btn final-cta__btn--primary"
        >
          <i className="fab fa-whatsapp" aria-hidden="true"></i>
          Message us on WhatsApp
        </a>
        <Link to="/excursions" className="final-cta__btn final-cta__btn--ghost">
          Browse all excursions
        </Link>
      </div>
    </div>
  </section>
);

export default FinalCTA;
