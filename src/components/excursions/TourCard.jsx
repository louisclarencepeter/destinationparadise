// TourCard.jsx

import React from 'react';
import './TourCard.scss';

export default function TourCard({ tour }) {
  const {
    title,
    duration,
    image,
    price, // or whatever your data uses to store price
    currency = '$', // fallback if no currency is provided
  } = tour;

  return (
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
  );
}
