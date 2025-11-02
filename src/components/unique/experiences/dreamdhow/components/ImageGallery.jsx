import PropTypes from "prop-types";

/**
 * Reusable Image Gallery Component
 * @param {Object} props
 * @param {Array} props.images - Array of image filenames
 * @param {string} props.basePath - Base path for images
 * @param {string} props.altText - Alt text for images
 * @param {string} props.className - Container CSS class
 * @param {string} props.imageClassName - Image CSS class
 * @param {number} props.staggerDelay - Delay multiplier for stagger animation
 */
const ImageGallery = ({
  images,
  basePath,
  altText = "Gallery image",
  className = "gallery-grid",
  imageClassName = "gallery-image",
  staggerDelay = 0.05,
}) => {
  return (
    <div className={className}>
      {images.map((filename, index) => (
        <img
          key={index}
          src={`${basePath}/${filename}`}
          alt={`${altText} ${index + 1}`}
          className={`${imageClassName} stagger-item`}
          style={{ animationDelay: `${index * staggerDelay}s` }}
        />
      ))}
    </div>
  );
};

ImageGallery.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  basePath: PropTypes.string.isRequired,
  altText: PropTypes.string,
  className: PropTypes.string,
  imageClassName: PropTypes.string,
  staggerDelay: PropTypes.number,
};

export default ImageGallery;