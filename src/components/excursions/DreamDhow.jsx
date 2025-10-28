import { useEffect, useMemo, useState, useRef } from "react";
import useScrollToTop from "../../utils/scrollToTop";
import { revealElements } from "../../utils/revealElements";
import "../../styles/pages/_DreamDhow.scss";

// --- START: Reusable Slideshow Hook ---
// We create this hook to avoid repeating the state and effect logic for all 3 cards.
const useCardSlideshow = (cardRef, imageList, intervalTime) => {
  // Set the initial image
  const [currentImage, setCurrentImage] = useState(imageList[0]);
  const [isVisible, setIsVisible] = useState(false);

  // Effect 1: Observe the card
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 } // Trigger when 10% of the card is visible
    );

    const currentRef = cardRef.current; // Capture ref value
    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [cardRef]); // Only re-run if the ref itself changes

  // Effect 2: Run the slideshow timer when visible
  useEffect(() => {
    let intervalId = null;

    // Only start interval if the card is visible AND there's more than one image
    if (isVisible && imageList.length > 1) {
      intervalId = setInterval(() => {
        const randomIndex = Math.floor(Math.random() * imageList.length);
        setCurrentImage(imageList[randomIndex]);
      }, intervalTime);
    }

    // Clear interval on cleanup
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isVisible, imageList, intervalTime]); // Re-run if visibility or images change

  return currentImage;
};
// --- END: Reusable Slideshow Hook ---

const DreamDhow = () => {
  useScrollToTop();

  // Scroll reveal setup
  useEffect(() => {
    window.addEventListener("scroll", revealElements);
    revealElements();
    return () => window.removeEventListener("scroll", revealElements);
  }, []);

  // --- START: Updated Image Lists ---
  // Updated with the 'mnemba/' subfolder prefix

  const mnembaImageList = [
    "mnemba/DJI_20250915124414_0001_D.jpg",
    "mnemba/DJI_20250915124543_0003_D.jpg",
    "mnemba/DJI_20250915124633_0008_D.jpg",
    "mnemba/DJI_20250915124638_0009_D.jpg",
    "mnemba/DJI_20250915170806_0003_D.jpg",
    "mnemba/DJI_20250915170921_0008_D.jpg",
    "mnemba/DJI_20250915170937_0009_D.jpg",
    "mnemba/DJI_20250915171037_0011_D.jpg",
    "mnemba/DJI_20250915171311_0018_D.jpg",
    "mnemba/DJI_20250915191226_0022_D.jpg",
    "mnemba/DJI_20250915191246_0026_D.jpg",
    "mnemba/DJI_20250915191436_0032_D.jpg",
    "mnemba/DJI_20250915192140_0043_D.jpg",
    "mnemba/DJI_20250915192450_0049_D.jpg",
    "mnemba/DJI_20250915192525_0051_D.jpg",
    "mnemba/DJI_20250915194507_0075_D.jpg",
    "mnemba/IMG_20250916_041952_456.jpg",
    "mnemba/Snapshot_202509259_040901.jpg",
    "mnemba/Snapshot_202509259_040902.jpg",
    "mnemba/Snapshot_202509259_040909 2.jpg",
  ];

  const tumbatuImageList = [
    "tumbatu/WhatsApp Image 2025-10-27 at 6.51.22 AM.jpeg",
  ];

  const sunsetImageList = [
    "sunset/WhatsApp Image 2025-10-27 at 6.49.17 AM (1).jpeg",
    "sunset/WhatsApp Image 2025-10-27 at 6.50.22 AM (1).jpeg",
    "sunset/WhatsApp Image 2025-10-27 at 6.50.22 AM.jpeg",
    "sunset/WhatsApp Image 2025-10-27 at 6.50.23 AM.jpeg",
  ];

  // Combine all images for the main gallery
  const mainGalleryList = [
    ...mnembaImageList,
    ...tumbatuImageList,
    ...sunsetImageList,
  ];

  // Shuffle each list once using useMemo
  const shuffledMnembaImages = useMemo(
    () => [...mnembaImageList].sort(() => 0.5 - Math.random()),
    []
  );
  const shuffledSunsetImages = useMemo(
    () => [...sunsetImageList].sort(() => 0.5 - Math.random()),
    []
  );
  const shuffledGalleryImages = useMemo(
    () => [...mainGalleryList].sort(() => 0.5 - Math.random()),
    []
  );
  // --- END: Updated Image Lists ---

  // --- START: Card Slideshow Logic ---
  // Create a ref for each card
  const mnembaCardRef = useRef(null);
  const tumbatuCardRef = useRef(null);
  const sunsetCardRef = useRef(null);

  // Use our custom hook for each card
  const currentMnembaImage = useCardSlideshow(
    mnembaCardRef,
    shuffledMnembaImages,
    10000 // 10 seconds
  );

  // For Tumbatu, it will just display the one image (hook won't start interval)
  const currentTumbatuImage = useCardSlideshow(
    tumbatuCardRef,
    tumbatuImageList, // No need to shuffle a 1-item list
    10000
  );

  const currentSunsetImage = useCardSlideshow(
    sunsetCardRef,
    shuffledSunsetImages,
    10000
  );
  // --- END: Card Slideshow Logic ---

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
        {/* Preview still uses the main gallery list */}
        {shuffledGalleryImages.slice(0, 4).map((filename, index) => (
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
          {/* Mnemba Card */}
          <div className="tour-card" ref={mnembaCardRef}>
            <img
              key={currentMnembaImage}
              src={`/dreamdhow/${currentMnembaImage}`}
              alt="Mnemba Island preview"
              className="tour-card-image"
            />
            <h3><i className="fas fa-water"></i> Mnemba Island (Best Seller)</h3>
            <p><strong>Departure:</strong> 9:00 AM from Kendwa Beach</p>
            <p><strong>Activities:</strong> Dolphin spotting, snorkeling, sandbank/lagoon, sunset sail</p>
            <p><strong>Food:</strong> Seafood lunch + fruits, snacks & drinks</p>
            <p><strong>Private boat:</strong> from $185 to $110 p.p. · <strong>Shared:</strong> $95/person</p>
            <p><strong>Kids:</strong> 0–4 free · 5–10 years $50</p>
            <a href="/contact" className="cta-button">Book Mnemba Island</a>
          </div>

          {/* Tumbatu Card (NOW with ref and image) */}
          <div className="tour-card" ref={tumbatuCardRef}>
            <img
              key={currentTumbatuImage}
              src={`/dreamdhow/${currentTumbatuImage}`}
              alt="Tumbatu Island preview"
              className="tour-card-image"
            />
            <h3><i className="fas fa-fish"></i> Tumbatu Island</h3>
            <p><strong>Departure:</strong> 9:00 AM from Kendwa Beach</p>
            <p><strong>Activities:</strong> Snorkeling (turtles!), beach walk, sunset sail</p>
            <p><strong>Food:</strong> Seafood lunch + fruits & soft drinks</p>
            <p><strong>Private boat:</strong> from $185 to $110 p.p. · <strong>Shared:</strong> $95/person</p>
            <p><strong>Kids:</strong> 0–4 free · 5–10 years $50</p>
            <a href="/contact" className="cta-button">Book Tumbatu Island</a>
          </div>

          {/* Sunset Cruise Card (NOW with ref and image) */}
          <div className="tour-card" ref={sunsetCardRef}>
            <img
              key={currentSunsetImage}
              src={`/dreamdhow/${currentSunsetImage}`}
              alt="Romantic Sunset Cruise preview"
              className="tour-card-image"
            />
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
          {/* Main gallery uses the combined and shuffled list */}
          {shuffledGalleryImages.map((filename, index) => (
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