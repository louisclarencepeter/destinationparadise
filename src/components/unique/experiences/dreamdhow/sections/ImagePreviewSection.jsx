import PropTypes from "prop-types";
import { useAnimateOnScroll } from "../hooks/useDreamDhowHooks";
import ImageGallery from "../components/ImageGallery";

/**
 * Image Preview Section Component with Enhanced Animations
 * @param {Object} props
 * @param {Array} props.images - Array of image filenames (first 4 will be shown)
 * @param {string} props.basePath - Base path for images
 */
const ImagePreviewSection = ({ images, basePath }) => {
  const [previewRef, isAnimating] = useAnimateOnScroll({ threshold: 0.1 });

  return (
    <div
      ref={previewRef}
      className={`image-preview stagger-container ${
        isAnimating ? "animate" : ""
      }`}
    >
      <ImageGallery
        images={images.slice(0, 4)}
        basePath={basePath}
        altText="Dream Dhow preview"
        imageClassName="preview-image"
        staggerDelay={0.1}
      />
    </div>
  );
};

ImagePreviewSection.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  basePath: PropTypes.string.isRequired,
};

export default ImagePreviewSection;