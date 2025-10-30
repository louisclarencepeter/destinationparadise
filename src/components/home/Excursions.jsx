import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import "./Excursions.scss";
// 1. IMPORT: Data is now imported from an external file
import { EXCURSIONS_DATA } from "../../assets/data/excursionsData"; 

// 2. REMOVED: The hardcoded 'TRIPS' array is gone

const ExcursionCard = ({ trip, index }) => {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const card = cardRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (card) {
      observer.observe(card);
    }

    return () => {
      if (card) {
        observer.unobserve(card);
      }
    };
  }, []);

  return (
    <article
      ref={cardRef}
      className={`excursion-card ${isVisible ? "animate" : ""}`}
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
  const sectionRef = useRef(null);

  useEffect(() => {
    const section = sectionRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          section.classList.add("animate");
          observer.unobserve(entry.target);
        }
      },
      { threshold: 0.1 }
    );

    if (section) {
      observer.observe(section);
    }

    return () => {
      if (section) {
        observer.unobserve(section);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="excursions">
      <h2 className="excursions__title reveal">Roaming Retreats</h2>
      <div className="excursions__grid reveal">
        {/* 3. UPDATED: We now map over the imported EXCURSIONS_DATA */}
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