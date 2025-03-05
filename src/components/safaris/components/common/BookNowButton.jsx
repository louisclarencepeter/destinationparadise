import React from "react";
import SafariButton from "./SafariButton";

const BookNowButton = ({ packageTitle = "", className = "" }) => {
  // If packageTitle is provided, include it as query parameter
  // Otherwise, just navigate to book-now page
  const to = packageTitle 
    ? `/book-now?package=${encodeURIComponent(packageTitle)}`
    : "/book-now";
    
  return (
    <SafariButton 
      text="Book Now" 
      to={to}
      className={`${className}`}
    />
  );
};

export default BookNowButton;