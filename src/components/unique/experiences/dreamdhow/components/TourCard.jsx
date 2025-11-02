import { useRef } from "react";
import PropTypes from "prop-types";
import { useCardSlideshow } from "../hooks/useDreamDhowHooks";
import CTAButton from "./CTAButton";

/**
 * Tour Card Component with auto-slideshow
 * @param {Object} props
 * @param {string} props.title - Tour title
 * @param {string} props.icon - FontAwesome icon class
 * @param {Array} props.images - Array of image paths
 * @param {string} props.departure - Departure information
 * @param {string} props.activities - Activities description
 * @param {string} props.food - Food information
 * @param {string} props.pricing - Pricing details
 * @param {string} props.kids - Kids pricing
 * @param {string} props.ctaText - CTA button text
 * @param {string} props.ctaLink - CTA button link
 * @param {number} props.delay - Animation delay in seconds
 */
const TourCard = ({
  title,
  icon,
  images,
  departure,
  activities,
  food,
  pricing,
  kids,
  ctaText,
  ctaLink,
  delay = 0,
}) => {
  const cardRef = useRef(null);
  const currentImage = useCardSlideshow(cardRef, images, 10000);

  return (
    <div
      className="tour-card stagger-item"
      ref={cardRef}
      style={{ animationDelay: `${delay}s` }}
    >
      <img
        key={currentImage}
        src={`/dreamdhow/${currentImage}`}
        alt={title}
        className="tour-card-image"
      />
      <h3>
        <i className={icon}></i> {title}
      </h3>
      <p>
        <strong>Departure:</strong> {departure}
      </p>
      <p>
        <strong>Activities:</strong> {activities}
      </p>
      <p>
        <strong>Food:</strong> {food}
      </p>
      <p dangerouslySetInnerHTML={{ __html: pricing }} />
      <p>
        <strong>Kids:</strong> {kids}
      </p>
      <CTAButton href={ctaLink}>{ctaText}</CTAButton>
    </div>
  );
};

TourCard.propTypes = {
  title: PropTypes.string.isRequired,
  icon: PropTypes.string.isRequired,
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  departure: PropTypes.string.isRequired,
  activities: PropTypes.string.isRequired,
  food: PropTypes.string.isRequired,
  pricing: PropTypes.string.isRequired,
  kids: PropTypes.string.isRequired,
  ctaText: PropTypes.string.isRequired,
  ctaLink: PropTypes.string.isRequired,
  delay: PropTypes.number,
};

export default TourCard;