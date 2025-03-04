import React from "react";

const NotFound = ({ onBack }) => (
  <div className="safari-not-found">
    <h2>Safari not found!</h2>
    <p>The safari you're looking for doesn't seem to exist.</p>
    <button onClick={onBack} className="back-button">
      Return to Safaris
    </button>
  </div>
);

export default NotFound;