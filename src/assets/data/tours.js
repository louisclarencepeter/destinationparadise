// tours.js
import { tourImages } from "./tripsdata/tourImages.js";
import { tourDescriptions } from "./tripsdata/tourDescriptions.js";
import { tourInclusions } from "./tripsdata/tourInclusion.js";
import { tourActivities } from "./tripsdata/tourActivities.js";
import { whatToBring } from "./tripsdata/whatToBring.js";
import { tourFaqs } from "./tripsdata/tourFaqs.js";

const getInclusions = (tourId) => {
  const tourData = tourInclusions[tourId];
  return tourData && tourData.inclusions ? tourData.inclusions : [];
};

export const tours = [
  {
    id: "zanzibar-spice-culture-tour",
    imageKey: tourImages.spiceTour,
    ...tourDescriptions["zanzibar-spice-culture-tour"],
    inclusions: getInclusions("spiceTour"),
    whatToBring: whatToBring["spiceTour"] || [],
    activities: tourActivities["zanzibar-spice-culture-tour"] || [],
    FAQs: tourFaqs["zanzibar-spice-culture-tour"]?.FAQs || [],
    price: 60,
  },
  {
    id: "stone-town-heritage-walk",
    imageKey: tourImages.historicalCityTour,
    ...tourDescriptions["stone-town-heritage-walk"],
    inclusions: getInclusions("historicalCityTour"),
    whatToBring: whatToBring["historicalCityTour"] || [],
    activities: tourActivities["stone-town-heritage-walk"] || [],
    FAQs: tourFaqs["stone-town-heritage-walk"]?.FAQs || [],
    price: 50,
  },
  {
    id: "prison-island-boat-trip",
    imageKey: tourImages.prisonIsland,
    ...tourDescriptions["prison-island-boat-trip"],
    inclusions: getInclusions("prisonIsland"),
    whatToBring: whatToBring["prisonIsland"] || [],
    activities: tourActivities["prison-island-boat-trip"] || [],
    FAQs: tourFaqs["prison-island-boat-trip"]?.FAQs || [],
    price: 70,
  },
  {
    id: "jozani-forest-tour",
    imageKey: tourImages.jozaniForest,
    ...tourDescriptions["jozani-forest-tour"],
    inclusions: getInclusions("jozaniForest"),
    whatToBring: whatToBring["jozaniForest"] || [],
    activities: tourActivities["jozani-forest-tour"] || [],
    FAQs: tourFaqs["jozani-forest-tour"]?.FAQs || [],
    price: 65,
  },
  {
    id: "dolphin-tour",
    imageKey: tourImages.dolphinTour,
    ...tourDescriptions["dolphin-tour"],
    inclusions: getInclusions("dolphinTour"),
    whatToBring: whatToBring["dolphinTour"] || [],
    activities: tourActivities["dolphin-tour"] || [],
    FAQs: tourFaqs["dolphin-tour"]?.FAQs || [],
    price: 75,
  },
  {
    id: "mnemba-snorkeling-trip-north",
    imageKey: tourImages.mnemba,
    ...tourDescriptions["mnemba-snorkeling-trip-north"],
    inclusions: getInclusions("mnembaSnorkeling"),
    whatToBring: whatToBring["mnembaSnorkeling"] || [],
    activities: tourActivities["mnemba-snorkeling-trip-north"] || [],
    FAQs: tourFaqs["mnemba-snorkeling-trip-north"]?.FAQs || [],
    price: 90,
  },
  {
    id: "dhow-snorkeling-safari-blue",
    imageKey: tourImages.safariBlue,
    ...tourDescriptions["dhow-snorkeling-safari-blue"],
    inclusions: getInclusions("safariBlue"),
    whatToBring: whatToBring["safariBlue"] || [],
    activities: tourActivities["dhow-snorkeling-safari-blue"] || [],
    FAQs: tourFaqs["dhow-snorkeling-safari-blue"]?.FAQs || [],
    price: 85,
  },
  {
    id: "local-game-fishing",
    imageKey: tourImages.localFishing,
    ...tourDescriptions["local-game-fishing"],
    inclusions: getInclusions("localFishing"),
    whatToBring: whatToBring["localFishing"] || [],
    activities: tourActivities["local-game-fishing"] || [],
    FAQs: tourFaqs["local-game-fishing"]?.FAQs || [],
    price: 60,
  },
  {
    id: "swimming-cave",
    imageKey: tourImages.swimmingCave,
    ...tourDescriptions["swimming-cave"],
    inclusions: getInclusions("swimmingCave"),
    whatToBring: whatToBring["swimmingCave"] || [],
    activities: tourActivities["swimming-cave"] || [],
    FAQs: tourFaqs["swimming-cave"]?.FAQs || [],
    price: 35,
  },
];
