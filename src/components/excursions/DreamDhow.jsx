import { useEffect, useMemo, useState, useRef } from "react";
import useScrollToTop from "../../utils/scrollToTop";
import "../../styles/pages/_DreamDhow.scss";

// --- START: Reusable Visibility Hook ---
// This new hook replaces the old `revealElements` scroll listener.
// It uses IntersectionObserver for high performance.
const useElementVisibility = (options = { threshold: 0.1, triggerOnce: true }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // Set visibility
        if (entry.isIntersecting) {
          setIsVisible(true);
          // If triggerOnce is true, stop observing
          if (options.triggerOnce) {
            observer.unobserve(entry.target);
          }
        } else if (!options.triggerOnce) {
          setIsVisible(false); // Only set to false if we're not triggering once
        }
      },
      options
    );

    const currentRef = ref.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [ref, options]); // Re-run if ref or options change

  return [ref, isVisible];
};
// --- END: Reusable Visibility Hook ---

// --- START: Reusable Slideshow Hook (Updated) ---
const useCardSlideshow = (cardRef, imageList, intervalTime) => {
  const [currentImage, setCurrentImage] = useState(imageList[0]);
  const [isVisible, setIsVisible] = useState(false);
  const currentImageRef = useRef(imageList[0]); // Ref to hold current image for interval

  // Update ref whenever state changes
  useEffect(() => {
    currentImageRef.current = currentImage;
  }, [currentImage]);

  // Effect 1: Observe the card
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const currentRef = cardRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }
    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
    };
  }, [cardRef]);

  // Effect 2: Run the slideshow timer when visible
  useEffect(() => {
    let intervalId = null;
    if (isVisible && imageList.length > 1) {
      intervalId = setInterval(() => {
        let randomIndex;
        // Keep picking until we get a *different* image
        do {
          randomIndex = Math.floor(Math.random() * imageList.length);
        } while (imageList.length > 1 && imageList[randomIndex] === currentImageRef.current);
        
        setCurrentImage(imageList[randomIndex]);
      }, intervalTime);
    }
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isVisible, imageList, intervalTime]);

  return currentImage;
};
// --- END: Reusable Slideshow Hook ---

// --- START: Gallery Image Component ---
// This component uses the visibility hook for each gallery image
// to ensure they fade in as they become visible.
const RevealedGalleryImage = ({ filename }) => {
  const [ref, isVisible] = useElementVisibility({ threshold: 0.1, triggerOnce: true });
  return (
    <img
      ref={ref}
      src={`/dreamdhow/${filename}`}
      alt="A beautiful photo from a Dream Dhow tour in Zanzibar"
      className={`gallery-image reveal ${isVisible ? "is-visible" : ""}`}
    />
  );
};
// --- END: Gallery Image Component ---

const DreamDhow = () => {
  useScrollToTop();

  // --- REMOVED ---
  // The old `useEffect` for `revealElements` has been completely removed.

  // --- START: Image Lists ---
  // (No changes to this section)
  const mnembaImageList = [
    "mnemba/DJI_20250915124414_0001_D.jpg", "mnemba/DJI_20250915124543_0003_D.jpg",
    "mnemba/DJI_20250915124633_0008_D.jpg", "mnemba/DJI_20250915124638_0009_D.jpg",
    "mnemba/DJI_20250915170806_0003_D.jpg", "mnemba/DJI_20250915170921_0008_D.jpg",
    "mnemba/DJI_20250915170937_0009_D.jpg", "mnemba/DJI_20250915171037_0011_D.jpg",
    "mnemba/DJI_20250915171311_0018_D.jpg", "mnemba/DJI_20250915191226_0022_D.jpg",
    "mnemba/DJI_20250915191246_0026_D.jpg", "mnemba/DJI_20250915191436_0032_D.jpg",
    "mnemba/DJI_20250915192140_0043_D.jpg", "mnemba/DJI_20250915192450_0049_D.jpg",
    "mnemba/DJI_20250915192525_0051_D.jpg", "mnemba/DJI_20250915194507_0075_D.jpg",
    "mnemba/IMG_20250916_041952_456.jpg", "mnemba/Snapshot_202509259_040901.jpg",
    "mnemba/Snapshot_202509259_040902.jpg", "mnemba/Snapshot_202509259_040909 2.jpg",
  ];
  const tumbatuImageList = [ "tumbatu/WhatsApp Image 2025-10-27 at 6.51.22 AM.jpeg", ];
  const sunsetImageList = [
    "sunset/WhatsApp Image 2025-10-27 at 6.49.17 AM (1).jpeg",
    "sunset/WhatsApp Image 2025-10-27 at 6.50.22 AM (1).jpeg",
    "sunset/WhatsApp Image 2025-10-27 at 6.50.22 AM.jpeg",
    "sunset/WhatsApp Image 2025-10-27 at 6.50.23 AM.jpeg",
  ];
  const mainGalleryList = [...mnembaImageList, ...tumbatuImageList, ...sunsetImageList];
  const shuffledMnembaImages = useMemo(() => [...mnembaImageList].sort(() => 0.5 - Math.random()), []);
  const shuffledSunsetImages = useMemo(() => [...sunsetImageList].sort(() => 0.5 - Math.random()), []);
  const shuffledGalleryImages = useMemo(() => [...mainGalleryList].sort(() => 0.5 - Math.random()), []);
  // --- END: Image Lists ---

  // --- START: Card Slideshow Logic ---
  const mnembaCardRef = useRef(null);
  const tumbatuCardRef = useRef(null);
  const sunsetCardRef = useRef(null);
  const currentMnembaImage = useCardSlideshow( mnembaCardRef, shuffledMnembaImages, 10000 );
  const currentTumbatuImage = useCardSlideshow( tumbatuCardRef, tumbatuImageList, 10000 );
  const currentSunsetImage = useCardSlideshow( sunsetCardRef, shuffledSunsetImages, 10000 );
  // --- END: Card Slideshow Logic ---

  // --- START: Section Visibility Hooks ---
  // Use the new hook for each section that needs to be revealed
  const [heroRef, isHeroVisible] = useElementVisibility();
  const [previewRef, isPreviewVisible] = useElementVisibility();
  const [contentRef, isContentVisible] = useElementVisibility();
  const [videoRef, isVideoVisible] = useElementVisibility();
  const [whyBookRef, isWhyBookVisible] = useElementVisibility();
  const [bookNowRef, isBookNowVisible] = useElementVisibility();
  const [toursRef, isToursVisible] = useElementVisibility();
  const [galleryRef, isGalleryVisible] = useElementVisibility();
  // --- END: Section Visibility Hooks ---

  return (
    <section className="dream-dhow-page">
      <div
        ref={heroRef}
        className={`hero-section reveal ${isHeroVisible ? "is-visible" : ""}`}
      >
        <h1 className="title-script">Dream Dhow Zanzibar</h1>
        <p className="slogan">
          Sail into Paradise, feel the ocean breeze,
          <br />
          and make your Zanzibar story one to remember.
        </p>
      </div>

      <div
        ref={previewRef}
        className={`image-preview reveal ${isPreviewVisible ? "is-visible" : ""}`}
      >
        {shuffledGalleryImages.slice(0, 4).map((filename, index) => (
          <img
            key={index}
            src={`/dreamdhow/${filename}`}
            alt={
              index % 2 === 0
                ? "A traditional dhow boat on turquoise water"
                : "A beautiful Zanzibar sandbank"
            }
            className="preview-image"
          />
        ))}
      </div>

      <div
        ref={contentRef}
        className={`content-section reveal ${isContentVisible ? "is-visible" : ""}`}
      >
        <p>
          Experience the magic of Zanzibar’s coastline aboard a traditional
          dhow. Choose a romantic sunset cruise or a group sail filled with
          laughter and views. Dream Dhow is more than a boat — it's your gateway
          to memories on the ocean.
        </p>
      </div>

      <div
        ref={videoRef}
        className={`video-section reveal ${isVideoVisible ? "is-visible" : ""}`}
      >
        <h2>Experience the Dream</h2>
        <div className="video-wrapper">
          <iframe
            src="https://www.youtube.com/embed/GNWH_dBIUtM"
            title="Experience Dream Dhow Zanzibar"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </div>
      </div>

      <div
        ref={whyBookRef}
        className={`why-book-us-section reveal ${isWhyBookVisible ? "is-visible" : ""}`}
      >
        <h2>🌊 Destination Paradise x DreamDhow 🌅</h2>
        <p className="promo-text">
          Book your DreamDhow experience through us and unlock{" "}
          <strong>exclusive discounts</strong> on transfers & tours across
          Zanzibar!
        </p>
        <div className="value-props">
          {/* ... value prop items ... */}
          <div className="value-prop-item">
            <i className="fas fa-check-circle"></i>
            <div>
              <h3>Best-in-Class Partners</h3>
              <p>
                We've vetted the best, safest, and most professional dhow
                operators so you don't have to.
              </p>
            </div>
          </div>
          <div className="value-prop-item">
            <i className="fas fa-percent"></i>
            <div>
              <h3>Unlock Exclusive Savings</h3>
              <p>
                Your dhow booking is your key to special rates on our other
                top-rated services, from airport transfers to private tours.
              </p>
            </div>
          </div>
          <div className="value-prop-item">
            <i className="fas fa-concierge-bell"></i>
            <div>
              <h3>Seamless One-Stop Planning</h3>
              <p>
                Let us handle all the details. We're your single point of
                contact for a stress-free, perfectly coordinated itinerary.
              </p>
            </div>
          </div>
        </div>
        <p className="slogan-footer">
          ✨ Good vibes. Great company. Pure paradise.
          <br />
          <a
            href="https://wa.me/message/YCOQDKJSDMXFD1"
            className="contact-link"
            target="_blank"
            rel="noopener noreferrer"
          >
            <i className="fab fa-whatsapp"></i> DM us now to reserve your spot!
          </a>
        </p>
      </div>

      <div
        ref={bookNowRef}
        className={`book-now-section reveal ${isBookNowVisible ? "is-visible" : ""}`}
      >
        <a href="/contact" className="cta-button">
          Book Now
        </a>
      </div>

      <div
        ref={toursRef}
        className={`tour-products-section reveal ${isToursVisible ? "is-visible" : ""}`}
      >
        <h2>Our Tour Packages</h2>
        <div className="tour-cards">
          {/* Mnemba Card */}
          <div className="tour-card" ref={mnembaCardRef}>
            <img
              key={currentMnembaImage}
              src={`/dreamdhow/${currentMnembaImage}`}
              alt="Snorkeling in the clear turquoise water at Mnemba Island"
              className="tour-card-image"
            />
            <h3>
              <i className="fas fa-water"></i> Mnemba Island (Best Seller)
            </h3>
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

          {/* Tumbatu Card */}
          <div className="tour-card" ref={tumbatuCardRef}>
            <img
              key={currentTumbatuImage}
              src={`/dreamdhow/${currentTumbatuImage}`}
              alt="A sea turtle swimming near Tumbatu Island"
              className="tour-card-image"
            />
            <h3>
              <i className="fas fa-fish"></i> Tumbatu Island
            </h3>
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

          {/* Sunset Cruise Card */}
          <div className="tour-card" ref={sunsetCardRef}>
            <img
              key={currentSunsetImage}
              src={`/dreamdhow/${currentSunsetImage}`}
              alt="A couple enjoying a romantic sunset cruise on a dhow"
              className="tour-card-image"
            />
            <h3>
              <i className="fas fa-heart"></i> Romantic Sunset Cruise
            </h3>
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

      <div
        ref={galleryRef}
        className={`gallery-section reveal ${isGalleryVisible ? "is-visible" : ""}`}
      >
        <h2>Gallery</h2>
        <div className="gallery-grid">
          {/* Use the new component for efficient, individual image reveals */}
          {shuffledGalleryImages.map((filename, index) => (
            <RevealedGalleryImage key={index} filename={filename} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DreamDhow;