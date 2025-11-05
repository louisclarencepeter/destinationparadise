import React, { useEffect } from "react";
import { useLocation } from "react-router-dom";
import "./Store.scss";
import ImageSlideshow from "./ImageSlideshow";
import BookingForm from "./booking/BookingForm";

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
    // DreamDhow tours
    "Mnemba Island (Best Seller)",
    "Tumbatu Island",
    "Romantic Sunset Cruise",
  ];

  const locations = [
    "Stone Town", "Nungwi", "Kendwa", "Matemwe", "Pongwe",
    "Kiwengwa", "Uroa", "Chwaka", "Michamvi", "Bwejuu",
    "Pingwe", "Kizimkazi", "Fumba", "Paje", "Jambiani", "Makunduchi",
  ];

  const images = [
    "/gallery/1.jpg", "/gallery/2.jpg", "/gallery/3.jpg",
    "/gallery/4.jpg", "/gallery/5.jpg", "/gallery/6.jpg",
  ];

  const location = useLocation();
  
  // Get the selected tour from DreamDhow if available
  const selectedTour = location.state?.selectedTour || "";
  const fromDreamDhow = location.state?.fromDreamDhow || false;

  useEffect(() => {
    if (location.state?.scrollToTop || fromDreamDhow) {
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      
      // Optional: Scroll to form after a short delay
      if (fromDreamDhow) {
        setTimeout(() => {
          const formElement = document.querySelector('.booking-request');
          if (formElement) {
            formElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        }, 500);
      }
    }
  }, [location, fromDreamDhow]);

  useEffect(() => {
    const revealElements = document.querySelectorAll(".reveal");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      },
      { 
        threshold: 0.1,
        rootMargin: "50px"
      }
    );

    revealElements.forEach((element) => observer.observe(element));

    return () => {
      revealElements.forEach((element) => observer.unobserve(element));
    };
  }, []);

  return (
    <div className="store-container" id="top">
      {fromDreamDhow && (
        <div className="breadcrumb">
          <a href="/dream-dhow">← Back to Dream Dhow</a>
        </div>
      )}
      
      <h2 className="reveal store-title">Booking Request</h2>
      <p className="store-description">
        Welcome to the booking request page. Please fill out the form below to
        make a new booking.
      </p>

      <ImageSlideshow images={images} />

      <div className="booking-request">
        <BookingForm 
          tours={tours} 
          locations={locations} 
          prefilledTour={selectedTour}
        />
      </div>
    </div>
  );
};

export default Store;