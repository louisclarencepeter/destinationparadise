// Images.jsx
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import "./Images.scss";

// Constants
const ITEMS_PER_PAGE = 6;

// Gallery Item Component
const GalleryItem = ({ item }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  return (
    <div className="gallery__item">
      {isLoading && <div className="loading-placeholder" />}
      {item.type === "image" ? (
        <img
          src={item.src}
          alt={item.alt}
          className={`gallery-image reveal ${isLoading ? 'hidden' : ''}`}
          loading="lazy"
          onLoad={handleLoad}
          onError={handleError}
        />
      ) : (
        <div className="video-wrapper">
          <iframe
            src={`https://www.youtube.com/embed/${item.videoId}`}
            title={item.alt}
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className={`gallery-video reveal ${isLoading ? 'hidden' : ''}`}
            loading="lazy"
            onLoad={handleLoad}
            onError={handleError}
          />
        </div>
      )}
      {error && (
        <div className="error-message">
          Failed to load {item.type}
        </div>
      )}
    </div>
  );
};

GalleryItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.number.isRequired,
    type: PropTypes.oneOf(['image', 'video']).isRequired,
    src: PropTypes.string,
    videoId: PropTypes.string,
    alt: PropTypes.string.isRequired,
  }).isRequired,
};

// Gallery More Button Component
const GalleryMoreButton = () => (
  <div className="gallery__more">
    <Link to="/gallery" className="gallery__more-link">
      <span>View More</span>
      <svg
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth="1.5"
        stroke="currentColor"
        aria-hidden="true"
        className="gallery__more-icon"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
        />
      </svg>
    </Link>
  </div>
);

// Main Gallery Component
const Images = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadItems = async () => {
      try {
        setIsLoading(true);
        // In a real app, this would be an API call
        const items = [
          { id: 1, type: "image", src: "/galleryimages/1.jpg", alt: "Image 1" },
          { id: 2, type: "video", videoId: "iq-NDeo_33k", alt: "Video 1: Zanzibar Beaches" },
          { id: 3, type: "image", src: "/galleryimages/2.jpg", alt: "Image 2" },
          { id: 4, type: "video", videoId: "qYBauN6rzfI", alt: "Video 2: Zanzibar Culture" },
          { id: 5, type: "image", src: "/galleryimages/3.jpg", alt: "Image 3" },
          { id: 6, type: "video", videoId: "X8UgUg8a0Rc", alt: "Video 3: Exploring Stone Town" },
          { id: 7, type: "image", src: "/galleryimages/4.jpg", alt: "Image 4" },
          { id: 8, type: "video", videoId: "CV1kZngopa4", alt: "Video 4: Zanzibar Shorts" },
          { id: 9, type: "image", src: "/galleryimages/5.jpg", alt: "Image 5" },
          { id: 10, type: "video", videoId: "c22eXs1BzbM", alt: "Video 5: New Zanzibar Tour" },
          { id: 11, type: "image", src: "/galleryimages/6.jpg", alt: "Image 6" },
        ];
        
        setGalleryItems(items);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading gallery items:', error);
        setError('Failed to load gallery items');
        setIsLoading(false);
      }
    };

    loadItems();
  }, []);

  if (isLoading) {
    return <div className="loading-container">Loading gallery...</div>;
  }

  if (error) {
    return <div className="error-container">{error}</div>;
  }

  return (
    <div className="images-gallery">
      <h2 className="gallery__title">Gallery</h2>
      <div className="gallery-grid">
        {galleryItems
          .slice(0, ITEMS_PER_PAGE)
          .map((item) => (
            <GalleryItem key={item.id} item={item} />
          ))}
      </div>
      {galleryItems.length > ITEMS_PER_PAGE && <GalleryMoreButton />}
    </div>
  );
};

export default Images;