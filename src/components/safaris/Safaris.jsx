import React, { useRef, useEffect, useState } from "react";
import SafariTitle from "./components/common/SafariTitle";
import SafariDescription from "./components/safarisinfo/SafariDescription";
import SafariPackages from "./components/packages/SafariPackages";
import SafariList from "./components/list/SafariList";
import SafariButton from "./components/common/SafariButton";
import "./Safaris.scss";

const Safaris = () => {
  const headerRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (headerRef.current) {
      observer.observe(headerRef.current);
    }

    return () => {
      if (headerRef.current) {
        observer.unobserve(headerRef.current);
      }
    };
  }, []);

  return (
    <div className="safaris-container">
      <SafariTitle ref={headerRef} isVisible={isVisible} />
      <SafariDescription
        text="Tanzania is one of the best safari destinations in the world, offering a variety of incredible wildlife experiences. From the vast plains of the Serengeti to the lush landscapes of Ngorongoro Crater, here are some of the top safaris a person can take in Tanzania:"
      />
      <SafariList />
      <SafariPackages />
      <SafariDescription
        text={
          <>
            <strong>Types of Safari Experiences in Tanzania</strong>
            <ul>
              <li><strong>Game Drive Safaris</strong> – Traditional safaris in 4x4 vehicles with expert guides.</li>
              <li><strong>Walking Safaris</strong> – Explore the wilderness on foot with an armed ranger for a more immersive experience.</li>
              <li><strong>Hot Air Balloon Safaris</strong> – A breathtaking way to see the Serengeti from above, especially during the Great Migration.</li>
              <li><strong>Boat Safaris</strong> – Available in places like Selous and Saadani, offering a different perspective of wildlife.</li>
              <li><strong>Chimpanzee Trekking</strong> – Unique primate encounters in Mahale Mountains and Gombe Stream.</li>
            </ul>
            Tanzania offers an incredible variety of safari experiences, catering to different interests and budgets. Whether you want a luxurious lodge safari or a rugged adventure in the wild, there’s something for everyone in this stunning East African destination.
          </>
        }
      />
      {/* Update this line */}
      <SafariButton text="Book Now" to="/book-now" />
    </div>
  );
};

export default Safaris;