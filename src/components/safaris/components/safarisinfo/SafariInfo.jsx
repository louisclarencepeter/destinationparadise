import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import safariData from "../../../../assets/data/safarisdata/safariData";
import "./SafariInfo.scss"; // We'll create this file in the next step

const SafariInfo = () => {
  const { title } = useParams();
  const navigate = useNavigate();

  // Find the safari with the matching title
  const safari = safariData.find((item) => item.title === title);

  if (!safari) {
    return (
      <div className="safari-not-found">
        <h2>Safari not found!</h2>
        <button onClick={() => navigate("/safaris")} className="back-button">
          Return to Safaris
        </button>
      </div>
    );
  }

  return (
    <div className="safari-info-container">
      <div className="safari-info-header">
        <h1>{safari.title}</h1>
      </div>
      
      <div className="safari-info-content">
        <div className="safari-info-image">
          <img src={safari.imageUrl} alt={safari.title} />
        </div>
        
        <div className="safari-info-details">
          <p className="safari-description">{safari.fullDescription}</p>
          
          {safari.highlights && (
            <div className="safari-highlights">
              <h3>Highlights</h3>
              <ul>
                {safari.highlights.map((highlight, index) => (
                  <li key={index}>{highlight}</li>
                ))}
              </ul>
            </div>
          )}
          
          <button 
            onClick={() => navigate("/safaris")} 
            className="back-button"
          >
            Back to Safaris
          </button>
        </div>
      </div>
    </div>
  );
};

export default SafariInfo;