import React from "react";
import SafariItem from "./SafariItem";
import safariData from "../../../../assets/data/safarisdata/safariData";

const SafariList = () => (
  <div className="safaris-items">
    {safariData.map((item, index) => (
      <SafariItem
        key={index}
        title={item.title}
        imageUrl={item.imageUrl} // Pass the image URL
        shortDescription={item.shortDescription} // Pass the short description
        fullDetails={{
          // Pass the full details for the SafariInfo component
          fullDescription: item.fullDescription,
          imageUrl: item.imageUrl, // Include the image URL here as well
          // ... any other data you need for the details page
        }}
      />
    ))}
  </div>
);

export default SafariList;