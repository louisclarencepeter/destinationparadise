import React from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import "./Excursions.scss";

// Import data
import { EXCURSIONS_DATA } from "../../assets/data/excursionsData";
// Import hook
import { useAnimateOnScroll } from "../../hooks/useAnimateOnScroll";

/**
 * Reusable Arrow Icon Component
 * Used in card links and "View More" button
 */
const ArrowIcon = () => (
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
);

/**
 * ExcursionCard Component
 * Displays individual excursion with image, badge, and details
 */
const ExcursionCard = ({ trip, index }) => {
  const [cardRef, isVisible] = useAnimateOnScroll({ threshold: 0.1 });

  return (
    <article
      ref={cardRef}
      className={`excursion-card ${isVisible ? "animate" : ""}`}
      style={{ 
        transitionDelay: `${index * 0.1}s` 
      }}
    >
      <div className="excursion-card__image-wrapper">
        <img
          src={trip.image}
          alt={trip.title}
          className="excursion-card__image"
          loading="lazy"
        />
        {trip.duration && (
          <span 
            className="excursion-card__badge"
            aria-label={`Duration: ${trip.duration}`}
          >
            {trip.duration}
          </span>
        )}
      </div>

      <div className="excursion-card__content">
        <h3 className="excursion-card__title">{trip.title}</h3>
        <p className="excursion-card__text">{trip.description}</p>
        <Link
          to={`/excursions/${trip.id}`}
          className="excursion-card__link"
          aria-label={`Learn more about ${trip.title}`}
        >
          {trip.linkText}
          <ArrowIcon />
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
    duration: PropTypes.string,
  }).isRequired,
  index: PropTypes.number.isRequired,
};

/**
 * Excursions Component
 * Main section displaying featured excursions grid
 */
const Excursions = () => {
  const [sectionRef, isVisible] = useAnimateOnScroll({ 
    threshold: 0.1,
    rootMargin: '50px'
  });

  // Handle empty data gracefully
  if (!EXCURSIONS_DATA || EXCURSIONS_DATA.length === 0) {
    return null;
  }

  return (
    <section
      ref={sectionRef}
      className={`excursions ${isVisible ? "animate" : ""}`}
    >
      <h2 className="excursions__title">Roaming Retreats</h2>
      <div className="excursions__grid">
        {EXCURSIONS_DATA.map((trip, index) => (
          <ExcursionCard key={trip.id} trip={trip} index={index} />
        ))}
      </div>
      <div 
        className="excursions__more"
        style={{ 
          transitionDelay: `${EXCURSIONS_DATA.length * 0.1}s` 
        }}
      >
        <Link to="/excursions" className="excursions__more-link">
          <span>View More Excursions</span>
          <ArrowIcon />
          <span className="sr-only">View all available excursions</span>
        </Link>
      </div>
    </section>
  );
};

export default Excursions;