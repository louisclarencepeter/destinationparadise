import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import "./UniqueExperiences.scss";
import uniqueExperiences from "../../assets/data/uniqueData.js";
import { useAnimateOnScroll } from "../../hooks/useAnimateOnScroll";

const Slideshow = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000); 

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="experience-card__slideshow">
      {images.map((img, idx) => (
        <img
          key={img} 
          src={img}
          alt={`${title} - ${idx + 1}`}
          className={`slideshow__image ${
            idx === currentIndex ? "active" : ""
          }`}
        />
      ))}
      <div className="slideshow__dots">
        {images.map((img, idx) => (
          <button
            key={`${img}-dot`} 
            type="button"
            className={`dot ${idx === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(idx)}
            aria-label={`Go to image ${idx + 1}`}
            aria-current={idx === currentIndex ? "true" : "false"}
          />
        ))}
      </div>
    </div>
  );
};

Slideshow.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  title: PropTypes.string.isRequired,
};

const ExperienceCard = ({ trip, index }) => {
  const [cardRef, isVisible] = useAnimateOnScroll({ threshold: 0.1 });

  return (
    <article
      ref={cardRef} 
      className={`experience-card ${isVisible ? "animate" : ""}`}
      // --- Changed back to animationDelay ---
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {trip.images ? (
        <Slideshow images={trip.images} title={trip.title} />
      ) : (
        <img
          src={trip.image}
          alt={trip.title}
          className="experience-card__image"
        />
      )}

      <div className="experience-card__content">
        {/* --- 'reveal' class ADDED BACK --- */}
        <h3 className="experience-card__title reveal">{trip.title}</h3>
        {/* --- 'reveal' class ADDED BACK --- */}
        <p className="experience-card__text reveal">{trip.description}</p>
        <Link
          to={`/excursions/${trip.id}`}
          // --- 'reveal' class ADDED BACK ---
          className="experience-card__link reveal"
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

ExperienceCard.propTypes = {
  trip: PropTypes.shape({
    id: PropTypes.string.isRequired,
    title: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    image: PropTypes.string,
    images: PropTypes.arrayOf(PropTypes.string),
    linkText: PropTypes.string.isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
};

const UniqueExperiences = () => {
  const [sectionRef, isVisible] = useAnimateOnScroll({ threshold: 0.1 });

  return (
    <section
      ref={sectionRef}
      className={`unique-experiences ${isVisible ? "animate" : ""}`}
    >
      {/* 'reveal' class for the global utility */}
      <h2 className="unique-experiences__title reveal">Unique Experiences</h2>
      <div className="unique-experiences__grid reveal">
        {uniqueExperiences.map((trip, index) => (
          <ExperienceCard key={trip.id} trip={trip} index={index} />
        ))}
      </div>
      <div className="unique-experiences__more reveal">
        <Link to="/excursions" className="unique-experiences__more-link">
          <span>View All Experiences</span>
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

export default UniqueExperiences;