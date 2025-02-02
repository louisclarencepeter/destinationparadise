import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import "./Images.scss";

const ITEMS_PER_PAGE = 6;

const GALLERY_ITEMS = [
  { id: 1, type: "image", src: "/galleryimages/1.jpg", alt: "Image 1" },
  { id: 2, type: "video", videoId: "iq-NDeo_33k", alt: "Safari Blue" },
  { id: 3, type: "image", src: "/galleryimages/2.jpg", alt: "Image 2" },
  { id: 4, type: "video", videoId: "qYBauN6rzfI", alt: "Snorkeling at Mnemba" },
  { id: 5, type: "image", src: "/galleryimages/3.jpg", alt: "Image 3" },
  { id: 6, type: "video", videoId: "X8UgUg8a0Rc", alt: "Exploring Stone Town" },
];

/**
 * Custom hook that uses the Intersection Observer API to determine
 * if an element is in view.
 *
 * @param {Object} options - IntersectionObserver options.
 * @returns {[React.RefObject, boolean]} A tuple with a ref and a boolean indicating visibility.
 */
const useInView = (options = {}) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setInView(true);
        observer.unobserve(entry.target);
      }
    }, options);

    observer.observe(element);

    return () => {
      if (element) observer.unobserve(element);
    };
  }, [options]);

  return [ref, inView];
};

const GalleryItem = ({ item, index }) => {
  // Use the custom hook to check if this gallery item is in view.
  const [itemRef, isVisible] = useInView({ threshold: 0.1 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => setIsLoading(false);
  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  const renderMedia = () => {
    if (item.type === "image") {
      return (
        <img
          src={item.src}
          alt={item.alt}
          className={`gallery-image ${isLoading ? "opacity-0" : "opacity-100"} reveal`}
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy" // Use lazy loading for better performance
          style={{
            transition: "opacity 0.3s ease-in-out",
            animationDelay: `${index * 0.1}s`,
          }}
        />
      );
    }

    return (
      <div className="video-wrapper">
        <iframe
          src={`https://www.youtube.com/embed/${item.videoId}?rel=0&modestbranding=1`}
          title={item.alt}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="gallery-video reveal"
          onLoad={handleLoad}
          onError={handleError}
          loading="lazy"
          style={{ animationDelay: `${index * 0.1}s` }}
        />
        {isLoading && (
          <div className="video-placeholder">
            <div className="loading-spinner"></div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div
      ref={itemRef}
      className={`gallery__item ${isVisible ? "animate" : ""}`}
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      <div className="media-container">
        {isLoading && <div className="loading-placeholder" />}
        {renderMedia()}
        {error && (
          <div className="error-message">
            Failed to load {item.type}
          </div>
        )}
      </div>
    </div>
  );
};

GalleryItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    type: PropTypes.oneOf(["image", "video"]).isRequired,
    src: PropTypes.string,
    videoId: PropTypes.string,
    alt: PropTypes.string.isRequired,
  }).isRequired,
  index: PropTypes.number.isRequired,
};

const Images = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  // Use the custom hook for the overall gallery section.
  const [sectionRef, sectionInView] = useInView({ threshold: 0.1 });

  useEffect(() => {
    const loadGalleryItems = async () => {
      try {
        // Simulate async data loading (replace with real fetch if needed)
        setGalleryItems(GALLERY_ITEMS);
        setIsLoading(false);
      } catch (err) {
        console.error("Error loading gallery items:", err);
        setError("Failed to load gallery items");
        setIsLoading(false);
      }
    };

    loadGalleryItems();
  }, []);

  if (isLoading) {
    return <div className="loading-container">Loading gallery...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div
      ref={sectionRef}
      className={`images-gallery ${sectionInView ? "animate" : ""}`}
    >
      <h2 className="gallery__title reveal">Gallery</h2>
      <div className="gallery-grid">
        {galleryItems.slice(0, ITEMS_PER_PAGE).map((item, index) => (
          <GalleryItem key={item.id} item={item} index={index} />
        ))}
      </div>
      <div className="gallery__more reveal">
        <Link to="/gallery" className="gallery__more-link">
          <span>View More</span>
          <svg
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
            />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default Images;
