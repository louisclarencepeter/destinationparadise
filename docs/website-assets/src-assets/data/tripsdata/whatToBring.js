// whatToBring.js

const commonItems = {
  swimwear: "Swimwear",
  sunscreen: "Sunscreen",
  towel: "Towel",
  camera: "Camera",
  comfortableShoes: "Comfortable shoes",
  comfortableClothing: "Comfortable clothing",
  hat: "Hat",
  waterBottle: "Water bottle",
  bugRepellent: "Bug repellent",
  validDrivingLicense: "Valid driving license",
  sunglasses: "Sunglasses",
  closedToeShoes: "Closed-toe shoes",
  waterproofBag: "Waterproof bag",
};

export const whatToBring = {
  spiceTour: [commonItems.comfortableShoes, commonItems.sunscreen, commonItems.camera],
  historicalCityTour: [commonItems.comfortableShoes, commonItems.hat, commonItems.waterBottle],
  prisonIsland: [commonItems.swimwear, commonItems.sunscreen, commonItems.towel],
  jozaniForest: [commonItems.comfortableShoes, commonItems.sunscreen, commonItems.bugRepellent],
  dolphinTour: [commonItems.swimwear, commonItems.sunscreen, commonItems.towel, commonItems.camera],
  sunsetRock: ["Casual attire", commonItems.camera, `${commonItems.swimwear} (optional)`],
  snorkeling: [commonItems.swimwear, commonItems.sunscreen, commonItems.towel],
  villageTour: [commonItems.comfortableShoes, commonItems.sunscreen, commonItems.waterBottle],
  motorbikeRenting: [commonItems.validDrivingLicense, commonItems.sunscreen, commonItems.comfortableClothing],
  mnembaSnorkeling: [commonItems.swimwear, commonItems.towel, commonItems.sunscreen],
  safariBlue: [commonItems.swimwear, commonItems.towel, commonItems.sunscreen, commonItems.camera],
  localFishing: [commonItems.hat, commonItems.sunscreen, commonItems.comfortableClothing],
  swimmingCave: [commonItems.swimwear, commonItems.towel, commonItems.waterproofBag],
  sandbankPicnic: [commonItems.swimwear, commonItems.towel, commonItems.sunscreen, commonItems.camera],
  kizimkaziFishing: [commonItems.comfortableClothing, commonItems.sunscreen, commonItems.hat, commonItems.camera],
  nungwiTrip: [commonItems.comfortableShoes, commonItems.swimwear, commonItems.sunscreen, commonItems.camera],
  quadAdventure: [commonItems.comfortableClothing, commonItems.sunscreen, commonItems.sunglasses, commonItems.closedToeShoes, commonItems.camera],
  sunsetTrip: [
    "Comfortable, casual attire",
    "Camera",
    "Light jacket or shawl"
  ],
  sunsetSailing: [
    "Light jacket or shawl",
    "Comfortable, casual clothing",
    "Camera",
    "Sunglasses",
    "Sunscreen"
  ],
};
