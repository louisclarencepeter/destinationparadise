import { useEffect, useMemo, useState, useRef } from "react"; // 1. Import hooks
import useScrollToTop from "../../utils/scrollToTop";
import { revealElements } from "../../utils/revealElements";
import "../../styles/pages/_DreamDhow.scss";

const DreamDhow = () => {
  useScrollToTop();

  // This is your existing scroll reveal setup
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

  // Your existing memoized shuffle
  const shuffledImages = useMemo(() => {
    return [...imageList].sort(() => 0.5 - Math.random());
  }, []);

  // --- START: New logic for Mnemba Card Slideshow ---

  // 2. State to hold the current image and visibility
  const [currentMnembaImage, setCurrentMnembaImage] = useState(
    shuffledImages[0]
  );
  const [isMnembaCardVisible, setIsMnembaCardVisible] = useState(false);
  const mnembaCardRef = useRef(null); // 3. Ref to attach to the card

  // 4. This effect observes the card
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Update state based on whether the card is intersecting (in view)
        setIsMnembaCardVisible(entry.isIntersecting);
      },
      { threshold: 0.1 } // Trigger when 10% of the card is visible
    );

    const currentRef = mnembaCardRef.current; // Capture ref value

    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, []); // Empty dependency array, runs once

  // 5. This effect runs the slideshow *only* when the card is visible
  useEffect(() => {
    let intervalId = null;

    if (isMnembaCardVisible) {
      // If card is visible, start an interval
      intervalId = setInterval(() => {
        // Pick a new random image from the shuffled list
        const randomIndex = Math.floor(Math.random() * shuffledImages.length);
        setCurrentMnembaImage(shuffledImages[randomIndex]);
      }, 10000); // Change image every 2.5 seconds
    }

    // Cleanup: clear the interval when the component unmounts or card is not visible
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isMnembaCardVisible, shuffledImages]); // Dependencies

  // --- END: New logic for Mnemba Card Slideshow ---

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
          {/* 6. Add the ref and the new image tag to the Mnemba card */}
          <div className="tour-card" ref={mnembaCardRef}>
            <img
              key={currentMnembaImage} // This "key" is the trick to re-triggering the animation
              src={`/dreamdhow/${currentMnembaImage}`}
              alt="Mnemba Island preview"
              className="tour-card-image" // New class for styling
            />
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