import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { safariPackages, MULTI_DAY_SAFARI_COUNT } from "./safariPackageData";
import RelatedSafaris from "../safarisinfo/components/RelatedSafaris";
import BookNowButton from "../common/BookNowButton";
import "./SafariPackageInfo.scss";

const SafariPackageInfo = () => {
  const { title } = useParams(); // Get the package title from the URL
  const navigate = useNavigate(); // Initialize the navigate function
  
  const safari = safariPackages.find(
    (pkg) => pkg.title.toLowerCase().replace(/\s+/g, "-") === title
  );

  if (!safari) {
    return <div className="not-found">Safari Package Not Found</div>;
  }

  // Determine if this is a day safari or multi-day safari
  const isDaySafari = safariPackages.indexOf(safari) >= MULTI_DAY_SAFARI_COUNT;

  // Find related packages
  const getRelatedPackages = (currentPackage, maxRelated = 3) => {
    // Get packages of the same type (day or multi-day)
    const sameTypePackages = safariPackages.filter((pkg) => {
      const isPkgDaySafari =
        safariPackages.indexOf(pkg) >= MULTI_DAY_SAFARI_COUNT;
      return (
        isPkgDaySafari === isDaySafari && pkg.title !== currentPackage.title
      );
    });

    // If there are less than maxRelated packages of the same type, return them all
    if (sameTypePackages.length <= maxRelated) {
      return sameTypePackages;
    }

    // Otherwise, prioritize packages with similar destinations
    const packagesWithSimilarDestinations = sameTypePackages.filter((pkg) => {
      return pkg.destinations
        .split(",")
        .some((destination) =>
          currentPackage.destinations.includes(destination.trim())
        );
    });

    // If we have enough packages with similar destinations, return them
    if (packagesWithSimilarDestinations.length >= maxRelated) {
      return packagesWithSimilarDestinations.slice(0, maxRelated);
    }

    // Otherwise, combine packages with similar destinations with other packages
    const otherPackages = sameTypePackages.filter(
      (pkg) => !packagesWithSimilarDestinations.includes(pkg)
    );

    return [...packagesWithSimilarDestinations, ...otherPackages].slice(
      0,
      maxRelated
    );
  };

  const relatedPackages = getRelatedPackages(safari);

  return (
    <div className="safari-package-info">
      <h2>{safari.title}</h2>

      <div className="package-details">
        <div className="safari-basics">
          <p>
            <strong>Duration:</strong> {safari.duration}
          </p>
          <p>
            <strong>Destinations:</strong> {safari.destinations}
          </p>
          <p>
            <strong>Best for:</strong> {safari.bestFor}
          </p>
        </div>

        <h3>Highlights</h3>
        <ul className="highlights">
          {safari.highlights.map((highlight, index) => (
            <li key={index}>{highlight}</li>
          ))}
        </ul>

        <h3>Pricing</h3>
        <ul className="pricing">
          {safari.prices.budget && (
            <li>
              <strong>Budget:</strong> {safari.prices.budget}
            </li>
          )}
          {safari.prices.midRange && (
            <li>
              <strong>Mid-Range:</strong> {safari.prices.midRange}
            </li>
          )}
          {safari.prices.luxury && (
            <li>
              <strong>Luxury:</strong> {safari.prices.luxury}
            </li>
          )}
        </ul>

        {/* Inclusions and exclusions sections for day safaris */}
        {safari.includes && (
          <>
            <h3>What's Included</h3>
            <ul className="includes">
              {safari.includes.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </>
        )}

        {safari.excludes && (
          <>
            <h3>What's Not Included</h3>
            <ul className="excludes">
              {safari.excludes.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </>
        )}

        {/* Additional information for day safaris */}
        {isDaySafari && (
          <div className="additional-info">
            <h3>About This Day Safari</h3>
            <p>
              This day safari allows you to experience the beauty of Tanzania's
              wildlife in a single day. With convenient flights from Zanzibar to
              major wildlife parks, you can enjoy an incredible safari adventure
              and return to your accommodation by evening.
            </p>
          </div>
        )}

        <div className="booking-section">
          <p>
            Ready to embark on this unforgettable adventure? Book your spot now!
          </p>
          <BookNowButton packageTitle={safari.title} />
        </div>
      </div>

      {/* Related Safaris */}
      {relatedPackages.length > 0 && (
        <div className="related-packages-section">
          <RelatedSafaris packages={relatedPackages} isPackage={true} />
        </div>
      )}
      <button
        onClick={() => navigate("/safaris")}
        className="back-button button-equal-width"
      >
        Back to Safaris
      </button>
    </div>
  );
};

export default SafariPackageInfo;