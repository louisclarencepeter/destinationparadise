import PropTypes from "prop-types";
import { Link } from "react-router-dom";
import { useAnimateOnScroll } from "../../../hooks/useAnimateOnScroll";
import Slideshow from "../sections/Slideshow";
import ArrowIcon from "./ArrowIcon";
import "./ExperienceCard.scss";

const ExperienceCard = ({ trip, index }) => {
  const [cardRef, isVisible] = useAnimateOnScroll({ threshold: 0.1 });

  const getDestination = (id) => {
    return id === "dream-dhow-cruise" ? "/dream-dhow" : `/excursions/${id}`;
  };

  const destination = getDestination(trip.id);

  return (
    <article
      ref={cardRef}
      className={`experience-card ${isVisible ? "animate" : ""}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="experience-card__media">
        {trip.images ? (
          <Slideshow images={trip.images} title={trip.title} />
        ) : (
          <img
            src={trip.image}
            alt={trip.title}
            className="experience-card__image"
          />
        )}
      </div>

      <div className="experience-card__content">
        <h3 className="experience-card__title reveal">{trip.title}</h3>
        <p className="experience-card__text reveal">{trip.description}</p>
        <Link
          to={destination}
          className="experience-card__link reveal"
          aria-label={`Learn more about ${trip.title}`}
        >
          {trip.linkText}
          <ArrowIcon />
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

export default ExperienceCard;