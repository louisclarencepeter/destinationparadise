import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";
import "./Images.scss";

const ITEMS_PER_PAGE = 6;

const GalleryItem = ({ item }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  const handleLoad = () => setIsLoading(false);
  const handleError = () => {
    setIsLoading(false);
    setError(true);
  };

  return (
    <div className="gallery__item">
      <div className="media-container">
        {isLoading && <div className="loading-placeholder" />}

        {item.type === "image" ? (
          <img
            src={item.src}
            alt={item.alt}
            className={`gallery-image ${isLoading ? "opacity-0" : "opacity-100"}`}
            onLoad={handleLoad}
            onError={handleError}
            loading="eager"
            style={{ transition: "opacity 0.3s ease-in-out" }}
          />
        ) : (
          <div className="video-wrapper">
            <iframe
              src={`https://www.youtube.com/embed/${item.videoId}?rel=0&modestbranding=1`}
              title={item.alt}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="gallery-video"
              onLoad={handleLoad}
              onError={handleError}
              loading="eager"
            />
            {isLoading && (
              <div className="video-placeholder">
                <div className="loading-spinner"></div>
              </div>
            )}
          </div>
        )}

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
};

const Images = () => {
  const [galleryItems, setGalleryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadItems = async () => {
      try {
        const items = [
          { id: 1, type: "image", src: "/galleryimages/1.jpg", alt: "Image 1" },
          { id: 2, type: "video", videoId: "iq-NDeo_33k", alt: "Safari Blue" },
          { id: 3, type: "image", src: "/galleryimages/2.jpg", alt: "Image 2" },
          { id: 4, type: "video", videoId: "qYBauN6rzfI", alt: "Snorkeling at Mnemba" },
          { id: 5, type: "image", src: "/galleryimages/3.jpg", alt: "Image 3" },
          { id: 6, type: "video", videoId: "X8UgUg8a0Rc", alt: "Exploring Stone Town" },
        ];
        setGalleryItems(items);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading gallery items:", error);
        setError("Failed to load gallery items");
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
        {galleryItems.slice(0, ITEMS_PER_PAGE).map((item) => (
          <GalleryItem key={item.id} item={item} />
        ))}
      </div>

      {/* Always show the 'View More' button */}
      <div className="gallery__more">
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
