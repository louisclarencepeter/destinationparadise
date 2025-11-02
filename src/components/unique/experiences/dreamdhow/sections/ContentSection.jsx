import PropTypes from "prop-types";
import { useAnimateOnScroll } from "../hooks/useDreamDhowHooks";

/**
 * Content Section Component with Enhanced Animations
 * @param {Object} props
 * @param {string} props.content - Content text (can include HTML)
 */
const ContentSection = ({ content }) => {
  const [contentRef, isAnimating] = useAnimateOnScroll({ threshold: 0.1 });

  return (
    <div
      ref={contentRef}
      className={`content-section ${isAnimating ? "animate" : ""}`}
    >
      <p dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
};

ContentSection.propTypes = {
  content: PropTypes.string.isRequired,
};

export default ContentSection;