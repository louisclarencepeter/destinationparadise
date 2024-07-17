import './Hero.scss';
import backgroundVideo from '../../assets/videos/background.mp4';
import placeholderImage from '../../assets/images/boat.jpg';
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';

const Hero = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);

  useEffect(() => {
    const handleVideoLoad = () => {
      setVideoLoaded(true);
    };

    const videoElement = document.querySelector('.hero__video');
    if (videoElement) {
      videoElement.addEventListener('loadeddata', handleVideoLoad);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('loadeddata', handleVideoLoad);
      }
    };
  }, []);

  return (
    <section className="hero">
      <BackgroundVideo videoLoaded={videoLoaded} />
      <HeroContent />
    </section>
  );
};

const BackgroundVideo = ({ videoLoaded }) => (
  <div className="hero__background">
    {!videoLoaded && <img src={placeholderImage} alt="Placeholder" className="hero__placeholder" />}
    <video autoPlay loop muted playsInline className={`hero__video ${videoLoaded ? 'visible' : 'hidden'}`}>
      <source src={backgroundVideo} type="video/mp4" />
    </video>
  </div>
);

BackgroundVideo.propTypes = {
  videoLoaded: PropTypes.bool.isRequired,
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
    <h3><i>Your next trip to Paradise..</i></h3>
  </div>
);

const HeroDescription = () => (
  <p className="hero__description">
    Welcome to your gateway to the enchanting Zanzibar Island! Imagine a place where each day is an adventure, and every horizon promises new discoveries.
  </p>
);

export default Hero;
