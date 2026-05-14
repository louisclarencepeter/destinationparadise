import { Link } from 'react-router-dom';
import ResponsiveImage from '../ResponsiveImage.jsx';

export default function BookingHero() {
  return (
    <section className="booking-hero">
      <div className="booking-hero__bg"><ResponsiveImage src="/assets/images/home/mizingani-waterfront.webp" alt="" fetchpriority="high" loading="eager" decoding="sync" /></div>
      <div className="booking-hero__inner">
        <span className="booking-hero__eyebrow">Zapytanie rezerwacyjne</span>
        <h1>Jeden formularz <em>dla każdej podróży.</em></h1>
        <p>Pakiety, wycieczki, safari, transfery prywatne, trasy na miarę i płatności online zaczynają się tutaj. Opowiedz nam, czego szukasz, a zespół potwierdzi dostępność, godziny i końcową cenę.</p>
        <div className="booking-hero__actions">
          <a className="btn btn--lg" href="#booking-form">Rozpocznij zapytanie</a>
          <Link className="btn btn--ghost btn--lg" to="/trip-planner">Planuj z AI</Link>
        </div>
        <div className="booking-hero__stats" aria-label="Powody zaufania przy rezerwacji">
          <div><strong>500+</strong><span>Zaplanowanych podróży</span></div>
          <div><strong>1,200+</strong><span>Zadowolonych gości</span></div>
          <div><strong>24h</strong><span>Potwierdzenie zapytania</span></div>
        </div>
      </div>
    </section>
  );
}
