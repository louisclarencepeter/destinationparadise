import './Hero.scss';
import backgroundVideoH from '../../assets/videos/background_h.mp4';
import backgroundVideoV from '../../assets/videos/background_v.mp4';
import { useEffect, useState } from 'react';

const Hero = () => {
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleVideoLoad = () => setVideoLoaded(true);
    const videoElement = document.querySelector('.hero__video');

    if (videoElement) {
      videoElement.addEventListener('loadeddata', handleVideoLoad);
    }

    const handleResize = () => setIsMobile(window.innerWidth < 768);
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
      <div className="hero__background">
        <img
          src="/images/boat.jpg" // Direct URL path from public
          alt="Placeholder"
          className="hero__placeholder"
          style={{ display: videoLoaded ? 'none' : 'block' }}
        />
        <video
          autoPlay
          loop
          muted
          playsInline
          className={`hero__video ${videoLoaded ? 'visible' : ''}`}
        >
          <source src={isMobile ? backgroundVideoH : backgroundVideoV} type="video/mp4" />
        </video>
      </div>
      <div className="hero__content">
        <HeroHeading />
        <HeroDescription />
      </div>
    </section>
  );
};

const HeroHeading = () => (
  <div className="hero__heading">
    <h1>Destination Paradise</h1>
    <h2 className="motto">
      <i>your next trip to Paradise...</i>
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