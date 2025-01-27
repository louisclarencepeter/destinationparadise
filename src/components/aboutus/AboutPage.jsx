// AboutPage.jsx
import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import logo from "../../assets/logo/dlp1.png";
import zanzibarmap from "../../assets/map/zanzibar.png";
import "./AboutPage.scss";

const useIntersectionObserver = (options = {}) => {
  const [elements, setElements] = useState([]);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const observer = new IntersectionObserver((observedEntries) => {
      setEntries(observedEntries);
    }, options);

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [elements, options]);

  const ref = (element) => {
    if (element && !elements.includes(element)) {
      setElements((prevElements) => [...prevElements, element]);
    }
  };

  return [ref, entries];
};

const AnimatedText = ({ children, delay = 0, className = '' }) => {
  const [ref, entries] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
  });

  const isVisible = entries.some((entry) => entry.isIntersecting);

  return (
    <div 
      ref={ref}
      className={`animated-text ${className} ${isVisible ? 'visible' : ''}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
};

AnimatedText.propTypes = {
  children: PropTypes.node.isRequired,
  delay: PropTypes.number,
  className: PropTypes.string,
};

const AboutPage = () => {
  const [isLogoLoaded, setIsLogoLoaded] = useState(false);
  const [headerRef, headerEntries] = useIntersectionObserver({ threshold: 0.1 });
  const [mapRef, mapEntries] = useIntersectionObserver({ threshold: 0.1 });

  const isHeaderVisible = headerEntries.some((entry) => entry.isIntersecting);
  const isMapVisible = mapEntries.some(entry => entry.isIntersecting);

  return (
    <div className="about-page">
      <header className="about-header">
        <h2 
          ref={headerRef}
          className={`title ${isHeaderVisible ? 'visible' : ''}`}
        >
          About Us
        </h2>
      </header>

      <div className="logo-container">
        <div className="logo-wrapper">
          <img 
            className={`logo ${isLogoLoaded ? 'loaded' : ''}`}
            src={logo} 
            alt="Destination Paradise Logo" 
            loading="eager"
            onLoad={() => setIsLogoLoaded(true)}
          />
        </div>
      </div>

      <div className="about-content">
        <div className="about-text">
          <h3 className="welcome-title">Welcome to Destination Paradise</h3>
          
          <AnimatedText delay={100}>
            <strong>Destination Paradise</strong>, your premier travel agency
            specializing in unforgettable trips and tours on the enchanting
            island of Zanzibar. Our current focus is on exploring the wonders of
            Zanzibar Island (Unguja), with ambitious plans to expand our
            offerings throughout Tanzania.
          </AnimatedText>

          <AnimatedText delay={200} className="motto">
            for <em>your next trip to paradise...</em>
          </AnimatedText>

          <AnimatedText delay={300}>
            At Destination Paradise, we strive to provide an extensive array of
            tours that showcase the most stunning locations and exciting events
            not only on the main island of Zanzibar but across the entire
            country of Tanzania. Our expertly crafted itineraries are designed
            to immerse you in the rich culture, breathtaking landscapes, and
            thrilling adventures that await you.
          </AnimatedText>

          <AnimatedText delay={400}>
            In addition to our exceptional island tours, we are proud to offer
            exhilarating safari experiences on the Tanzanian mainland. Join us
            on a journey of a lifetime as we guide you through the
            world-renowned Serengeti, Tarangire, and Ngorongoro, where
            you'll witness the awe-inspiring beauty of the African
            wilderness and its incredible wildlife. For those seeking a more
            compact adventure, we also arrange convenient day safaris from
            Zanzibar to the magnificent Selous and Mikumi reserves.
          </AnimatedText>
        </div>
      </div>

      <div 
        ref={mapRef}
        className={`map-container ${isMapVisible ? 'visible' : ''}`}
      >
        <h3 className="map-title">Map of Unguja Zanzibar</h3>
        <img 
          src={zanzibarmap} 
          alt="Zanzibar Map" 
          className="map-image"
          loading="lazy"
        />
      </div>
    </div>
  );
};

export default AboutPage;