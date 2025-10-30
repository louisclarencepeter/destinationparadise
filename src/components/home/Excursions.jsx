import React from "react"; // We no longer need useEffect, useRef, or useState here
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import "./Excursions.scss";

// Import data from Suggestion 1
import { EXCURSIONS_DATA } from "../../assets/data/excursionsData"; 
// Import hook from Suggestion 2
import { useAnimateOnScroll } from "../../hooks/useAnimateOnScroll"; 

const ExcursionCard = ({ trip, index }) => {
  // 1. REPLACED: All observer logic is replaced with our new hook
  const [cardRef, isVisible] = useAnimateOnScroll({ threshold: 0.1 });

  // 2. REMOVED: The old useEffect for the observer is gone

  return (
    <article
      ref={cardRef} // 3. The ref from the hook is attached
      className={`excursion-card ${isVisible ? "animate" : ""}`} // 4. isVisible from the hook controls the class
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <img
        src={trip.image}
        alt={trip.title}
        className="excursion-card__image"
      />
      <div className="excursion-card__content">
        <h3 className="excursion-card__title reveal">{trip.title}</h3>
        <p className="excursion-card__text reveal">{trip.description}</p>
        <Link
          to={`/excursions/${trip.id}`}
          className="excursion-card__link reveal"
          aria-label={`Learn more about ${trip.title}`}
        >
          {trip.linkText}
          <svg
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </Link>
      </div>
    </article>
  );
};

ExcursionCard.propTypes = {
  trip: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    image: PropTypes.string.isRequired,
    linkText: PropTypes.string.isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
};

const Excursions = () => {
  // 1. REPLACED: Observer logic is replaced with the hook
  const [sectionRef, isVisible] = useAnimateOnScroll({ threshold: 0.1 });

  // 2. REMOVED: The old useEffect for the observer is gone

  return (
    <section 
      ref={sectionRef} // 3. The ref is attached
      className={`excursions ${isVisible ? "animate" : ""}`} // 4. isVisible controls the class
    >
      <h2 className="excursions__title reveal">Roaming Retreats</h2>
      <div className="excursions__grid reveal">
        {EXCURSIONS_DATA.map((trip, index) => (
          <ExcursionCard key={trip.id} trip={trip} index={index} />
        ))}
      </div>
      <div className="excursions__more reveal">
        <Link to="/excursions" className="excursions__more-link">
          <span>View More Excursions</span>
          <svg
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
          <span className="sr-only">View all available excursions</span>
        </Link>
      </div>
    </section>
  );
};

export default Excursions;