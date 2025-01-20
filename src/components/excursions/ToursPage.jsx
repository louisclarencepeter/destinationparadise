// ToursPage.jsx
import React, { useEffect, useState } from "react";
import TourCard from "./TourCard";
import "./ToursPage.scss";
import { tours } from "../../assets/data/tours";

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

export default function ToursPage() {
  const [headerRef, headerEntries] = useIntersectionObserver({
    threshold: 0.1,
  });

  const isHeaderVisible = headerEntries.some((entry) => entry.isIntersecting);
  const [contentRef, contentEntries] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '50px',
  });

  if (!tours || !Array.isArray(tours)) {
    return (
      <div className="tour-page-loading">
        <span className="loading-text">Loading amazing adventures...</span>
      </div>
    );
  }

  return (
    <div className="tours-page">
      <header className="tours-header">
        <h2 
          ref={headerRef}
          className={`title ${isHeaderVisible ? 'visible' : ''}`}
        >
          Discover Zanzibar's Wonders
        </h2>
        <p className="subtitle">Unforgettable trips and tours in paradise</p>
      </header>

      <div className="tour-grid">
        {tours.map((tour) => (
          <div 
            ref={contentRef}
            className={`tour-card-wrapper ${
              contentEntries.some(entry => entry.isIntersecting) ? 'visible' : ''
            }`}
            key={tour.id}
          >
            <TourCard tour={tour} />
          </div>
        ))}
      </div>
    </div>
  );
}