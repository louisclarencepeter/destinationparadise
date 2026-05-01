import '../styles/homepage.css';
import { useNavigate } from 'react-router-dom';

export default function TripPlannerPage() {
  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();
    navigate('/#contact');
  };

  return (
    <main className="standalone-page">
      <section className="standalone-page__section standalone-page__section--narrow">
        <header className="standalone-page__head">
          <span className="section-eyebrow">AI Trip Planner</span>
          <h1 className="section-title">Trip Planner</h1>
          <p className="section-lead">
            Tell us the pace, budget, dates, and mix of beach, culture, wildlife, or family time you want. We will shape it into a bookable itinerary.
          </p>
        </header>
        <form className="standalone-form" onSubmit={handleSubmit}>
          <label>
            Trip idea
            <textarea name="trip" rows="7" placeholder="Example: Family of four, 10 nights in July, a short safari, beach time, and a dhow day." />
          </label>
          <button className="btn" type="submit">Start planning</button>
        </form>
      </section>
    </main>
  );
}
