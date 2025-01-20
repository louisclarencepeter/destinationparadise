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
      window.scrollTo(0, 0);
    }
  }, [location]);

  return (
    <main className="store-container" id="top">
      <h2 className="title visible">Booking Request</h2>
      <ImageSlideshow images={images} aria-label="Image slideshow of tours" />
      <section className="booking-request animated-container visible">
        <p>
          Welcome to the booking request page. Please fill out the form below to
          make a new booking.
        </p>
        <BookingForm
          tours={tours}
          locations={locations}
          handleSubmit={handleSubmit}
        />
      </section>
    </main>
  );
};

export default Store;