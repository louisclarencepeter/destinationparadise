// AboutPage.jsx
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { Header } from './components/Header';
import { Logo } from './components/Logo';
import { ContentSection } from './components/ContentSection';
import MapComponent from './components/Map.jsx';
import "./AboutPage.scss";
import SEO from '../SEO.jsx';

const AboutPage = () => {
  const [headerRef, headerEntries] = useIntersectionObserver({ threshold: 0.1 });
  const [mapRef, mapEntries] = useIntersectionObserver({ threshold: 0.1 });

  const isHeaderVisible = headerEntries.some((entry) => entry.isIntersecting);
  const isMapVisible = mapEntries.some(entry => entry.isIntersecting);

  return (
    <div className="about-page">
      <SEO
        title="About Us | Destination Paradise Zanzibar"
        description="Learn about Destination Paradise Zanzibar and our passion for creating unforgettable experiences."/>
      <Header isVisible={isHeaderVisible} headerRef={headerRef} />
      <Logo />
      <ContentSection />
      <MapComponent isVisible={isMapVisible} mapRef={mapRef} />
    </div>
  );
};

export default AboutPage;