import { Link } from 'react-router-dom';
import ResponsiveImage from '../ResponsiveImage.jsx';

export default function BookingHero() {
  return (
    <section className="booking-hero">
      <div className="booking-hero__bg"><ResponsiveImage src="/assets/images/home/mizingani-waterfront.webp" alt="" fetchpriority="high" loading="eager" decoding="sync" /></div>
      <div className="booking-hero__inner">
        <span className="booking-hero__eyebrow">Booking request</span>
        <h1>One form <em>for every trip.</em></h1>
        <p>Packages, excursions, safaris, private transfers, custom routes, and online payment requests all start here. Tell us the shape, and our team will confirm availability, timing, and the final price.</p>
        <div className="booking-hero__actions">
          <a className="btn btn--lg" href="#booking-form">Start request</a>
          <Link className="btn btn--ghost btn--lg" to="/trip-planner">Plan with AI</Link>
        </div>
        <div className="booking-hero__stats" aria-label="Booking trust signals">
          <div><strong>500+</strong><span>Trips planned</span></div>
          <div><strong>1,200+</strong><span>Happy guests</span></div>
          <div><strong>24h</strong><span>Request confirmed</span></div>
        </div>
      </div>
    </section>
  );
}
