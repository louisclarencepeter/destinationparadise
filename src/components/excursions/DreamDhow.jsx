import { useEffect, useMemo } from "react"; // <-- Import useMemo
import useScrollToTop from "../../utils/scrollToTop";
import { revealElements } from "../../utils/revealElements";
import "../../styles/pages/_DreamDhow.scss";

const DreamDhow = () => {
  useScrollToTop();

  useEffect(() => {
    window.addEventListener("scroll", revealElements);
    revealElements();
    return () => window.removeEventListener("scroll", revealElements);
  }, []);

  // List of images in /public/dreamdhow (shuffled)
  const imageList = [
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

  /*
    FIX: Use useMemo to shuffle the array only once on component mount.
    This prevents re-shuffling on every render and avoids
    mutating the original 'imageList' array by sorting a copy ([...imageList]).
  */
  const shuffledImages = useMemo(() => {
    return [...imageList].sort(() => 0.5 - Math.random());
  }, []); // Empty dependency array [] ensures this runs only once.

  return (
    <section className="dream-dhow-page">
      <div className="hero-section reveal">
        <h1 className="title-script">Dream Dhow Zanzibar</h1>
        <p className="slogan">
          Sail into Paradise, feel the ocean breeze,
          <br />
          and make your Zanzibar story one to remember.
        </p>
      </div>

      <div className="image-preview reveal">
        {shuffledImages.slice(0, 4).map((filename, index) => (
          <img
            key={index}
            src={`/dreamdhow/${filename}`}
            alt="Dream Dhow preview"
            className="preview-image"
          />
        ))}
      </div>

      <div className="content-section reveal">
        <p>
          Experience the magic of Zanzibar’s coastline aboard a traditional
          dhow. Choose a romantic sunset cruise or a group sail filled with
          laughter and views. Dream Dhow is more than a boat — it's your
          gateway to memories on the ocean.
        </p>
      </div>

      <div className="book-now-section reveal">
        <a href="/contact" className="cta-button">
          Book Now
        </a>
      </div>

      <div className="tour-products-section reveal">
        <h2>Our Tour Packages</h2>
        <div className="tour-cards">
          <div className="tour-card">
            <h3><i className="fas fa-water"></i> Mnemba Island (Best Seller)</h3>
            <p><strong>Departure:</strong> 9:00 AM from Kendwa Beach</p>
            <p><strong>Activities:</strong> Dolphin spotting, snorkeling, sandbank/lagoon, sunset sail</p>
            <p><strong>Food:</strong> Seafood lunch + fruits, snacks & drinks</p>
            <p><strong>Private boat:</strong> from $185 to $110 p.p. · <strong>Shared:</strong> $95/person</p>
            <p><strong>Kids:</strong> 0–4 free · 5–10 years $50</p>
            <a href="/contact" className="cta-button">Book Mnemba Island</a>
          </div>

          <div className="tour-card">
            <h3><i className="fas fa-fish"></i> Tumbatu Island</h3>
            <p><strong>Departure:</strong> 9:00 AM from Kendwa Beach</p>
            <p><strong>Activities:</strong> Snorkeling (turtles!), beach walk, sunset sail</p>
            <p><strong>Food:</strong> Seafood lunch + fruits & soft drinks</p>
            <p><strong>Private boat:</strong> from $185 to $110 p.p. · <strong>Shared:</strong> $95/person</p>
            <p><strong>Kids:</strong> 0–4 free · 5–10 years $50</p>
            <a href="/contact" className="cta-button">Book Tumbatu Island</a>
          </div>

          <div className="tour-card">
            <h3><i className="fas fa-heart"></i> Romantic Sunset Cruise</h3>
            <p><strong>Departure:</strong> 5:00 PM from Nungwi & Kendwa</p>
            <p><strong>Activities:</strong> Sunset sailing, romantic vibes, dinner onboard</p>
            <p><strong>Dinner:</strong> $110 → $90 p.p. · <strong>Snacks:</strong> $90 → $70 p.p.</p>
            <p><strong>Kids:</strong> 0–4 free · 5–10 years $50</p>
            <a href="/contact" className="cta-button">Book Sunset Cruise</a>
          </div>
        </div>
      </div>

      <div className="gallery-section reveal">
        <h2>Gallery</h2>
        <div className="gallery-grid">
          {shuffledImages.map((filename, index) => (
            <img
              key={index}
              src={`/dreamdhow/${filename}`}
              alt="Dream Dhow gallery"
              className="gallery-image reveal"
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DreamDhow;