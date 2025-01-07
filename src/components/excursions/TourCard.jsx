import React from "react";
import { Link } from "react-router-dom";
import "./TourCard.scss";

export default function TourCard({ tour }) {
  const { title, duration, imageKey, price, description, currency = "$", id } = tour;

  return (
    <Link to={`/excursions/${id}`} style={{ textDecoration: "none" }}>
      <div className="tour-card">
        <div className="tour-image" data-price={price}>
          <img src={imageKey} alt={title} />
        </div>
        <div className="tour-info">
          <p className="tour-duration">{duration}</p>
          <h3 className="tour-title">{title}</h3>
          {description && <p className="tour-description">{description}</p>}
        </div>
      </div>
    </Link>
  );
}