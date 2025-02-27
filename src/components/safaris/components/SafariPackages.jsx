import React from "react";
import "./SafariPackages.scss";

const SafariPackages = () => {
  const safariPackages = [
    {
      title: "Classic Northern Circuit Safari",
      duration: "6 Days / 5 Nights",
      destinations: "Tarangire National Park, Lake Manyara National Park, Serengeti National Park, Ngorongoro Crater",
      bestFor: "First-time safari travelers, wildlife enthusiasts",
      highlights: [
        "Game drives in Tarangire, famous for elephants and baobab trees",
        "Spot tree-climbing lions in Lake Manyara",
        "Witness the Big Five in the Serengeti and Ngorongoro Crater",
        "Stay in comfortable lodges or tented camps",
      ],
      prices: {
        budget: "$1,900 per person",
        midRange: "$2,500 per person",
        luxury: "$4,000 per person",
      },
    },
    {
      title: "The Great Migration Safari",
      duration: "8 Days / 7 Nights",
      destinations: "Serengeti National Park, Ngorongoro Crater",
      bestFor: "Wildlife lovers, photographers",
      highlights: [
        "Follow the Great Migration (seasonal: December–July)",
        "Witness dramatic river crossings (July–October)",
        "Experience the iconic Serengeti plains",
        "Explore the Ngorongoro Crater for diverse wildlife",
      ],
      prices: {
        budget: "$2,500 per person",
        midRange: "$3,500 per person",
        luxury: "$5,500 per person",
      },
    },
    {
      title: "Tanzania & Zanzibar Safari",
      duration: "10 Days / 9 Nights",
      destinations: "Tarangire, Serengeti, Ngorongoro Crater, Zanzibar",
      bestFor: "Honeymooners, relaxation seekers",
      highlights: [
        "Big Five safari in Tanzania’s top parks",
        "Luxury beach escape in Zanzibar",
        "Explore Stone Town, Spice Tour, and Snorkeling excursions",
        "Enjoy a mix of adventure and relaxation",
      ],
      prices: {
        midRange: "$3,800 per person",
        luxury: "$6,000 per person",
      },
    },
    {
      title: "Short Safari from Zanzibar",
      duration: "3 Days / 2 Nights",
      destinations: "Serengeti or Nyerere National Park (Selous)",
      bestFor: "Travelers with limited time",
      highlights: [
        "Fly from Zanzibar to Serengeti or Selous",
        "Experience thrilling game drives in a short time",
        "Perfect for those on a Zanzibar beach holiday",
      ],
      prices: {
        midRange: "$1,500 per person",
        luxury: "$2,800 per person",
      },
    },
    {
      title: "Southern Tanzania Safari",
      duration: "7 Days / 6 Nights",
      destinations: "Nyerere (Selous) & Ruaha National Parks",
      bestFor: "Off-the-beaten-path travelers",
      highlights: [
        "Remote safari with fewer crowds",
        "Boat safaris on the Rufiji River",
        "Excellent predator sightings in Ruaha",
        "Great for repeat safari-goers looking for something different",
      ],
      prices: {
        midRange: "$3,200 per person",
        luxury: "$5,000 per person",
      },
    },
    {
      title: "Chimpanzee Trekking & Safari",
      duration: "7 Days / 6 Nights",
      destinations: "Mahale Mountains, Katavi National Park",
      bestFor: "Adventure seekers, primate lovers",
      highlights: [
        "Trek wild chimpanzees in Mahale Mountains",
        "Explore the untouched wilderness of Katavi",
        "Enjoy a mix of boat safaris, walking safaris, and game drives",
      ],
      prices: {
        midRange: "$4,500 per person",
        luxury: "$7,000 per person",
      },
    },
  ];

  return (
    <div className="safari-packages">
      {safariPackages.map((safari, index) => (
        <div key={index} className="safari-package">
          <h3>{safari.title}</h3>
          <p><strong>Duration:</strong> {safari.duration}</p>
          <p><strong>Destinations:</strong> {safari.destinations}</p>
          <p><strong>Best for:</strong> {safari.bestFor}</p>
          <h4>Highlights:</h4>
          <ul>
            {safari.highlights.map((highlight, i) => (
              <li key={i}>{highlight}</li>
            ))}
          </ul>
          <h4>Estimated Price:</h4>
          <ul>
            {safari.prices.budget && <li>Budget: {safari.prices.budget}</li>}
            {safari.prices.midRange && <li>Mid-Range: {safari.prices.midRange}</li>}
            {safari.prices.luxury && <li>Luxury: {safari.prices.luxury}</li>}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default SafariPackages;