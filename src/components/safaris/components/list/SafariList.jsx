import React from "react";
import SafariItem from "./SafariItem";
import safariData from "../../../../assets/data/safarisdata/safariData";
import { safariPackages } from "../packages/safariPackageData";

const SafariList = () => {
  // Function to find packages related specifically to a national park
  const findRelatedPackages = (parkTitle) => {
    // Extract the main park name, removing words like "National Park"
    let parkName = parkTitle.toLowerCase();
    
    // Handle special cases
    if (parkName.includes("selous game reserve")) {
      parkName = "selous";
    } else if (parkName.includes("nyerere")) {
      parkName = "nyerere";
    } else if (parkName.includes("mahale mountains")) {
      parkName = "mahale";
    } else if (parkName.includes("gombe")) {
      parkName = "gombe";
    } else {
      // For standard park names, extract the main name
      parkName = parkName
        .replace("national park", "")
        .replace("game reserve", "")
        .trim();
    }
    
    // Get all packages that mention this park in their destinations
    return safariPackages.filter(pkg => {
      const destinations = pkg.destinations.toLowerCase();
      
      // Check if the package destinations include the park name
      if (destinations.includes(parkName)) {
        return true;
      }
      
      // Special case for "Serengeti" - if the package mentions "great migration",
      // it's relevant to Serengeti even if not explicitly mentioned
      if (parkName === "serengeti" && 
          (pkg.title.toLowerCase().includes("migration") || 
           destinations.includes("migration"))) {
        return true;
      }
      
      // Special case for "Lake Manyara" - check for both "manyara" and "lake manyara"
      if (parkName === "lake manyara" && destinations.includes("manyara")) {
        return true;
      }
      
      // Special case for "Ngorongoro Crater" - check for both "ngorongoro" and "crater"
      if (parkName === "ngorongoro crater" && 
          (destinations.includes("ngorongoro") || destinations.includes("crater"))) {
        return true;
      }
      
      return false;
    });
  };

  return (
    <div className="safaris-items">
      {safariData.map((item, index) => {
        const relatedPackages = findRelatedPackages(item.title);
        
        // For debugging
        console.log(`Safari: ${item.title}, Found ${relatedPackages.length} related packages`);
        if (relatedPackages.length > 0) {
          console.log("Related packages:", relatedPackages.map(pkg => pkg.title));
        }
        
        return (
          <SafariItem
            key={index}
            title={item.title}
            imageUrl={item.imageUrl}
            shortDescription={item.shortDescription}
            fullDetails={{
              fullDescription: item.fullDescription,
              imageUrl: item.imageUrl,
            }}
            relatedPackages={relatedPackages}
          />
        );
      })}
    </div>
  );
};

export default SafariList;