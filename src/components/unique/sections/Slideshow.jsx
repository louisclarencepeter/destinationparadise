import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import "./Slideshow.scss";

const Slideshow = ({ images, title }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [images.length]);

  const handleDotClick = (idx) => {
    setCurrentIndex(idx);
  };

  return (
    <div className="slideshow">
      {images.map((img, idx) => (
        <img
          key={`${title}-img-${idx}`}
          src={img}
          alt={`${title} - ${idx + 1}`}
          className={`slideshow__image ${idx === currentIndex ? "active" : ""}`}
        />
      ))}
      <div className="slideshow__dots">
        {images.map((_, idx) => (
          <button
            key={`${title}-dot-${idx}`}
            type="button"
            className={`slideshow__dot ${idx === currentIndex ? "active" : ""}`}
            onClick={() => handleDotClick(idx)}
            aria-label={`Go to image ${idx + 1}`}
            aria-current={idx === currentIndex ? "true" : "false"}
          />
        ))}
      </div>
    </div>
  );
};

Slideshow.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  title: PropTypes.string.isRequired,
};

export default Slideshow;