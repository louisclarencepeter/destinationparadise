import React from "react";

const SafariHeader = ({ title, subtitle }) => (
  <div className="safari-info-header">
    <h1>{title}</h1>
    {subtitle && <p className="safari-subtitle">{subtitle}</p>}
  </div>
);

export default SafariHeader;