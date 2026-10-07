import { Destination, TripPlan, UserPreferences, BudgetBreakdown, StayOption, TransportOption, DayItinerary } from '../types';
import { DESTINATIONS } from '../data/destinations';

export function calculateTripForDestination(
  destination: Destination,
  prefs: UserPreferences
): TripPlan {
  const { origin, budget, travellers, days, travelStyle, interests } = prefs;
  const nights = Math.max(1, days - 1);
  const roomsNeeded = Math.max(1, Math.ceil(travellers / 2));

  // 1. Distance & Transit
  const distInfo = destination.distanceFrom[origin] || {
    km: destination.defaultDistanceKm,
    duration: '5h 00m',
  };

  // 2. Transport selection based on travel style & budget scale
  let selectedTransport = destination.transportOptions[0]; // default bus
  if (travelStyle === 'Luxury') {
    const flightOrCar = destination.transportOptions.find(t => t.type === 'Flight' || t.type === 'Car');
    if (flightOrCar) selectedTransport = flightOrCar;
  } else if (travelStyle === 'Comfortable' || travelStyle === 'Family' || travelStyle === 'Couple') {
    const trainOrCar = destination.transportOptions.find(t => t.type === 'Train' || t.type === 'Train + Bus' || t.type === 'Car');
    if (trainOrCar) selectedTransport = trainOrCar;
  } else {
    // Budget or backpacker - pick the most cost effective option
    const budgetTrans = [...destination.transportOptions].sort((a, b) => a.farePerPerson - b.farePerPerson)[0];
    if (budgetTrans) selectedTransport = budgetTrans;
  }

  // Transport total (round trip for all travellers)
  // If private car, cost is per vehicle (not strictly multiplied by travellers up to 4)
  let transportTotal = 0;
  if (selectedTransport.type === 'Car') {
    const vehiclesNeeded = Math.ceil(travellers / 4);
    transportTotal = selectedTransport.farePerPerson * 2 * Math.max(1, travellers * 0.75);
  } else {
    transportTotal = selectedTransport.farePerPerson * 2 * travellers;
  }

  // 3. Stay selection based on travel style and budget availability
  let stayTierIndex = 0; // 0 = budget, 1 = mid, 2 = luxury
  if (travelStyle === 'Luxury' || budget >= 50000) {
    stayTierIndex = Math.min(2, destination.stays.length - 1);
  } else if (travelStyle === 'Comfortable' || travelStyle === 'Couple' || (budget >= 15000 && destination.stays.length > 1)) {
    stayTierIndex = Math.min(1, destination.stays.length - 1);
  } else {
    stayTierIndex = 0;
  }
  const selectedStay: StayOption = destination.stays[stayTierIndex] || destination.stays[0];
  const stayTotal = selectedStay.pricePerNight * nights * roomsNeeded;

  // 4. Food calculation
  let dailyFoodPerPerson = 600;
  if (travelStyle === 'Luxury') {
    dailyFoodPerPerson = 1500;
  } else if (travelStyle === 'Comfortable' || travelStyle === 'Couple') {
    dailyFoodPerPerson = 900;
  } else if (travelStyle === 'Budget' || travelStyle === 'Backpacker') {
    dailyFoodPerPerson = 550;
  }
  const foodTotal = dailyFoodPerPerson * days * travellers;

  // 5. Local transport
  let dailyLocalTransport = 350;
  if (travelStyle === 'Luxury') {
    dailyLocalTransport = 1800; // private cab for sightseeing
  } else if (travelStyle === 'Comfortable' || travelStyle === 'Family') {
    dailyLocalTransport = 800;
  } else if (travelStyle === 'Backpacker') {
    dailyLocalTransport = 250; // scooter rental or public buses
  }
  const localTransportTotal = dailyLocalTransport * days;

  // 6. Activities calculation
  // Pick matching interest activities
  const matchingActivities = destination.activities.filter(act => 
    interests.length === 0 || interests.includes(act.category) || act.highlight
  );
  const chosenActivities = matchingActivities.length > 0 
    ? matchingActivities.slice(0, Math.min(4, matchingActivities.length))
    : destination.activities.slice(0, 3);
  
  const activitiesPerPerson = chosenActivities.reduce((acc, a) => acc + a.cost, 0);
  const activitiesTotal = activitiesPerPerson * travellers;

  // 7. Sum Breakdown
  const totalCost = Math.round(transportTotal + stayTotal + foodTotal + localTransportTotal + activitiesTotal);
  const remaining = budget - totalCost;
  const costPerPerson = Math.round(totalCost / travellers);
  const percentPlanned = Math.min(100, Math.round((totalCost / budget) * 100));

  const breakdown: BudgetBreakdown = {
    transport: Math.round(transportTotal),
    stay: Math.round(stayTotal),
    food: Math.round(foodTotal),
    localTransport: Math.round(localTransportTotal),
    activities: Math.round(activitiesTotal),
    total: totalCost,
    remaining: remaining,
    costPerPerson,
    percentPlanned,
  };

  // 8. Match scores
  // Budget fit: highest if total <= budget. If over budget, drops.
  let budgetFitPercent = 100;
  if (totalCost > budget) {
    const overageRatio = (totalCost - budget) / budget;
    budgetFitPercent = Math.max(10, Math.round(100 - overageRatio * 150));
  } else {
    // If very far under budget (e.g. ₹5,000 trip for ₹1,00,000 budget), slight penalty so premium trips rank higher for big budgets
    const underRatio = remaining / budget;
    if (underRatio > 0.7 && budget > 30000) {
      budgetFitPercent = Math.max(70, Math.round(100 - (underRatio - 0.7) * 40));
    }
  }

  // Interest match score
  let interestMatchPercent = 85;
  if (interests.length > 0) {
    const overlap = destination.interests.filter(i => interests.includes(i)).length;
    interestMatchPercent = Math.min(99, Math.round(60 + (overlap / interests.length) * 39));
  }

  // Adjust itinerary length to matching days
  const fullItinerary = generateTailoredItinerary(destination, days, origin);

  return {
    id: `${destination.id}-${Date.now()}`,
    destination,
    origin,
    travellers,
    days,
    travelDate: prefs.travelDate,
    isFlexible: prefs.isFlexible,
    travelStyle,
    selectedInterests: interests,
    userBudget: budget,
    breakdown,
    selectedTransport,
    selectedStay,
    itinerary: fullItinerary,
    budgetFitPercent,
    interestMatchPercent,
    isWithinBudget: totalCost <= budget,
  };
}

// Generate intelligent days based on request
function generateTailoredItinerary(destination: Destination, days: number, origin: string): DayItinerary[] {
  const base = destination.itineraryTemplate;
  if (days <= base.length) {
    return base.slice(0, days);
  }

  // If user requested more days than template, extrapolate extra exploration days
  const extended: DayItinerary[] = [...base];
  for (let i = base.length + 1; i <= days; i++) {
    extended.push({
      dayNumber: i,
      dayTitle: `Local Culture, Scenic Exploration & Leisure (Day ${i})`,
      theme: 'Hidden Trails & Village Life',
      stops: [
        { time: '08:30 AM', title: 'Slow Morning Breakfast & Local Walk', type: 'meal', cost: 140, location: 'Old Quarter', description: 'Enjoy relaxed morning tea and traditional regional breakfast.' },
        { time: '10:30 AM', title: 'Hidden Nature Trail & Photography', type: 'activity', cost: 60, location: 'Valley Outskirts', description: 'Explore lesser-known scenic ridges, organic farms, and artisan workshops.' },
        { time: '01:30 PM', title: 'Leisurely Traditional Lunch', type: 'meal', cost: 220, location: 'Local Garden Cafe', description: 'Sample authentic regional specialties with fresh seasonal ingredients.' },
        { time: '04:30 PM', title: 'Sunset Viewpoint & Artisan Shopping', type: 'viewpoint', cost: 0, location: 'High Point', description: 'Watch changing dusk colors and browse authentic handicraft stalls.' },
        { time: '07:30 PM', title: 'Dinner & Leisure Evening', type: 'meal', cost: 250, location: 'Town Bistro', description: 'Relaxing dinner under the stars.' },
      ],
    });
  }
  return extended;
}

// Calculate all affordable destinations sorted by smart fit
export function findDestinationsForBudget(prefs: UserPreferences): TripPlan[] {
  const plans = DESTINATIONS.map(dest => calculateTripForDestination(dest, prefs));

  // Prioritize trips within budget, then close stretches, sorted by overall composite score
  plans.sort((a, b) => {
    // 1. First priority: strictly within budget or within 10%
    const aWithin = a.isWithinBudget;
    const bWithin = b.isWithinBudget;
    if (aWithin && !bWithin) return -1;
    if (!aWithin && bWithin) return 1;

    // 2. If both within budget, calculate composite score
    // Composite: Budget Fit (40%) + Interest Match (35%) + Budget Utilization (25%)
    // (We want trips that make the most of the user's budget without exceeding it)
    const aUtil = 100 - (a.breakdown.remaining / a.userBudget) * 50;
    const bUtil = 100 - (b.breakdown.remaining / b.userBudget) * 50;

    const aScore = a.budgetFitPercent * 0.4 + a.interestMatchPercent * 0.35 + aUtil * 0.25;
    const bScore = b.budgetFitPercent * 0.4 + b.interestMatchPercent * 0.35 + bUtil * 0.25;
    return bScore - aScore;
  });

  return plans;
}

// "What can I get for my budget?" Section helper
export interface BudgetPossibilityCategory {
  title: string;
  emoji: string;
  description: string;
  exampleDestination: string;
  highlights: string[];
}

export function getBudgetPossibilities(budget: number): BudgetPossibilityCategory[] {
  if (budget <= 6000) {
    return [
      {
        title: 'Budget Hill Station Escape',
        emoji: '🌄',
        description: '2 Days / 1 Night in misty heights with scenic state bus climb, cozy backpacker hostel, and pine forest walks.',
        exampleDestination: 'Kodaikanal or Yercaud',
        highlights: ['Local express bus transit', 'Cozy backpacker guesthouse', 'Lake boating & nature walks', 'Hot street corn & piping tea'],
      },
      {
        title: 'Coastal Heritage Getaway',
        emoji: '🏖',
        description: 'Island sea breeze, historic railway sea bridge, sacred morning corridors, and ghost town jeep exploration.',
        exampleDestination: 'Rameswaram or Dhanushkodi',
        highlights: ['Scenic train across Pamban bridge', 'Clean pilgrim lodge near sea', 'Dhanushkodi 4x4 beach drive', 'Traditional banana leaf thali'],
      },
      {
        title: 'Nature & Waterfalls Break',
        emoji: '🌿',
        description: 'Cascading milky falls, lush tea foothills, and fresh organic spice garden walks.',
        exampleDestination: 'Courtallam / Pollachi',
        highlights: ['Direct bus connectivity', 'Lakeside budget stay', 'Free natural waterfall dips', 'Fresh coconut & local snacks'],
      },
      {
        title: 'Legendary Food & Culture Trail',
        emoji: '🍛',
        description: 'Street food safari diving into world-famous idlis, spicy pepper roasts, and night market desserts.',
        exampleDestination: 'Madurai or Trichy',
        highlights: ['Local shared transport', 'Iconic culinary mess dining', 'Ancient architectural marvels', 'Jigarthanda & kari dosa'],
      },
    ];
  } else if (budget <= 15000) {
    return [
      {
        title: 'Romantic Hill Station Retreat',
        emoji: '🌄',
        description: '3 Days / 2 Nights in charming private mountain cottages, cloud-walking cliff trails, and artisanal chocolate shopping.',
        exampleDestination: 'Kodaikanal or Ooty',
        highlights: ['Deluxe mountain view room', 'UNESCO Toy Train or ghat bus', 'Dolphin’s Nose cliff trek', 'Tibetan momos & handmade chocolates'],
      },
      {
        title: 'French Riviera & Beach Cafes',
        emoji: '🏖',
        description: 'Pastel yellow colonial French villas, vintage bicycle rides on cobblestone streets, and oceanfront promenade sunsets.',
        exampleDestination: 'Pondicherry (White Town)',
        highlights: ['Boutique colonial villa stay', 'Auroville & Matrimandir peaceful visit', 'Speedboat to Paradise Beach', 'French pastries, woodfired pizza & gelato'],
      },
      {
        title: 'Misty Tea Plantation Safari',
        emoji: '🌿',
        description: 'Wake up to endless green tea carpets, roaring waterfalls, tea factory tastings, and cool 15°C mountain air.',
        exampleDestination: 'Munnar or Valparai',
        highlights: ['Tea estate view hotel with balcony', 'Eravikulam mountain goat sanctuary', 'Speedboat at Mattupetty dam', 'Authentic Kerala appam & stew feast'],
      },
      {
        title: 'Sacred Island & Coastal Lagoon',
        emoji: '🏛',
        description: 'Walk through 1,200 ancient stone pillars, sunset over Pamban bridge, and pristine shallow turquoise ocean waters.',
        exampleDestination: 'Rameswaram & Dhanushkodi',
        highlights: ['Comfortable AC hotel stay', 'Land’s End private jeep tour', 'Corridor photography & Dr. Kalam memorial', 'Unlimited seafood / Brahmin feast'],
      },
    ];
  } else if (budget <= 35000) {
    return [
      {
        title: 'Coffee Estate & Heritage Palace Tour',
        emoji: '☕',
        description: '4 Days / 3 Nights staying inside an aromatic coffee plantation, trekking Abbey falls, and visiting Tibetan golden monasteries.',
        exampleDestination: 'Coorg & Mysuru',
        highlights: ['Private estate wooden cottage with bonfire', 'Coffee bean harvesting & tasting tour', 'Dubare elephant river bathing', 'Traditional Kodava pandi/veg feasts'],
      },
      {
        title: 'UNESCO Boulder Kingdom & Hippie Island',
        emoji: '🏛',
        description: 'Ancient 14th-century Vijayanagara ruins, musical pillars, coracle boat rapids, and rooftop hammock chillout cafes.',
        exampleDestination: 'Hampi',
        highlights: ['Heritage stone resort stay', 'Sunset atop Matanga boulder peak', 'Coracle ride down Tungabhadra river', 'Stone chariot & royal palace exploration'],
      },
      {
        title: 'Tropical Backwater Houseboat & Cliffs',
        emoji: '🌴',
        description: 'Glide on private shikaras through palm-fringed canals, relax on red laterite ocean cliffs, and surf gentle waves.',
        exampleDestination: 'Alleppey & Varkala',
        highlights: ['Canal-front heritage homestay or houseboat', 'North Cliff sunset candlelit dinner', 'Mineral springs & paddleboarding', 'Karimeen in banana leaf & fresh juices'],
      },
      {
        title: 'Royal Pink City & Rajput Forts',
        emoji: '🏰',
        description: 'Explore the grand Sheesh Mahal, watch dusk over Jaipur from Nahargarh fort, and feast on royal dal baati churma.',
        exampleDestination: 'Jaipur (Pink City)',
        highlights: ['Heritage haveli stay with courtyard', 'Amer Fort & mirror palace guided tour', 'Hawa Mahal & Johari Bazaar shopping', 'Royal thali & creamy kulhad lassi'],
      },
    ];
  } else {
    return [
      {
        title: 'Luxury Heritage Palace & Private Safaris',
        emoji: '👑',
        description: '5+ Days of premier royal hospitality, private chauffeurs, palace heritage suites, and bespoke cultural experiences.',
        exampleDestination: 'Jaipur, Udaipur, or Coorg Luxury',
        highlights: ['5-star palace or villa with private pool', 'Chauffeured luxury SUV throughout trip', 'Curated fine dining & private terrace dinners', 'VIP heritage access & bespoke guides'],
      },
      {
        title: 'Exclusive Backwater & Wellness Sanctuary',
        emoji: '⛵',
        description: 'Private 1-bedroom luxury air-conditioned Kettuvallam houseboat with personal chef, captain, and Ayurvedic spa treatments.',
        exampleDestination: 'Alleppey & Kumarakom',
        highlights: ['Private luxury houseboat cruising Vembanad lake', 'All inclusive 4-course chef prepared meals', 'Ayurvedic rejuvenating massage treatments', 'Sunset canoe cruises through secluded canals'],
      },
      {
        title: 'High-Altitude Luxury Cloud Chalet',
        emoji: '🏔',
        description: 'Panoramic mountain chalets, private jacuzzis, off-road 4x4 safaris to highest peaks, and private bonfires.',
        exampleDestination: 'Munnar & Kodaikanal Luxury',
        highlights: ['Boutique cloud chalet with private jacuzzi', 'Kolukkumalai 4x4 sunrise summit tour', 'Gourmet mountain dining & high tea', 'Private naturalists for private estate walks'],
      },
      {
        title: 'Grand South Indian Heritage Odyssey',
        emoji: '✨',
        description: 'Multi-destination grand route covering hill stations, French seaside white town, and ancient temple corridors.',
        exampleDestination: 'Kodai + Pondicherry + Rameswaram',
        highlights: ['Seamless private transit between destinations', 'Curated boutique hotels at every stop', 'Full guided sightseeing & all culinary meals', 'Stress-free complete door-to-door itinerary'],
      },
    ];
  }
}

// "What happens if I increase my budget?" dynamic calculator
export interface BudgetIncreasePerks {
  newBudget: number;
  addedAmount: number;
  hotelUpgrade: string;
  transportUpgrade: string;
  activityAddon: string;
  culinaryAddon: string;
  durationOption: string;
}

export function calculateBudgetIncreasePerks(
  currentPlan: TripPlan,
  addedAmount: number
): BudgetIncreasePerks {
  const newBudget = currentPlan.userBudget + addedAmount;
  const dest = currentPlan.destination;

  let hotelUpgrade = 'Upgrade to a Deluxe Valley View Room with private balcony and complimentary breakfast';
  if (addedAmount >= 10000) {
    hotelUpgrade = 'Unlock 4-Star Boutique Resort with heated pool, private fireplace, and lawn bonfires';
  } else if (addedAmount >= 5000) {
    hotelUpgrade = 'Upgrade to Premium Heritage Suite with mountain vista and luxury bath amenities';
  }

  let transportUpgrade = 'Upgrade from ordinary bus to AC Semi-Sleeper or comfortable reserved train coach';
  if (addedAmount >= 10000) {
    transportUpgrade = 'Switch to a private dedicated AC sedan cab with door-to-door hotel pickup and scenic stops';
  } else if (addedAmount >= 4000) {
    transportUpgrade = 'Upgrade to premium Volvo multi-axle sleeper bus with personal charging and reclining beds';
  }

  let activityAddon = 'Add scenic boat cruise or guided heritage walking tour with expert local storyteller';
  if (dest.id === 'munnar') {
    activityAddon = 'Add thrilling Kolukkumalai 4x4 off-road jeep safari to the highest sunrise peak';
  } else if (dest.id === 'kodaikanal') {
    activityAddon = 'Add Dolphin’s Nose guided pine trek, cycle rental, and boating session';
  } else if (dest.id === 'pondicherry') {
    activityAddon = 'Add private speedboat cruise to Paradise Beach and scuba diving / surfing session';
  } else if (dest.id === 'rameswaram') {
    activityAddon = 'Add private 4x4 Dhanushkodi sand dunes safari and ocean coral boat tour';
  }

  let culinaryAddon = 'Indulge in a signature candlelit dinner featuring authentic multi-course local delicacies';
  if (addedAmount >= 5000) {
    culinaryAddon = 'Enjoy fine dining multi-course dinner with artisan desserts and signature beverage tastings';
  }

  const durationOption = `Extend your trip by +1 Day (${currentPlan.days + 1} Days / ${currentPlan.days} Nights) without rushing`;

  return {
    newBudget,
    addedAmount,
    hotelUpgrade,
    transportUpgrade,
    activityAddon,
    culinaryAddon,
    durationOption,
  };
}

// Format currency in Indian numbering format (e.g. ₹10,000, ₹1,00,000)
export function formatINR(amount: number): string {
  if (isNaN(amount)) return '₹0';
  return '₹' + amount.toLocaleString('en-IN');
}
