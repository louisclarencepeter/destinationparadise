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

  const originalImages = [
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
    "Snapshot_202509259_040909 2.jpg",
  ];

  const shuffleArray = (array) => [...array].sort(() => Math.random() - 0.5);
  const galleryImages = shuffleArray(originalImages);
  const previewImages = galleryImages.slice(0, 4);
  const remainingImages = galleryImages.slice(4);

  return (
    <section className="dream-dhow-page">
      <div className="hero-section reveal">
        <h1 className="title-script">Dream Dhow Zanzibar</h1>
        <p className="slogan">
          Sail into Paradise, feel the ocean breeze, <br />
          and make your Zanzibar story one to remember.
        </p>
      </div>

      <div className="image-preview reveal">
        {previewImages.map((file, i) => (
          <img
            key={i}
            src={`/dreamdhow/${file}`}
            alt={`Preview ${i + 1}`}
            className="preview-image"
            loading="lazy"
          />
        ))}
      </div>

      <div className="content-section reveal">
        <p>
          Experience the magic of Zanzibar’s coastline aboard a traditional
          dhow. Choose a romantic sunset cruise or a group sail filled with
          laughter and panoramic views.
        </p>
        <p>
          Our Dream Dhow sails through crystal-clear waters, surrounded by
          tropical marine life and guided by our warm local crew. Perfect for
          couples, families, and small groups looking for something memorable.
        </p>
        <p>
          Enjoy onboard refreshments, music, snorkeling stops, and the golden
          glow of a Zanzibar sunset. This is more than a tour — it’s a story
          you’ll tell forever.
        </p>
      </div>

      <div className="book-now-section reveal">
        <a href="/contact" className="cta-button">
          Book Your Dhow Experience Now
        </a>
      </div>

      <div className="tour-products-section reveal">
        <h2>Our Tour Packages</h2>

        <div className="tour-cards">
          <div className="tour-card">
            <h3>🌊 Mnemba Island (Best Seller)</h3>
            <p>
              <strong>Departure:</strong> 9:00 AM from Kendwa Beach
            </p>
            <p>
              <strong>Activities:</strong> Dolphin spotting, snorkeling,
              sandbank/lagoon, sunset sail
            </p>
            <p>
              <strong>Food:</strong> Seafood lunch + fruits, snacks & drinks
            </p>
            <p>
              <strong>Private boat:</strong> from $185 to $110 p.p. ·{" "}
              <strong>Shared:</strong> $95/person
            </p>
            <p>
              <strong>Kids:</strong> 0–4 free · 5–10 years $50
            </p>
            <a href="/contact" className="cta-button">
              Book Mnemba Island
            </a>
          </div>

          <div className="tour-card">
            <h3>🐢 Tumbatu Island</h3>
            <p>
              <strong>Departure:</strong> 9:00 AM from Kendwa Beach
            </p>
            <p>
              <strong>Activities:</strong> Snorkeling (turtles!), beach walk,
              sunset sail
            </p>
            <p>
              <strong>Food:</strong> Seafood lunch + fruits & soft drinks
            </p>
            <p>
              <strong>Private boat:</strong> from $185 to $110 p.p. ·{" "}
              <strong>Shared:</strong> $95/person
            </p>
            <p>
              <strong>Kids:</strong> 0–4 free · 5–10 years $50
            </p>
            <a href="/contact" className="cta-button">
              Book Tumbatu Island
            </a>
          </div>

          <div className="tour-card">
            <h3>🌅 Romantic Sunset Cruise</h3>
            <p>
              <strong>Departure:</strong> 5:00 PM from Nungwi & Kendwa
            </p>
            <p>
              <strong>Activities:</strong> Sunset sailing, romantic vibes,
              dinner onboard
            </p>
            <p>
              <strong>Dinner:</strong> $110 → $90 p.p. ·{" "}
              <strong>Snacks:</strong> $90 → $70 p.p.
            </p>
            <p>
              <strong>Kids:</strong> 0–4 free · 5–10 years $50
            </p>
            <a href="/contact" className="cta-button">
              Book Sunset Cruise
            </a>
          </div>
        </div>
      </div>

      <div className="gallery-section reveal">
        <h2>Gallery</h2>
        <div className="gallery-grid">
          {remainingImages.map((file, i) => (
            <img
              key={i}
              src={`/dreamdhow/${file}`}
              alt={`Dream Dhow ${i + 5}`}
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
