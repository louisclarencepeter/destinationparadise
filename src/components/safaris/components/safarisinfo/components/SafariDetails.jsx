import React from "react";

const SafariDetails = ({ safari, onNavigate }) => {
  const formatPrice = (price) =>
    typeof price === "number" ? price.toLocaleString() : price;

  return (
    <div className="safari-info-details">
      {safari.duration && (
        <div className="safari-meta">
          {safari.duration && (
            <span className="meta-item">
              <span className="meta-icon">⏱️</span>
              <span>{safari.duration}</span>
            </span>
          )}
          {safari.price && (
            <span className="meta-item">
              <span className="meta-icon">💰</span>
              <span>{formatPrice(safari.price)}</span>
            </span>
          )}
          {safari.difficulty && (
            <span className="meta-item">
              <span className="meta-icon">📊</span>
              <span>{safari.difficulty}</span>
            </span>
          )}
        </div>
      )}
      <p className="safari-description">{safari.fullDescription || safari.description}</p>
      {safari.highlights && safari.highlights.length > 0 && (
        <div className="safari-highlights">
          <h3>Highlights</h3>
          <ul>
            {safari.highlights.map((highlight, index) => (
              <li key={index}>{highlight}</li>
            ))}
          </ul>
        </div>
      )}
      {safari.includes && safari.includes.length > 0 && (
        <div className="safari-includes">
          <h3>What's Included</h3>
          <ul className="includes-list">
            {safari.includes.map((item, index) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}
      <div className="safari-actions">
        <button onClick={() => onNavigate("/safaris")} className="back-button">
          Back to Safaris
        </button>
        <button
          onClick={() => onNavigate(`/book-safari/${safari.id || safari.title}`)}
          className="book-button"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default SafariDetails;