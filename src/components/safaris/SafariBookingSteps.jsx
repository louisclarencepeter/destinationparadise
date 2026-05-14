import { BOOKING_STEPS } from '../../data/safarisPageContent.js';

export default function SafariBookingSteps() {
  return (
    <section className="saf-steps reveal" id="booking-steps">
      <header className="saf-steps__head">
        <span className="section-eyebrow">How booking works</span>
        <h2 className="section-title">Three steps from idea to confirmed safari.</h2>
      </header>
      <div className="saf-steps__grid">
        {BOOKING_STEPS.map((item) => (
          <article className="saf-step" key={item.step}>
            <span>{item.step}</span>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
