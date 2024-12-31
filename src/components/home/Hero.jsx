import './Hero.scss';
import backgroundVideoH from '../../assets/videos/background_h.mp4';
import backgroundVideoV from '../../assets/videos/background_v.mp4';
import placeholderImage from '../../assets/images/boat.jpg';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const Hero = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleVideoLoad = () => setVideoLoaded(true);

    const videoElement = document.querySelector('.hero__video');
    if (videoElement) {
      videoElement.addEventListener('loadeddata', handleVideoLoad);
    }

    const debounce = (func, delay) => {
      let timeoutId;
      return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func(...args), delay);
      };
    };

    const handleResize = debounce(() => {
      setIsMobile(window.innerWidth < 768);
    }, 200);

    window.addEventListener('resize', handleResize);

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('loadeddata', handleVideoLoad);
      }
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <section className="hero">
      <BackgroundVideo videoLoaded={videoLoaded} isMobile={isMobile} />
      <HeroContent />
    </section>
  );
};

const BackgroundVideo = ({ videoLoaded, isMobile }) => (
  <div className="hero__background">
    {!videoLoaded && (
      <img
        src={placeholderImage}
        alt="Placeholder"
        className="hero__placeholder"
      />
    )}
    <video
      autoPlay
      loop
      muted
      playsInline
      className={`hero__video ${videoLoaded ? 'visible' : 'hidden'}`}
    >
      <source src={isMobile ? backgroundVideoH : backgroundVideoV} type="video/mp4" />
    </video>
  </div>
);

BackgroundVideo.propTypes = {
  videoLoaded: PropTypes.bool.isRequired,
  isMobile: PropTypes.bool.isRequired,
};

const HeroContent = () => (
  <div className="hero__content">
    <HeroHeading />
    <HeroDescription />
  </div>
);

const HeroHeading = () => (
  <div className="hero__heading">
    <h1>Destination Paradise</h1>
    <h2 className="motto">
      <i>Your next trip to Paradise..</i>
    </h2>
  </div>
);


const HeroDescription = () => (
  <p className="hero__description">
    Welcome to your gateway to the enchanting Zanzibar Island! Imagine a place
    where each day is an adventure, and every horizon promises new discoveries.
  </p>
);

export default Hero;
