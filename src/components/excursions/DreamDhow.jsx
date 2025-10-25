// src/components/excursions/DreamDhow.jsx
import { useEffect } from "react";
import { revealElements } from "../../utils/revealElements.js";
import useScrollToTop from "../../utils/scrollToTop.js";
import "../../styles/pages/_DreamDhow.scss";

const DreamDhow = () => {
  useScrollToTop();

  useEffect(() => {
    window.addEventListener("scroll", revealElements);
    revealElements();
    return () => window.removeEventListener("scroll", revealElements);
  }, []);

  const galleryImages = [
    "DJI_20250915124414_0001_D.jpg",
    "DJI_20250915124543_0003_D.jpg",
    "DJI_20250915124633_0008_D.jpg",
    "DJI_20250915124638_0009_D.jpg",
    "DJI_20250915170806_0003_D.jpg",
    "DJI_20250915170921_0008_D.jpg",
    "DJI_20250915170937_0009_D.jpg",
    "DJI_20250915171037_0011_D.jpg",
    "DJI_20250915171311_0018_D.jpg",
    "DJI_20250915191226_0022_D.jpg",
    "DJI_20250915191246_0026_D.jpg",
    "DJI_20250915191436_0032_D.jpg",
    "DJI_20250915192140_0043_D.jpg",
    "DJI_20250915192450_0049_D.jpg",
    "DJI_20250915192525_0051_D.jpg",
    "DJI_20250915194507_0075_D.jpg",
    "IMG_20250916_041952_456.jpg",
    "Snapshot_202509259_040901.jpg",
    "Snapshot_202509259_040902.jpg",
    "Snapshot_202509259_040909 2.jpg"
  ];

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

      <div className="gallery-section reveal">
        <h2>Gallery</h2>
        <div className="gallery-grid">
          {galleryImages.map((file, i) => (
            <img
              key={i}
              src={`/dreamdhow/${file}`}
              alt={`Dream Dhow ${i + 1}`}
              className="gallery-image"
              loading="lazy"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DreamDhow;