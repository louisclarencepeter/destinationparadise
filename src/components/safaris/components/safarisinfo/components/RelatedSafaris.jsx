import React from "react";
import SafariButton from "../../common/SafariButton";

const RelatedSafaris = ({ packages, isPackage = true }) => {
  const getPriceOptions = (prices) => {
    const options = [];
    if (prices?.budget) options.push({ type: "Budget", price: prices.budget });
    if (prices?.midRange) options.push({ type: "Mid-Range", price: prices.midRange });
    if (prices?.luxury) options.push({ type: "Luxury", price: prices.luxury });
    return options.length > 0 ? options : [{ type: "Contact", price: "Contact for pricing" }];
  };

  // Helper function to format the title for the URL
  const formatTitleForUrl = (title) => {
    return title.toLowerCase().replace(/\s+/g, "-");
  };

  return (
    <div className="related-safaris">
      <h2>{isPackage ? "Related Safari Packages" : "Related Safaris"}</h2>
      <div className="related-safaris-container">
        {packages.map((pkg, index) => (
          <div key={index} className="related-safari-card">
            <h3>{pkg.title}</h3>
            {pkg.destinations && (
              <p className="related-safari-destinations">
                <strong>Destinations:</strong> {pkg.destinations}
              </p>
            )}
            {pkg.duration && (
              <p className="related-safari-duration">
                <strong>Duration:</strong> {pkg.duration}
              </p>
            )}
            {pkg.prices && (
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
            )}
            <SafariButton
              text={isPackage ? "View Package" : "View Safari"}
              to={isPackage 
                ? `/safaripackageinfo/${formatTitleForUrl(pkg.title)}` 
                : `/safarisinfo/${formatTitleForUrl(pkg.title)}`
              }
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedSafaris;