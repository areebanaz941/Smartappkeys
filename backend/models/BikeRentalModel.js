// bikesInventory.js
// Model file for bike inventory

class BikeModel {
  constructor({
    id,
    name,
    description,
    price,
    details,
    setup,
    specifications,
    type,
    images = [],
    status = 'active'
  }) {
    this.id = id;
    this.name = name;
    this.description = description;
    this.price = price;
    this.details = details;
    this.setup = setup;
    this.specifications = specifications;
    this.type = type || 'Bike'; // Default type is Bike
    this.images = images;
    this.status = status;
  }
}

// Sample bike inventory based on the SUV data
const bikesInventory = [
  new BikeModel({
    id: "trek-suv-001",
    name: "SUV",
    description: "The Trekking SUV is the perfect e-bike for those looking for versatility and comfort in any situation.",
    price: 3290, // in Euros
    details: "The Trekking SUV is the perfect e-bike for those looking for versatility and comfort in every situation. Equipped with a dual-suspension frame with semi-integrated rear monoshock, it combines a clean and elegant design with high-level performance. Ideal for urban routes and more adventurous excursions, it also easily adapts to dirt roads and more challenging terrain. Thanks to the 48V platform, tackling steep climbs becomes simple, while the 720Wh (48V) battery guarantees the autonomy necessary to explore ever greater distances.",
    setup: "The SUV model is equipped with a 100Nm XP central motor (48V) and a 48V-15Ah-720Wh semi-integrated battery. The gearing is the Shimano Altus M370 9-speed and the brakes are 180mm hydraulic discs. You will also be able to control all the functions of your e-bike, through a new color LCD display.",
    specifications: {
      chassis: "27.5\" aluminum suspension",
      motor: "XP control panel 48V-250W XP (100Nm)",
      battery: "48V20Ah 960Wh",
      gearing: "Shimano Altus M370, 9-speed",
      brakes: "Hydraulic disc, 180mm",
      tires: "CST 27.5\" x 2.4\"",
      display: "COLOR LCD Sport, with 5 levels of assistance for each mode (ECO-NORMAL)",
      handlebar: "Adjustable in aluminum",
      fork: "Suntour SF 14-MT-E45-DS-LO, 29\""
    },
    type: "Bike",
    images: ["/uploads/bikes/suv-main.jpg", "/uploads/bikes/suv-side.jpg"],
    status: "active"
  }),
  
  // Additional sample bikes with different types
  new BikeModel({
    id: "city-bike-001",
    name: "City Cruiser",
    description: "Comfortable electric bike designed for urban commuting and city exploration.",
    price: 2490,
    details: "The City Cruiser is designed for comfortable urban riding with an upright position and smooth electric assistance. Perfect for commuting, running errands, or leisure rides around the city.",
    setup: "Features a 48V front hub motor with a removable 48V-10Ah-480Wh battery integrated in the downtube. Equipped with fenders, rear rack, and integrated lights for practical city use.",
    specifications: {
      chassis: "Aluminum city frame, step-through design",
      motor: "48V-250W front hub motor (60Nm)",
      battery: "48V10Ah 480Wh removable",
      gearing: "Shimano Tourney, 7-speed",
      brakes: "Mechanical disc, 160mm",
      tires: "CST 26\" x 2.0\" with puncture protection",
      display: "LCD display with 3 assistance levels",
      handlebar: "Comfort handlebar in aluminum",
      fork: "Suspension fork with lockout, 60mm travel"
    },
    type: "Bike",
    images: ["/uploads/bikes/city-cruiser.jpg"],
    status: "active"
  }),
  
  new BikeModel({
    id: "mtb-001",
    name: "Mountain Explorer",
    description: "Powerful electric mountain bike for challenging terrain and off-road adventures.",
    price: 3990,
    details: "The Mountain Explorer is built for serious off-road performance with a powerful motor and robust frame. Conquer difficult trails and steep climbs with ease while enjoying responsive handling on descents.",
    setup: "Features a powerful mid-drive Bosch Performance CX motor and a large capacity 625Wh battery for extended trail riding. Full suspension system with 150mm travel for maximum comfort on rough terrain.",
    specifications: {
      chassis: "Aluminum alloy full suspension, 150mm travel",
      motor: "Bosch Performance CX, 85Nm",
      battery: "Bosch PowerTube 625Wh, integrated",
      gearing: "SRAM NX Eagle, 12-speed",
      brakes: "Hydraulic disc, 203mm front/180mm rear",
      tires: "Maxxis Minion 29\" x 2.6\" tubeless ready",
      display: "Bosch Purion compact display",
      handlebar: "Aluminum alloy riser bar, 780mm",
      fork: "RockShox 35 Gold RL, 150mm travel"
    },
    type: "Bike",
    images: ["/uploads/bikes/mountain-explorer.jpg"],
    status: "active"
  }),
  
  new BikeModel({
    id: "fold-001",
    name: "Compact Folder",
    description: "Foldable electric bike perfect for commuters and travelers with limited storage space.",
    price: 1890,
    details: "The Compact Folder is designed for urban mobility with storage constraints. Easily folds to fit in car trunks, under desks, or on public transport. Despite its small size, it delivers reliable performance for daily commuting.",
    setup: "Equipped with a 36V rear hub motor and a compact but efficient 36V-7.8Ah battery. Features quick-folding mechanism that allows the bike to be folded in under 20 seconds.",
    specifications: {
      chassis: "Aluminum folding frame",
      motor: "36V-250W rear hub motor (40Nm)",
      battery: "36V7.8Ah 280Wh",
      gearing: "Shimano Tourney, 6-speed",
      brakes: "Mechanical disc, 160mm",
      tires: "20\" x 1.75\" with reflective sidewalls",
      display: "LED control panel with battery indicator",
      handlebar: "Folding handlebar with quick release",
      fork: "Rigid aluminum fork"
    },
    type: "Bike",
    images: ["/uploads/bikes/compact-folder.jpg"],
    status: "active"
  }),
  
  // Adding a motorcycle type
  new BikeModel({
    id: "mc-sport-001",
    name: "Sport Rider",
    description: "High-performance electric motorcycle with sporty design and powerful acceleration.",
    price: 8990,
    details: "The Sport Rider combines sleek design with exhilarating performance. This electric motorcycle delivers instant torque and smooth acceleration while maintaining zero emissions. Perfect for thrill-seekers who also care about the environment.",
    setup: "Powered by a high-output electric motor delivering 15kW peak power and a 7kWh lithium-ion battery pack. Features regenerative braking system and multiple riding modes for different conditions.",
    specifications: {
      chassis: "Lightweight aluminum perimeter frame",
      motor: "15kW peak power electric motor (130Nm)",
      battery: "7kWh lithium-ion battery pack",
      gearing: "Direct drive, single-speed",
      brakes: "Dual hydraulic disc, 320mm front/260mm rear",
      tires: "Sport compound 120/70-17 front, 160/60-17 rear",
      display: "5\" TFT color display with connectivity",
      handlebar: "Clip-on aluminum handlebars",
      fork: "Inverted fork, fully adjustable, 120mm travel"
    },
    type: "Motorcycle",
    images: ["/uploads/motorcycles/sport-rider.jpg"],
    status: "active"
  }),
  
  // Adding a regular cycle type
  new BikeModel({
    id: "cyc-001",
    name: "Urban Commuter",
    description: "Lightweight and efficient non-electric bicycle for city commuting.",
    price: 890,
    details: "The Urban Commuter is a traditional bicycle built for efficient city travel. With its lightweight frame and efficient gearing, it's perfect for fitness-minded commuters who prefer a conventional riding experience.",
    setup: "Features an aluminum frame with carbon fork for reduced weight and vibration dampening. Equipped with puncture-resistant tires and weather-sealed components for year-round reliability.",
    specifications: {
      chassis: "Lightweight aluminum frame",
      motor: "N/A (non-electric)",
      battery: "N/A (non-electric)",
      gearing: "Shimano Tiagra, 10-speed",
      brakes: "Hydraulic disc, 160mm",
      tires: "Continental Grand Prix 5000, 700x32c",
      display: "N/A (non-electric)",
      handlebar: "Drop bar, aluminum",
      fork: "Carbon fork with aluminum steerer"
    },
    type: "Cycle",
    images: ["/uploads/cycles/urban-commuter.jpg"],
    status: "active"
  })
];

// Export both the model class and the inventory
module.exports = {
  BikeModel,
  bikesInventory
};

// Alternative export for ES modules
// export { BikeModel, bikesInventory };