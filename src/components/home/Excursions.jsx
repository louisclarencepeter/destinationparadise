import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import "./Excursions.scss";

// Import data
import { EXCURSIONS_DATA } from "../../assets/data/excursionsData";
// Import hook
import { useAnimateOnScroll } from "../../hooks/useAnimateOnScroll";

const ExcursionCard = ({ trip, index }) => {
  const [cardRef, isVisible] = useAnimateOnScroll({ threshold: 0.1 });

  return (
    <article
      ref={cardRef}
      className={`excursion-card ${isVisible ? "animate" : ""}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* 1. NEW: Wrapper for image and badge */}
      <div className="excursion-card__image-wrapper">
        <img
          src={trip.image}
          alt={trip.title}
          className="excursion-card__image"
        />
        {/* 2. NEW: Conditionally render the badge */}
        {trip.duration && (
          <span className="excursion-card__badge">{trip.duration}</span>
        )}
      </div>

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
    duration: PropTypes.string, // 3. NEW: Add optional duration prop
  }).isRequired,
  index: PropTypes.number.isRequired,
};

const Excursions = () => {
  const [sectionRef, isVisible] = useAnimateOnScroll({ threshold: 0.1 });

  return (
    <section
      ref={sectionRef}
      className={`excursions ${isVisible ? "animate" : ""}`}
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