// ToursPage.jsx
import React, { useEffect } from 'react';
import TourCard from './TourCard';
import './ToursPage.scss';
import { tours } from '../../assets/data/tours';

export default function ToursPage() {
  // Scroll Reveal Logic
  useEffect(() => {
    const reveal = () => {
      const reveals = document.querySelectorAll('.reveal');
      const windowHeight = window.innerHeight;
      const elementVisible = 150;

      reveals.forEach((element) => {
        const elementTop = element.getBoundingClientRect().top;
        if (elementTop < windowHeight - elementVisible) {
          element.classList.add('active');
        } else {
          element.classList.remove('active');
        }
      });
    };

    // Add the event listener and trigger the function on mount
    window.addEventListener('scroll', reveal);
    reveal();

    // Cleanup: remove the event listener on unmount
    return () => {
      window.removeEventListener('scroll', reveal);
    };
  }, []);

  // Safeguard if "tours" might be undefined or an unexpected type
  if (!tours || !Array.isArray(tours)) {
    return <div className="tour-page-loading">Loading tours...</div>;
  }

  return (
    <div className="tour-page-container">
      <h2>Trips and Tours in Zanzibar</h2>
      <div className="tour-grid">
        {tours.map((tour) => (
          // The .reveal class is essential for the scroll reveal effect
          <div className="tour-card-wrapper reveal" key={tour.id}>
            <TourCard tour={tour} />
          </div>
        ))}
      </div>
    </div>
  );
}
