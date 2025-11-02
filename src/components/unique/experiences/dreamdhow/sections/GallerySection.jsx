import PropTypes from "prop-types";
import { useAnimateOnScroll } from "../hooks/useDreamDhowHooks";
import ImageGallery from "../components/ImageGallery";

/**
 * Gallery Section Component with Enhanced Animations
 * @param {Object} props
 * @param {string} props.title - Section title
 * @param {Array} props.images - Array of image filenames
 * @param {string} props.basePath - Base path for images
 */
const GallerySection = ({ title, images, basePath }) => {
  const [galleryRef, isAnimating] = useAnimateOnScroll({ threshold: 0.1 });

  return (
    <div
      ref={galleryRef}
      className={`gallery-section stagger-container ${
        isAnimating ? "animate" : ""
      }`}
    >
      <h2>{title}</h2>
      <ImageGallery
        images={images}
        basePath={basePath}
        altText="Dream Dhow gallery"
        className="gallery-grid"
        imageClassName="gallery-image"
        staggerDelay={0.05}
      />
    </div>
  );
};

GallerySection.propTypes = {
  title: PropTypes.string.isRequired,
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  basePath: PropTypes.string.isRequired,
};

export default GallerySection;