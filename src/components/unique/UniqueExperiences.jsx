import { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import "./UniqueExperiences.scss";
import uniqueExperiences from "../../assets/data/uniqueData.js";

const Slideshow = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000); // Change image every 3 seconds

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="experience-card__slideshow">
      {images.map((img, idx) => (
        <img
          key={idx}
          src={img}
          alt={`${title} - ${idx + 1}`}
          className={`slideshow__image ${
            idx === currentIndex ? "active" : ""
          }`}
        />
      ))}
      <div className="slideshow__dots">
        {images.map((_, idx) => (
          <span
            key={idx}
            className={`dot ${idx === currentIndex ? "active" : ""}`}
            onClick={() => setCurrentIndex(idx)}
          />
        ))}
      </div>
    </div>
  );
};

const ExperienceCard = ({ trip, index }) => {
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

    if (card) observer.observe(card);
    return () => card && observer.unobserve(card);
  }, []);

  return (
    <article
      ref={cardRef}
      className={`experience-card ${isVisible ? "animate" : ""}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Slideshow for Dream Dhow (has 'images' array) */}
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
        <h3 className="experience-card__title reveal">{trip.title}</h3>
        <p className="experience-card__text reveal">{trip.description}</p>
        <Link
          to={`/excursions/${trip.id}`}
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

    if (section) observer.observe(section);
    return () => section && observer.unobserve(section);
  }, []);

  return (
    <section ref={sectionRef} className="unique-experiences">
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