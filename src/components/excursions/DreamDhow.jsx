// src/components/excursions/DreamDhow.jsx
import { useEffect } from "react";
import { revealElements } from "../../utils/revealElements";
import { useScrollToTop } from "../../utils/useScrollToTop";
import "../../styles/pages/_DreamDhow.scss";

const DreamDhow = () => {
  useScrollToTop();

  useEffect(() => {
    window.addEventListener("scroll", revealElements);
    revealElements();
    return () => window.removeEventListener("scroll", revealElements);
  }, []);

  return (
    <section className="dream-dhow-page">
      <div className="hero-section reveal">
        <h1 className="title-script">Dream Dhow Zanzibar</h1>
        <p className="slogan">
          Sail into Paradise, feel the ocean breeze,
          <br />
          and make your Zanzibar story one to remember.
        </p>
        <a href="/contact" className="cta-button">
          Book Now
        </a>
      </div>

      <div className="content-section reveal">
        <p>
          Experience the magic of Zanzibar’s coastline aboard a traditional
          dhow. Choose a romantic sunset cruise or a group sail filled with
          laughter and views.
        </p>
        <p>
          Dream Dhow is more than a boat — it's your gateway to memories on the
          ocean.
        </p>
      </div>
    </section>
  );
};

export default DreamDhow;