import React from "react";
import SafariDetails from "./SafariDetails";

const SafariContent = ({ safari, onNavigate }) => (
  <div className="safari-info-content">
    <div className="safari-info-image">
      <img src={safari.imageUrl} alt={safari.title} loading="lazy" />
      {safari.location && (
        <div className="safari-location">
          <span className="location-icon">📍</span>
          <span>{safari.location}</span>
        </div>
      )}
    </div>
    <SafariDetails safari={safari} onNavigate={onNavigate} />
  </div>
);

export default SafariContent;