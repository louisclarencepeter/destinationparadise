import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./Store.scss";
import ImageSlideshow from "./ImageSlideshow";
import BookingForm from "./booking/BookingForm";

// Custom hook for intersection observer
const useIntersectionObserver = (options = {}) => {
  const [elements, setElements] = React.useState([]);
  const [entries, setEntries] = React.useState([]);

  useEffect(() => {
    const observer = new IntersectionObserver((observedEntries) => {
      setEntries(observedEntries);
    }, options);

    elements.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [elements, options]);

  const ref = (element) => {
    if (element && !elements.includes(element)) {
      setElements((prevElements) => [...prevElements, element]);
    }
  };

  return [ref, entries];
};

const Store = () => {
  const tours = [
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
  ];

  const locations = [
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
  ];

  const images = [
    "/gallery/1.jpg",
    "/gallery/2.jpg",
    "/gallery/3.jpg",
    "/gallery/4.jpg",
    "/gallery/5.jpg",
    "/gallery/6.jpg",
  ];

  // Intersection Observer for title and content animations
  const [titleRef, titleEntries] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "50px",
  });

  const [contentRef, contentEntries] = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: "50px",
  });

  const handleSubmit = async (formData) => {
    console.log("Form submitted:", formData);

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        console.log("Booking request submitted successfully!");
      } else {
        console.error("Booking request submission failed.");
      }
    } catch (error) {
      console.error("Error submitting booking request:", error);
    }
  };

  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollToTop) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    }
  }, [location]);

  const isTitleVisible = titleEntries?.some((entry) => entry.isIntersecting);
  const isContentVisible = contentEntries?.some(
    (entry) => entry.isIntersecting
  );

  return (
    <main className="store-container" id="top">
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

      <ImageSlideshow images={images} aria-label="Image slideshow of tours" />

      <section
        ref={contentRef}
        className={`booking-request animated-container ${
          isContentVisible ? "visible" : ""
        }`}
      >
        <BookingForm
          tours={tours}
          locations={locations}
          onSubmit={handleSubmit}
        />
      </section>
    </main>
  );
};

export default Store;