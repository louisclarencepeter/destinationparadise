import React, { useState, useEffect } from "react";
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

  // Get current package and pricing info
  const currentPackage = findPackageByTitle(selectedPackage);
  
  // Helper function to get pricing based on tour type
  const getPricing = () => {
    if (!currentPackage) return null;
    
    if (tourType === "Shared" && currentPackage.sharedPrices) {
      return currentPackage.sharedPrices;
    } else if (tourType === "Private" && currentPackage.privatePrices) {
      return currentPackage.privatePrices;
    } else {
      return currentPackage.prices; // Fallback to original pricing
    }
  };

  // Reset budget tier when tour type changes
  useEffect(() => {
    setBudgetTier("");
  }, [tourType]);

  // Available budget options based on selected package and tour type
  const pricing = getPricing();
  const budgetOptions = pricing ? Object.keys(pricing) : [];

  // Helper function to get the starting price for a package
  const getStartingPrice = (priceObj) => {
    if (!priceObj) return null;
    const prices = Object.values(priceObj).map(price => 
      parseFloat(price.replace(/[^0-9.]/g, ''))
    );
    return prices.length > 0 ? Math.min(...prices) : null;
  };

  // Handle form submission
  const handleBookingRequest = () => {
    if (!selectedPackage || !budgetTier || !tourType) {
      alert("Please complete all selections before submitting.");
      return;
    }
    
    // Get the correct price based on tour type and budget tier
    const selectedPricing = getPricing();
    const priceValue = selectedPricing[budgetTier];
    
    const bookingSummary = {
      package: selectedPackage,
      budget: budgetTier,
      type: tourType,
      duration: currentPackage.duration,
      price: priceValue
    };
    
    console.log("Booking Request Submitted:", bookingSummary);
    alert(`Booking Request Sent!\nPackage: ${selectedPackage}\nDuration: ${currentPackage.duration}\nBudget: ${budgetTier}\nType: ${tourType}\nPrice: ${priceValue}`);
  };

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

        {/* Tour Type Selection (Moved before Budget Tier) */}
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
                Shared Group Trip
              </label>
              <label className="meta-item">
                <input
                  type="radio"
                  name="tourType"
                  value="Private"
                  checked={tourType === "Private"}
                  onChange={(e) => setTourType(e.target.value)}
                />
                Private Trip
              </label>
            </div>
          </div>
        )}

        {/* Budget Tier Selection */}
        {selectedPackage && currentPackage && tourType && pricing && (
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
                  {tier === 'midRange' ? 'Mid-Range' : tier.charAt(0).toUpperCase() + tier.slice(1)}: {pricing[tier]}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Summary with Selected Price */}
        {selectedPackage && currentPackage && budgetTier && tourType && (
          <div className="package-card">
            <h2 className="package-title">Booking Summary</h2>
            <ul className="pricing-list">
              <li><strong>Package:</strong> {selectedPackage}</li>
              <li><strong>Duration:</strong> {currentPackage.duration}</li>
              <li><strong>Tour Type:</strong> {tourType === "Shared" ? "Shared Group Trip" : "Private Trip"}</li>
              {pricing && (
                <li>
                  <strong>Budget Tier:</strong> {budgetTier === 'midRange' ? 'Mid-Range' : budgetTier.charAt(0).toUpperCase() + budgetTier.slice(1)} - {pricing[budgetTier]}
                </li>
              )}
              {tourType === "Shared" && (
                <li><em>Note: Shared trips offer lower rates as costs are distributed among travelers</em></li>
              )}
              {tourType === "Private" && (
                <li><em>Note: Private trips provide exclusive vehicle, guide, and customized schedule</em></li>
              )}
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