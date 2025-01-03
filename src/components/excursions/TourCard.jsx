// TourCard.jsx
import React from "react";
import { Link } from "react-router-dom"; // Import the Link component
import "./TourCard.scss";

export default function TourCard({ tour }) {
  const { title, duration, image, price, currency = "$" } = tour;

  return (
    <Link to={`/excursions/${tour.id}`} style={{ textDecoration: "none" }}> 
      <div className="tour-card">
        <div className="tour-image">
          <img src={image} alt={title} />
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