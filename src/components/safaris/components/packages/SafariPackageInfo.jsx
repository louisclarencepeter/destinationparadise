import React from "react";
import { useParams } from "react-router-dom";
import { safariPackages } from "./safariPackageData";
import BookNowButton from "../common/BookNowButton";
import "./SafariPackageInfo.scss";

const SafariPackageInfo = () => {
  const { title } = useParams(); // Get the package title from the URL
  const safari = safariPackages.find(
    (pkg) => pkg.title.toLowerCase().replace(/\s+/g, "-") === title
  );

  if (!safari) {
    return <div className="not-found">Safari Package Not Found</div>;
  }

  return (
    <div className="safari-package-info">
      <h2>{safari.title}</h2>
      <div className="package-details">
        <p>
          <strong>Duration:</strong> {safari.duration}
        </p>
        <p>
          <strong>Destinations:</strong> {safari.destinations}
        </p>
        <p>
          <strong>Best for:</strong> {safari.bestFor}
        </p>

        <h3>Highlights</h3>
        <ul className="highlights">
          {safari.highlights.map((highlight, index) => (
            <li key={index}>{highlight}</li>
          ))}
        </ul>

        <h3>Pricing</h3>
        <ul className="pricing">
          {safari.prices.budget && <li>Budget: {safari.prices.budget}</li>}
          {safari.prices.midRange && <li>Mid-Range: {safari.prices.midRange}</li>}
          {safari.prices.luxury && <li>Luxury: {safari.prices.luxury}</li>}
        </ul>

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
      </div>
      <BookNowButton packageTitle={safari.title} />
    </div>
  );
};

export default SafariPackageInfo;