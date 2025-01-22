import React from 'react';
import PropTypes from 'prop-types';
import Slider from 'react-slick';
import { AlertTriangle } from 'lucide-react';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './ImageSlideshow.scss';

const ImageSlideshow = ({ 
  images, 
  autoplaySpeed = 3000, 
  autoplay = true 
}) => {
  // Slider settings
  const settings = {
    dots: false,
    arrows: false,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: autoplay,
    autoplaySpeed: autoplaySpeed,
    fade: true,
    pauseOnHover: false,
    draggable: false,
    swipe: false,
    touchMove: false
  };

  return (
    <div className="slideshow-container">
      <Slider {...settings}>
        {images?.map((imageUrl, index) => (
          <div key={index} className="slide">
            {imageUrl ? (
              <img 
                src={imageUrl} 
                alt={`Slide ${index + 1}`}
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  console.error(`Failed to load image: ${imageUrl}`);
                }}
              />
            ) : (
              <div className="error-state">
                <AlertTriangle className="error-icon" />
                <p>Image not available</p>
              </div>
            )}
          </div>
        ))}
      </Slider>
    </div>
  );
};

ImageSlideshow.propTypes = {
  images: PropTypes.arrayOf(PropTypes.string).isRequired,
  autoplaySpeed: PropTypes.number,
  autoplay: PropTypes.bool
};

export default ImageSlideshow;