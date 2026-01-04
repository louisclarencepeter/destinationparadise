// Safaris.jsx
import React, { useRef, useEffect, useState } from "react";
import SafariTitle from "./components/common/SafariTitle";
import SafariDescription from "./components/safarisinfo/SafariDescription";
import SafariPackages from "./components/packages/SafariPackages";
import SafariList from "./components/list/SafariList";
import SafariButton from "./components/common/SafariButton";
import SafariFooter from "./components/common/SafariFooter";
import "./Safaris.scss";

const Safaris = () => {
  const headerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // clean, one-shot animation
        }
      },
      { threshold: 0.1 }
    );

    if (headerRef.current) observer.observe(headerRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="safaris-container">
      <SafariTitle ref={headerRef} isVisible={isVisible} />

      <SafariDescription
        text="Tanzania is one of the best safari destinations in the world, offering a variety of incredible wildlife experiences. From the vast plains of the Serengeti to the lush landscapes of Ngorongoro Crater, here are some of the top safaris you can experience in Tanzania."
      />

      <SafariList />

      <SafariPackages />

      <SafariDescription
        text={
          <>
            <strong>Types of Safari Experiences in Tanzania</strong>
            <ul>
              <li>
                <strong>Game Drive Safaris</strong> – Classic 4x4 safaris led by expert guides.
              </li>
              <li>
                <strong>Walking Safaris</strong> – On-foot exploration with an armed ranger for maximum immersion.
              </li>
              <li>
                <strong>Hot Air Balloon Safaris</strong> – Aerial views of the Serengeti, especially during the Great Migration.
              </li>
              <li>
                <strong>Boat Safaris</strong> – Unique wildlife encounters in Selous and Saadani.
              </li>
              <li>
                <strong>Chimpanzee Trekking</strong> – Rare primate experiences in Mahale Mountains and Gombe Stream.
              </li>
            </ul>
            Tanzania offers safari experiences for every traveler — from ultra-luxury lodges to raw, off-grid adventures.
          </>
        }
      />

      <SafariButton text="Book Now" />

      <SafariFooter />
    </div>
  );
};

export default Safaris;