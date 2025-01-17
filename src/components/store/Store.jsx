import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./Store.scss";
import ImageSlideshow from "./ImageSlideshow";
import BookingForm from "./booking/BookingForm";

const Store = () => {
  // Static data - kept in component as per original structure
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

  const handleSubmit = (formData) => {
    console.log("Form submitted:", formData);
  };

  const location = useLocation();

  useEffect(() => {
    if (location.state?.scrollToTop) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth' // Added smooth scrolling
      });
    }
  }, [location]);

  // Added Intersection Observer for reveal animation
  useEffect(() => {
    const revealElements = document.querySelectorAll('.reveal');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
        }
      });
    }, {
      threshold: 0.1
    });

    revealElements.forEach(element => observer.observe(element));

    // Cleanup observer
    return () => {
      revealElements.forEach(element => observer.unobserve(element));
    };
  }, []);

  return (
    <div className="store-container" id="top">
      <h2 
        className="reveal"
        aria-label="Booking Request Section"
      >
        Booking Request
      </h2>

      <ImageSlideshow 
        images={images} 
        aria-label="Image slideshow of tours"
      />

      <div className="booking-request">
        <p>
          Welcome to the booking request page. Please fill out the form below to
          make a new booking.
        </p>

        <BookingForm
          tours={tours}
          locations={locations}
          handleSubmit={handleSubmit}
          aria-label="Tour booking form"
        />
      </div>
    </div>
  );
};

export default Store;