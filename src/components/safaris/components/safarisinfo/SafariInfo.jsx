import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import safariData from "../../../../assets/data/safarisdata/safariData";
import { safariPackages } from "../packages/safariPackageData";
import SafariButton from "../common/SafariButton";
import "./SafariInfo.scss";

const SafariInfo = () => {
  const { title } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [relatedPackages, setRelatedPackages] = useState([]);

  // Find the safari with the matching title
  const safari = safariData.find((item) => item.title === title);

  // Helper function to get all available price options
  const getPriceOptions = (prices) => {
    const options = [];
    if (prices.budget) options.push({ type: "Budget", price: prices.budget });
    if (prices.midRange) options.push({ type: "Mid-Range", price: prices.midRange });
    if (prices.luxury) options.push({ type: "Luxury", price: prices.luxury });
    return options.length > 0 ? options : [{ type: "Contact", price: "Contact for pricing" }];
  };

  // Helper function to get the best available price
  const getBestPrice = (prices) => {
    return prices.budget || prices.midRange || prices.luxury || "Contact for pricing";
  };

  useEffect(() => {
    // Simulate data loading (can be removed in production)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 300);
    
    // Scroll to top on component mount
    window.scrollTo(0, 0);

    // Find related packages if safari exists
    if (safari) {
      // Get related packages based on location keywords and package type
      const getRelatedPackages = () => {
        // Get the park/location name from the current safari
        const currentTitle = safari.title.toLowerCase();
        const currentDescription = (safari.fullDescription || safari.description || '').toLowerCase();
        
        // Common locations/parks in Tanzania
        const locations = [
          'serengeti', 'ngorongoro', 'tarangire', 'manyara', 'lake manyara',
          'zanzibar', 'selous', 'nyerere', 'ruaha', 'mikumi', 'mahale'
        ];
        
        // Find locations mentioned in the current safari
        const mentionedLocations = locations.filter(loc => 
          currentTitle.includes(loc) || currentDescription.includes(loc)
        );
        
        // If no specific locations found, use broader categories
        const isMultiDay = currentTitle.includes('day') || 
                          currentDescription.includes('day') ||
                          (safari.duration && safari.duration.includes('day'));
        
        const isZanzibar = currentTitle.includes('zanzibar') || 
                          currentDescription.includes('zanzibar');
        
        // Filter packages based on matching criteria
        return safariPackages.filter(pkg => {
          // Skip the current safari if it's in packages
          if (pkg.title === safari.title) return false;
          
          // If we found specific locations, prioritize packages with those locations
          if (mentionedLocations.length > 0) {
            const pkgDestinations = pkg.destinations.toLowerCase();
            const locationMatch = mentionedLocations.some(loc => pkgDestinations.includes(loc));
            if (locationMatch) return true;
          }
          
          // For Zanzibar safaris, recommend other Zanzibar options
          if (isZanzibar && pkg.destinations.toLowerCase().includes('zanzibar')) {
            return true;
          }
          
          // Match by safari type (day safari or multi-day)
          const pkgIsMultiDay = !pkg.duration.toLowerCase().includes('1 day');
          if (isMultiDay === pkgIsMultiDay) {
            return true;
          }
          
          return false;
        })
        .sort((a, b) => {
          // Prioritize packages that match more of the mentioned locations
          const aMatches = mentionedLocations.filter(loc => 
            a.destinations.toLowerCase().includes(loc)
          ).length;
          
          const bMatches = mentionedLocations.filter(loc => 
            b.destinations.toLowerCase().includes(loc)
          ).length;
          
          return bMatches - aMatches;
        })
        .slice(0, 3); // Limit to 3 related packages
      };
      
      setRelatedPackages(getRelatedPackages());
    }

    return () => clearTimeout(timer);
  }, [safari]);

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
      
      {/* Related Packages Section - Updated with better price display */}
      {relatedPackages.length > 0 && (
        <div className="related-safaris">
          <h2>Related Safari Packages</h2>
          <div className="related-safaris-container">
            {relatedPackages.map((pkg, index) => (
              <div key={index} className="related-safari-card">
                <h3>{pkg.title}</h3>
                <p className="related-safari-destinations">
                  <strong>Destinations:</strong> {pkg.destinations}
                </p>
                <p className="related-safari-duration">
                  <strong>Duration:</strong> {pkg.duration}
                </p>
                
                {/* Updated price display */}
                <div className="related-safari-prices">
                  <strong>Available Options:</strong>
                  <ul className="price-options-list">
                    {getPriceOptions(pkg.prices).map((option, i) => (
                      <li key={i} className="price-option">
                        <span className="price-type">{option.type}:</span> 
                        <span className="price-value">{option.price}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <SafariButton 
                  text="View Package" 
                  to={`/safari-package/${pkg.title.replace(/\s+/g, '-').toLowerCase()}`} 
                />
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SafariInfo;