import React from "react";
import { Link } from "react-router-dom";
import "./SafariItem.scss";

const SafariItem = ({ title, imageUrl, shortDescription, fullDetails, relatedPackages }) => {
  // Helper function to get the best available price from a package
  const getBestPrice = (prices) => {
    return prices.midRange || prices.budget || prices.luxury || "Price on request";
  };

  return (
    <div className="safari-item">
      <img src={imageUrl} alt={title} />
      <h3>{title}</h3>
      <p>{shortDescription}</p>
      
      {/* Improved related packages section */}
      {relatedPackages && relatedPackages.length > 0 && (
        <div className="related-packages">
          <h4>Available Packages:</h4>
          <ul>
            {relatedPackages.map((pkg, index) => (
              <li key={index}>
                <strong>{pkg.title}</strong>
                <div>{pkg.duration}</div>
                <div>From {getBestPrice(pkg.prices)}</div>
              </li>
            ))}
          </ul>
        </div>
      )}
      
      <Link to={`/safarisinfo/${encodeURIComponent(title)}`}>
        <button className="learn-more">Learn More</button>
      </Link>
    </div>
  );
};

export default SafariItem;