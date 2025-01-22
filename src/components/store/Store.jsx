import React, { useEffect, useMemo, useState, Suspense } from "react";
import { useLocation } from "react-router-dom";
import "./Store.scss";
import BookingForm from "./booking/BookingForm";
import Alert from '../ui/Alert';

// Lazy load the ImageSlideshow component
const ImageSlideshow = React.lazy(() => import("./ImageSlideshow"));

// Move to a separate config file later
const TOUR_CONFIG = {
  tours: [
    "Spice Tour",
    "Historical City Tour",
    "Prison Island Boat Trip",
    "Jozani Forest Tour",
    "Dolphin Tour",
    "Sunset & The Rock Restaurant",
    "Snorkeling",
    "Village Tour",
    "Motorbike Renting",
    "Mnemba Snorkeling & Trip to the North",
    "Safari Blue",
    "Local Game Fishing",
    "Swimming in the Cave",
    "Sailing into the Sunset",
    "Quad Tour",
  ],
  locations: [
    "Stone Town",
    "Nungwi",
    "Kendwa",
    "Matemwe",
    "Pongwe",
    "Kiwengwa",
    "Uroa",
    "Chwaka",
    "Michamvi",
    "Bwejuu",
    "Pingwe",
    "Kizimkazi",
    "Fumba",
    "Paje",
    "Jambiani",
    "Makunduchi",
  ],
  images: [
    "/gallery/1.jpg",
    "/gallery/2.jpg",
    "/gallery/3.jpg",
    "/gallery/4.jpg",
    "/gallery/5.jpg",
    "/gallery/6.jpg",
  ],
};

// Custom hook for intersection observer
const useIntersectionObserver = (options = {}) => {
  const [elements, setElements] = useState([]);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const observer = new IntersectionObserver((observedEntries) => {
      setEntries(observedEntries);
    }, options);

    elements.forEach((element) => observer.observe(element));
    
    return () => {
      elements.forEach((element) => observer.unobserve(element));
      observer.disconnect();
    };
  }, [elements, options]);

  const ref = (element) => {
    if (element && !elements.includes(element)) {
      setElements((prevElements) => [...prevElements, element]);
    }
  };

  return [ref, entries];
};

const Store = () => {
  // Memoize the static data
  const { tours, locations, images } = useMemo(() => TOUR_CONFIG, []);
  
  // Form submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState({ type: '', message: '' });

  // Intersection Observer for animations
  const [titleRef, titleEntries] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "50px",
  });

  const [contentRef, contentEntries] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "50px",
  });

  const handleSubmit = async (formData) => {
    setIsSubmitting(true);
    setSubmitStatus({ type: '', message: '' });

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setSubmitStatus({
          type: 'success',
          message: 'Booking request submitted successfully!'
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Submission failed');
      }
    } catch (error) {
      setSubmitStatus({
        type: 'error',
        message: `Error submitting booking request: ${error.message}`
      });
      console.error("Error submitting booking request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle scroll to top on navigation
  const location = useLocation();
  useEffect(() => {
    if (location.state?.scrollToTop) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [location]);

  // Visibility states for animations
  const isTitleVisible = titleEntries?.some((entry) => entry.isIntersecting);
  const isContentVisible = contentEntries?.some(
    (entry) => entry.isIntersecting
  );

  return (
    <main 
      className="store-container" 
      id="top"
      role="main"
      aria-label="Booking request page"
    >
      <h2
        ref={titleRef}
        className={`title ${isTitleVisible ? "visible" : ""}`}
        aria-label="Booking Request Form Title"
      >
        Booking Request
      </h2>

      <p className="booking-intro">
        Welcome to the booking request page. Please fill out the form below to
        make a new booking.
      </p>

      <Suspense 
        fallback={
          <div className="slideshow-loading" aria-label="Loading slideshow">
            Loading tour images...
          </div>
        }
      >
        <ImageSlideshow 
          images={images} 
          aria-label="Image slideshow of tours"
        />
      </Suspense>

      <section
        ref={contentRef}
        className={`booking-request animated-container ${
          isContentVisible ? "visible" : ""
        }`}
        aria-label="Booking request form section"
      >
        {submitStatus.message && (
          <Alert 
            className={`alert-${submitStatus.type}`}
            role="alert"
            aria-live="polite"
          >
            {submitStatus.message}
          </Alert>
        )}
        
        <BookingForm
          tours={tours}
          locations={locations}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </section>
    </main>
  );
};

export default Store;