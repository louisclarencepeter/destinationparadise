// AboutPage.jsx
import { useIntersectionObserver } from '../../hooks/useIntersectionObserver';
import { Header } from './components/Header';
import { Logo } from './components/Logo';
import { ContentSection } from './components/ContentSection';
import { Map } from './components/Map';
import "./AboutPage.scss";

const AboutPage = () => {
  const [headerRef, headerEntries] = useIntersectionObserver({ threshold: 0.1 });
  const [mapRef, mapEntries] = useIntersectionObserver({ threshold: 0.1 });

  const isHeaderVisible = headerEntries.some((entry) => entry.isIntersecting);
  const isMapVisible = mapEntries.some(entry => entry.isIntersecting);

  return (
    <div className="about-page">
      <Header isVisible={isHeaderVisible} headerRef={headerRef} />
      <Logo />
      <ContentSection />
      <Map isVisible={isMapVisible} mapRef={mapRef} />
    </div>
  );
};

export default AboutPage;