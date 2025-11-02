import PropTypes from "prop-types";
import { useAnimateOnScroll } from "../hooks/useDreamDhowHooks";
import TourCard from "../components/TourCard";

/**
 * Tour Packages Section Component with Enhanced Animations
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {Array} props.tours - Array of tour objects
 */
const TourPackagesSection = ({ title, tours }) => {
  const [toursRef, isAnimating] = useAnimateOnScroll({ threshold: 0.1 });

  return (
    <div
      ref={toursRef}
      className={`tour-products-section stagger-container ${
        isAnimating ? "animate" : ""
      }`}
    >
      <h2>{title}</h2>
      <div className="tour-cards">
        {tours.map((tour, index) => (
          <TourCard
            key={index}
            title={tour.title}
            icon={tour.icon}
            images={tour.images}
            departure={tour.departure}
            activities={tour.activities}
            food={tour.food}
            pricing={tour.pricing}
            kids={tour.kids}
            ctaText={tour.ctaText}
            ctaLink={tour.ctaLink}
            delay={0.1 * (index + 1)}
          />
        ))}
      </div>
    </div>
  );
};

TourPackagesSection.propTypes = {
  title: PropTypes.string.isRequired,
  tours: PropTypes.arrayOf(
    PropTypes.shape({
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
    })
  ).isRequired,
};

export default TourPackagesSection;