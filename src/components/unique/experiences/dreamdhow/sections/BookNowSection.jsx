import PropTypes from "prop-types";
import { useAnimateOnScroll } from "../hooks/useDreamDhowHooks";
import CTAButton from "../components/CTAButton";

/**
 * Book Now Section Component with Enhanced Animations
 * @param {Object} props
 * @param {string} props.ctaText - CTA button text
 * @param {string} props.ctaLink - CTA button link
 */
const BookNowSection = ({ ctaText, ctaLink }) => {
  const [bookNowRef, isAnimating] = useAnimateOnScroll({ threshold: 0.1 });

  return (
    <div
      ref={bookNowRef}
      className={`book-now-section scale-in ${isAnimating ? "animate" : ""}`}
    >
      <CTAButton 
        href={ctaLink}
        state={{
          fromDreamDhow: true,
        }}
      >
        {ctaText}
      </CTAButton>
    </div>
  );
};

BookNowSection.propTypes = {
  ctaText: PropTypes.string.isRequired,
  ctaLink: PropTypes.string.isRequired,
};

export default BookNowSection;