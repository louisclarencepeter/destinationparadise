// TourCard.jsx
import React from "react";
import { Link } from "react-router-dom";
import "./TourCard.scss";

export default function TourCard({ tour }) {
  // Destructure imageKey (instead of image)
  const { title, duration, imageKey, price, currency = "$" } = tour;

  return (
    <Link to={`/excursions/${tour.id}`} style={{ textDecoration: "none" }}>
      <div className="tour-card">
        <div className="tour-image">
          {/* Use imageKey here */}
          <img src={imageKey} alt={title} />
        </div>
        <div className="tour-info">
          <p className="tour-duration">{duration}</p>
          <h3 className="tour-title">{title}</h3>
          <p className="tour-price">
            From {currency}
            {price} / person
          </p>
        </div>
      </div>
    </Link>
  );
}
