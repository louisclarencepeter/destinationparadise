import { useEffect, useMemo, useState, useRef } from "react";
import useScrollToTop from "../../../../utils/scrollToTop";
import "./_DreamDhow.scss";

// --- START: Reusable Visibility Hook ---
// This hook is unchanged. It's perfect for triggering the container.
const useElementVisibility = (options = { threshold: 0.1, triggerOnce: true }) => {
  const ref = useRef(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (options.triggerOnce) {
            observer.unobserve(entry.target);
          }
        } else if (!options.triggerOnce) {
          setIsVisible(false);
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
  }, [ref, options]); 

  return [ref, isVisible];
};
// --- END: Reusable Visibility Hook ---

// --- START: Reusable Slideshow Hook (Unchanged) ---
const useCardSlideshow = (cardRef, imageList, intervalTime) => {
  const [currentImage, setCurrentImage] = useState(imageList[0]);
  const [isVisible, setIsVisible] = useState(false);
  const currentImageRef = useRef(imageList[0]); 

  useEffect(() => {
    currentImageRef.current = currentImage;
  }, [currentImage]);

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

  useEffect(() => {
    let intervalId = null;
    if (isVisible && imageList.length > 1) {
      intervalId = setInterval(() => {
        let randomIndex;
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

// --- DELETED ---
// The `RevealedGalleryImage` component is no longer needed
// as we will apply styles directly in the .map() loop.

const DreamDhow = () => {
  useScrollToTop();

  // --- START: Image Lists (Unchanged) ---
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

  // --- START: Card Slideshow Logic (Unchanged) ---
  const mnembaCardRef = useRef(null);
  const tumbatuCardRef = useRef(null);
  const sunsetCardRef = useRef(null);
  const currentMnembaImage = useCardSlideshow( mnembaCardRef, shuffledMnembaImages, 10000 );
  const currentTumbatuImage = useCardSlideshow( tumbatuCardRef, tumbatuImageList, 10000 );
  const currentSunsetImage = useCardSlideshow( sunsetCardRef, shuffledSunsetImages, 10000 );
  // --- END: Card Slideshow Logic ---

  // --- START: Section Visibility Hooks (Unchanged) ---
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
      {/* This section is a single block, so .reveal is fine */}
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

      {/* --- UPDATED: This section has a list, so we use .stagger-container --- */}
      <div
        ref={previewRef}
        className={`image-preview stagger-container ${isPreviewVisible ? "is-visible" : ""}`}
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
            // Add .stagger-item class and the inline style for delay
            className="preview-image stagger-item"
            style={{ animationDelay: `${index * 0.1}s` }}
          />
        ))}
      </div>

      {/* This section is a single block, so .reveal is fine */}
      <div
        ref={contentRef}
        className={`content-section reveal ${isContentVisible ? "is-visible" : ""}`}
      >
        <p>
          Experience the magic of Zanzibar's coastline aboard a traditional
          dhow. Choose a romantic sunset cruise or a group sail filled with
          laughter and views. Dream Dhow is more than a boat — it's your gateway
          to memories on the ocean.
        </p>
      </div>

      {/* This section is a single block, so .reveal is fine */}
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

      {/* --- UPDATED: This section has a list, so we use .stagger-container --- */}
      <div
        ref={whyBookRef}
        className={`why-book-us-section reveal stagger-container ${isWhyBookVisible ? "is-visible" : ""}`}
      >
        <h2>🌊 Destination Paradise x DreamDhow 🌅</h2>
        <p className="promo-text">
          Book your DreamDhow experience through us and unlock{" "}
          <strong>exclusive discounts</strong> on transfers & tours across
          Zanzibar!
        </p>
        <div className="value-props">
          {/* Add .stagger-item class and inline style to each item */}
          <div
            className="value-prop-item stagger-item"
            style={{ animationDelay: "0.1s" }}
          >
            <i className="fas fa-check-circle"></i>
            <div>
              <h3>Best-in-Class Partners</h3>
              <p>
                We've vetted the best, safest, and most professional dhow
                operators so you don't have to.
              </p>
            </div>
          </div>
          <div
            className="value-prop-item stagger-item"
            style={{ animationDelay: "0.2s" }}
          >
            <i className="fas fa-percent"></i>
            <div>
              <h3>Unlock Exclusive Savings</h3>
              <p>
                Your dhow booking is your key to special rates on our other
                top-rated services, from airport transfers to private tours.
              </p>
            </div>
          </div>
          <div
            className="value-prop-item stagger-item"
            style={{ animationDelay: "0.3s" }}
          >
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

      {/* This section is a single block, so .reveal is fine */}
      <div
        ref={bookNowRef}
        className={`book-now-section reveal ${isBookNowVisible ? "is-visible" : ""}`}
      >
        <a href="/contact" className="cta-button">
          Book Now
        </a>
      </div>

      {/* --- UPDATED: This section has a list, so we use .stagger-container --- */}
      <div
        ref={toursRef}
        className={`tour-products-section reveal stagger-container ${isToursVisible ? "is-visible" : ""}`}
      >
        <h2>Our Tour Packages</h2>
        <div className="tour-cards">
          {/* Mnemba Card: Add .stagger-item and style */}
          <div
            className="tour-card stagger-item"
            ref={mnembaCardRef}
            style={{ animationDelay: "0.1s" }}
          >
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

          {/* Tumbatu Card: Add .stagger-item and style */}
          <div
            className="tour-card stagger-item"
            ref={tumbatuCardRef}
            style={{ animationDelay: "0.2s" }}
          >
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

          {/* Sunset Cruise Card: Add .stagger-item and style */}
          <div
            className="tour-card stagger-item"
            ref={sunsetCardRef}
            style={{ animationDelay: "0.3s" }}
          >
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

      {/* --- UPDATED: This section has a list, so we use .stagger-container --- */}
      <div
        ref={galleryRef}
        className={`gallery-section reveal stagger-container ${isGalleryVisible ? "is-visible" : ""}`}
      >
        <h2>Gallery</h2>
        <div className="gallery-grid">
          {/* We apply the stagger styles directly in the map */}
          {shuffledGalleryImages.map((filename, index) => (
            <img
              key={index}
              src={`/dreamdhow/${filename}`}
              alt="A beautiful photo from a Dream Dhow tour in Zanzibar"
              // Add .stagger-item and the inline style
              className="gallery-image stagger-item"
              // Use a smaller delay for a long list
              style={{ animationDelay: `${index * 0.05}s` }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default DreamDhow;