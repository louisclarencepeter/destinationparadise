// BookNow.jsx
import React from "react";
import { safariPackages } from "./components/packages/safariPackageData";
import SafariButton from "./components/common/SafariButton";
import "./BookNow.scss";

const BookNow = () => {
  return (
    <div className="book-now-container">
      <div className="book-now-header">
        <h1>Book Your Safari Adventure</h1>
        <p className="book-now-subtitle">
          Choose from our expertly crafted safari packages in Tanzania
        </p>
      </div>

      <div className="book-now-packages">
        {safariPackages.map((pkg, index) => (
          <div key={index} className="package-card">
            <h2 className="package-title">{pkg.title}</h2>

            <div className="package-meta">
              <span className="meta-item">
                <span className="meta-icon">📍</span>
                {pkg.destinations}
              </span>
              <span className="meta-item">
                <span className="meta-icon">⏱️</span>
                {pkg.duration}
              </span>
            </div>

            <div className="package-pricing">
              <h3>Pricing Options</h3>
              <ul className="pricing-list">
                {pkg.prices.budget && (
                  <li>
                    <strong>Budget:</strong> {pkg.prices.budget}
                  </li>
                )}
                {pkg.prices.midRange && (
                  <li>
                    <strong>Mid-Range:</strong> {pkg.prices.midRange}
                  </li>
                )}
                {pkg.prices.luxury && (
                  <li>
                    <strong>Luxury:</strong> {pkg.prices.luxury}
                  </li>
                )}
              </ul>
            </div>

            {pkg.highlights && pkg.highlights.length > 0 && (
              <div className="package-highlights">
                <h3>Highlights</h3>
                <ul>
                  {pkg.highlights.map((highlight, idx) => (
                    <li key={idx}>{highlight}</li>
                  ))}
                </ul>
              </div>
            )}

            <SafariButton
              text="Book This Safari"
              to="/booking" // Links to your existing general booking page
            />
          </div>
        ))}
      </div>

      <div className="book-now-footer">
        <p>
          Need a custom itinerary or have questions? We're here to help create your perfect Tanzanian safari.
        </p>
        <SafariButton text="Contact Us" to="/booking" />
      </div>
    </div>
  );
};

export default BookNow;