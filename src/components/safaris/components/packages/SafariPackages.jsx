import React from "react";
import "./SafariPackages.scss";
import { safariPackages, MULTI_DAY_SAFARI_COUNT } from "./safariPackageData";
import SafariButton from "../common/SafariButton";

const SafariPackages = () => {
  // Split the safari packages into multi-day and day safaris
  const multiDaySafaris = safariPackages.slice(0, MULTI_DAY_SAFARI_COUNT);
  const daySafaris = safariPackages.slice(MULTI_DAY_SAFARI_COUNT);

  return (
    <div className="safari-packages">
      <h2>Our Safari Packages</h2>
      
      {/* Multi-day Safaris */}
      <div className="multi-day-safaris">
        <h3 className="section-title">Multi-Day Safari Experiences</h3>
        {multiDaySafaris.map((safari, index) => (
          <div key={index} className="safari-package">
            <h3>{safari.title}</h3>
            <p>
              <strong>Duration:</strong> {safari.duration}
            </p>
            <p>
              <strong>Destinations:</strong> {safari.destinations}
            </p>
            <p>
              <strong>Best for:</strong> {safari.bestFor}
            </p>
            <h4>Highlights:</h4>
            <ul>
              {safari.highlights.map((highlight, i) => (
                <li key={i}>{highlight}</li>
              ))}
            </ul>
            <h4>Estimated Price:</h4>
            <ul>
              {safari.prices.budget && <li>Budget: {safari.prices.budget}</li>}
              {safari.prices.midRange && (
                <li>Mid-Range: {safari.prices.midRange}</li>
              )}
              {safari.prices.luxury && <li>Luxury: {safari.prices.luxury}</li>}
            </ul>
            <SafariButton text="Book Now" to={`/booking/${safari.title.replace(/\s+/g, '-').toLowerCase()}`} />
          </div>
        ))}
      </div>
      
      {/* Day Safaris */}
      <div className="day-safaris">
        <h3 className="section-title">Day Safaris from Zanzibar</h3>
        <p className="day-safari-intro">
          For travelers staying in Zanzibar but eager to experience a thrilling wildlife adventure, 
          a one-day safari is an excellent option. With direct flights from Zanzibar to major wildlife 
          parks in Tanzania, you can enjoy a full-day safari and return to Zanzibar by evening.
        </p>
        
        {daySafaris.map((safari, index) => (
          <div key={index + MULTI_DAY_SAFARI_COUNT} className="safari-package day-safari">
            <h3>{safari.title}</h3>
            <p>
              <strong>Duration:</strong> {safari.duration}
            </p>
            <p>
              <strong>Destinations:</strong> {safari.destinations}
            </p>
            <p>
              <strong>Best for:</strong> {safari.bestFor}
            </p>
            <h4>Schedule & Highlights:</h4>
            <ul>
              {safari.highlights.map((highlight, i) => (
                <li key={i}>{highlight}</li>
              ))}
            </ul>
            <h4>Estimated Price:</h4>
            <ul>
              {safari.prices.budget && <li>From: {safari.prices.budget}</li>}
              {safari.prices.luxury && <li>Up to: {safari.prices.luxury}</li>}
            </ul>
            <div className="inclusions-exclusions">
              <div className="inclusions">
                <h4>What's Included:</h4>
                <ul>
                  {safari.includes.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
              <div className="exclusions">
                <h4>What's Not Included:</h4>
                <ul>
                  {safari.excludes.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </div>
            </div>
            <SafariButton text="Book Now" to={`/booking/${safari.title.replace(/\s+/g, '-').toLowerCase()}`} />
          </div>
        ))}
        
        <div className="day-safari-recommendation">
          <h4>Which Day Safari is Best for You?</h4>
          <ul>
            <li><strong>Serengeti</strong> – Best for Big Five and Great Migration.</li>
            <li><strong>Nyerere (Selous)</strong> – Best for a mix of game drives and boat safaris.</li>
            <li><strong>Mikumi</strong> – Best for a budget-friendly, quick safari experience.</li>
          </ul>
          <p>A day safari from Zanzibar is a perfect way to experience Tanzania's incredible wildlife without needing an extended stay on the mainland! 🦁🐘🌿✈</p>
        </div>
      </div>
    </div>
  );
};

export default SafariPackages;