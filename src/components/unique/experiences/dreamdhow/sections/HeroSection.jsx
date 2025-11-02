import PropTypes from "prop-types";
import { useAnimateOnScroll } from "../hooks/useDreamDhowHooks";

/**
 * Hero Section Component with Enhanced Animations
 * @param {Object} props
 * @param {string} props.title - Main title
 * @param {string} props.slogan - Slogan text (can include HTML)
 */
const HeroSection = ({ title, slogan }) => {
  const [heroRef, isAnimating] = useAnimateOnScroll({ threshold: 0.1 });

  return (
    <div
      ref={heroRef}
      className={`hero-section ${isAnimating ? "animate" : ""}`}
    >
      <h1 className="title-script">{title}</h1>
      <p className="slogan" dangerouslySetInnerHTML={{ __html: slogan }} />
    </div>
  );
};

HeroSection.propTypes = {
  title: PropTypes.string.isRequired,
  slogan: PropTypes.string.isRequired,
};

export default HeroSection;