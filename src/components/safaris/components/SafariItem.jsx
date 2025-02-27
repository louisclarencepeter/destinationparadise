import React from "react";

const SafariItem = ({ title, description }) => (
  <div className="safaris-item">
    <h3>{title}</h3>
    <p>{description}</p>
  </div>
);

export default SafariItem;