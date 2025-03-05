import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import SafariButton from "./components/common/SafariButton";
import { safariPackages } from "./components/packages/safariPackageData";
import safariData from "../../assets/data/safarisdata/safariData";
import "./BookNow.scss";

const BookNow = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedPackageTitle = queryParams.get("package");

  // Find package in both safariPackages and safariData
  const findPackageByTitle = (title) => {
    if (!title) return null;
    
    return safariPackages.find(pkg => pkg.title === title) || 
           safariData.find(safari => safari.title === title);
  };

  const initialPackage = findPackageByTitle(selectedPackageTitle);

  // State for form selections
  const [selectedPackage, setSelectedPackage] = useState(
    initialPackage ? initialPackage.title : ""
  );
  const [budgetTier, setBudgetTier] = useState("");
  const [tourType, setTourType] = useState(""); // Shared or Private

  // Helper function to get the starting price for a package
  const getStartingPrice = (pkg) => {
    if (!pkg.prices) return null;
    const prices = Object.values(pkg.prices);
    return prices.length > 0 ? prices.reduce((min, price) => Math.min(min, parseFloat(price.replace(/[^0-9.]/g, ''))), Infinity) : null;
  };

  // Handle form submission
  const handleBookingRequest = () => {
    if (!selectedPackage || !budgetTier || !tourType) {
      alert("Please complete all selections before submitting.");
      return;
    }
    const bookingSummary = {
      package: selectedPackage,
      budget: budgetTier,
      type: tourType,
      duration: currentPackage.duration,
    };
    console.log("Booking Request Submitted:", bookingSummary);
    alert(`Booking Request Sent!\nPackage: ${selectedPackage}\nDuration: ${currentPackage.duration}\nBudget: ${budgetTier}\nType: ${tourType}`);
  };

  // Available budget options and duration based on selected package
  const currentPackage = findPackageByTitle(selectedPackage);
  const budgetOptions = currentPackage && currentPackage.prices ? Object.keys(currentPackage.prices) : [];

  // Combine packages from both sources for the dropdown
  const allPackages = [...safariPackages, ...safariData.filter(safari => 
    !safariPackages.some(pkg => pkg.title === safari.title)
  )];

  return (
    <div className="book-now-container">
      <div className="book-now-header">
        <h1>Book Your Safari Adventure</h1>
        <p className="book-now-subtitle">
          Customize your safari experience below
        </p>
      </div>

      <div className="book-now-packages">
        {/* Safari Package Selection */}
        <div className="package-card">
          <h2 className="package-title">Select Your Safari Package</h2>
          <select
            value={selectedPackage}
            onChange={(e) => {
              setSelectedPackage(e.target.value);
              setBudgetTier(""); // Reset budget tier when package changes
              setTourType(""); // Reset tour type when package changes
            }}
            className="package-select"
          >
            <option value="">Choose a Safari Package</option>
            {allPackages.map((pkg, index) => (
              <option key={index} value={pkg.title}>
                {pkg.title}
              </option>
            ))}
          </select>
        </div>

        {/* Budget Tier Selection */}
        {selectedPackage && currentPackage && currentPackage.prices && (
          <div className="package-card">
            <h2 className="package-title">Select Budget Tier</h2>
            <select
              value={budgetTier}
              onChange={(e) => setBudgetTier(e.target.value)}
              className="package-select"
            >
              <option value="">Choose a Budget Tier</option>
              {budgetOptions.map((tier, index) => (
                <option key={index} value={tier}>
                  {tier.charAt(0).toUpperCase() + tier.slice(1)}: {currentPackage.prices[tier]}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Shared or Private Selection */}
        {selectedPackage && currentPackage && (
          <div className="package-card">
            <h2 className="package-title">Tour Type</h2>
            <div className="tour-type-options">
              <label className="meta-item">
                <input
                  type="radio"
                  name="tourType"
                  value="Shared"
                  checked={tourType === "Shared"}
                  onChange={(e) => setTourType(e.target.value)}
                />
                Shared
              </label>
              <label className="meta-item">
                <input
                  type="radio"
                  name="tourType"
                  value="Private"
                  checked={tourType === "Private"}
                  onChange={(e) => setTourType(e.target.value)}
                />
                Private
              </label>
            </div>
          </div>
        )}

        {/* Summary with Starting Price */}
        {selectedPackage && currentPackage && budgetTier && tourType && (
          <div className="package-card">
            <h2 className="package-title">Booking Summary</h2>
            <ul className="pricing-list">
              <li><strong>Package:</strong> {selectedPackage}</li>
              <li><strong>Duration:</strong> {currentPackage.duration}</li>
              {currentPackage.prices && (
                <li>
                  <strong>Budget Tier:</strong> {budgetTier.charAt(0).toUpperCase() + budgetTier.slice(1)} - {currentPackage.prices[budgetTier]}
                  {getStartingPrice(currentPackage) && (
                    <span> (Starting from ${getStartingPrice(currentPackage).toLocaleString()} per person)</span>
                  )}
                </li>
              )}
              <li><strong>Tour Type:</strong> {tourType}</li>
            </ul>
            <SafariButton text="Submit Booking Request" onClick={handleBookingRequest} />
          </div>
        )}
      </div>

      <div className="book-now-footer">
        <p>Need help? Contact us for custom packages or special requests!</p>
        <SafariButton text="Contact Us" to="/contact" />
        <SafariButton text="Back to Safaris" to="/safaris" />
      </div>
    </div>
  );
};

export default BookNow;