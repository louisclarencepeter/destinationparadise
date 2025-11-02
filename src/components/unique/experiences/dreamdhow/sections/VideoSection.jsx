import PropTypes from "prop-types";
import { useAnimateOnScroll } from "../hooks/useDreamDhowHooks";

/**
 * Video Section Component with Enhanced Animations
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {string} props.videoUrl - YouTube embed URL
 */
const VideoSection = ({ title, videoUrl }) => {
  const [videoRef, isAnimating] = useAnimateOnScroll({ threshold: 0.1 });

  return (
    <div
      ref={videoRef}
      className={`video-section ${isAnimating ? "animate" : ""}`}
    >
      <h2>{title}</h2>
      <div className="video-wrapper">
        <iframe
          src={videoUrl}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        ></iframe>
      </div>
    </div>
  );
};

VideoSection.propTypes = {
  title: PropTypes.string.isRequired,
  videoUrl: PropTypes.string.isRequired,
};

export default VideoSection;