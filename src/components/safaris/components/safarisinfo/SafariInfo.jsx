import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import safariData from "../../../../assets/data/safarisdata/safariData";
import "./SafariInfo.scss";

const SafariInfo = () => {
  const { title } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  // Find the safari with the matching title
  const safari = safariData.find((item) => item.title === title);

  useEffect(() => {
    // Simulate data loading (can be removed in production)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    
    // Scroll to top on component mount
    window.scrollTo(0, 0);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="safari-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!safari) {
    return (
      <div className="safari-not-found">
        <h2>Safari not found!</h2>
        <p>The safari you're looking for doesn't seem to exist.</p>
        <button onClick={() => navigate("/safaris")} className="back-button">
          Return to Safaris
        </button>
      </div>
    );
  }

  // Format date if available
  const formatDate = (dateString) => {
    if (!dateString) return null;
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="safari-info-container">
      <div className="safari-info-header">
        <h1>{safari.title}</h1>
        {safari.subtitle && <p className="safari-subtitle">{safari.subtitle}</p>}
      </div>
      
      <div className="safari-info-content">
        <div className="safari-info-image">
          <img 
            src={safari.imageUrl} 
            alt={safari.title} 
            loading="lazy"
          />
          {safari.location && (
            <div className="safari-location">
              <span className="location-icon">📍</span>
              <span>{safari.location}</span>
            </div>
          )}
        </div>
        
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
                  <span>{typeof safari.price === 'number' 
                    ? `${safari.price.toLocaleString()}` 
                    : safari.price}
                  </span>
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
            <button 
              onClick={() => navigate("/safaris")} 
              className="back-button"
            >
              Back to Safaris
            </button>
            
            <button 
              onClick={() => navigate(`/book-safari/${safari.id || safari.title}`)} 
              className="book-button"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SafariInfo;