import React from "react";
import SafariButton from "../../common/SafariButton";

const RelatedSafaris = ({ packages }) => {
  const getPriceOptions = (prices) => {
    const options = [];
    if (prices.budget) options.push({ type: "Budget", price: prices.budget });
    if (prices.midRange) options.push({ type: "Mid-Range", price: prices.midRange });
    if (prices.luxury) options.push({ type: "Luxury", price: prices.luxury });
    return options.length > 0 ? options : [{ type: "Contact", price: "Contact for pricing" }];
  };

  return (
    <div className="related-safaris">
      <h2>Related Safari Packages</h2>
      <div className="related-safaris-container">
        {packages.map((pkg, index) => (
          <div key={index} className="related-safari-card">
            <h3>{pkg.title}</h3>
            <p className="related-safari-destinations">
              <strong>Destinations:</strong> {pkg.destinations}
            </p>
            <p className="related-safari-duration">
              <strong>Duration:</strong> {pkg.duration}
            </p>
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
              to={`/safari-package/${pkg.title.replace(/\s+/g, "-").toLowerCase()}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedSafaris;