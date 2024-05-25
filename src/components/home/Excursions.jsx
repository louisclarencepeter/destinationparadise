import './Excursions.scss';
import { Link } from 'react-router-dom';
import img from '../../assets/images/stonetown/stonetown.jpg';
import img2 from '../../assets/images/safariblue/safariblue.jpg';
import img3 from '../../assets/images/spicetour/spice.jpg';

const Excursions = () => {
  const trips = [
    {
      link: '/excursions#stone-town-heritage-walk',
      title: 'Stone Town Heritage Walk',
      text: 'Embark on a journey through the timeless Stone Town, a place where history resonates in every alley.',
      discount: '10%',
      image: img,
    },
    {
      link: '/excursions#dhow-snorkeling-safari-blue',
      title: 'Dhow & Snorkeling Safari Blue',
      text: 'Experience the authentic and unrivaled Safari Blue - a full-day excursion aboard traditional, locally-crafted sailing dhows.',
      discount: '10%',
      image: img2,
    },
    {
      link: '/excursions#zanzibar-spice-culture-tour',
      title: 'Zanzibar Spice & Culture Tour',
      text: 'Embark on a half-day journey through Central Zanzibar, exploring the rich history shaped by cloves, nutmeg, cinnamon, and pepper.',
      discount: '10%',
      image: img3,
    },
  ];

  return (
    <section className="excursions">
      <h2>Roaming Retreats</h2>
      <div className="excursions__grid reveal">
        {trips.map((trip, index) => (
          <article className="excursion-card" key={index}>
            <img src={trip.image} alt={trip.title} className="excursion-card__image" />
            <div className="excursion-card__content">
              <h3 className="excursion-card__title">{trip.title}</h3>
              <p className="excursion-card__text">{trip.text}</p>
              <Link to={trip.link} className="excursion-card__link" aria-label={`Learn more about ${trip.title}`}>
                Learn more
                <svg fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-label="External Link">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
};

export default Excursions;