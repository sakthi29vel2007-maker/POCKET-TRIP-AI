export type TravelStyle = 
  | 'Budget'
  | 'Comfortable'
  | 'Backpacker'
  | 'Family'
  | 'Couple'
  | 'Adventure'
  | 'Luxury';

export type Interest = 
  | 'Nature'
  | 'Beach'
  | 'Mountains'
  | 'Adventure'
  | 'History'
  | 'Temples'
  | 'Food'
  | 'Shopping'
  | 'Photography'
  | 'Wildlife'
  | 'Culture'
  | 'Nightlife';

export interface TransportOption {
  type: 'Bus' | 'Train' | 'Car' | 'Flight' | 'Train + Bus';
  operator: string;
  farePerPerson: number;
  duration: string;
  departure: string;
  arrival: string;
  distanceKm: number;
  description?: string;
}

export interface StayOption {
  id: string;
  name: string;
  type: string;
  pricePerNight: number;
  rating: number;
  amenities: string[];
  distance: string;
  roomType: string;
  imageUrl?: string;
}

export interface FoodDish {
  name: string;
  meal: 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner';
  estPrice: number;
  description: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  category: Interest;
  cost: number;
  duration: string;
  location: string;
  openingHours: string;
  description: string;
  highlight?: boolean;
}

export interface ItineraryStop {
  time: string;
  title: string;
  type: 'transit' | 'stay' | 'meal' | 'activity' | 'viewpoint';
  cost: number;
  location: string;
  description: string;
}

export interface DayItinerary {
  dayNumber: number;
  dayTitle: string;
  theme: string;
  stops: ItineraryStop[];
}

export interface Destination {
  id: string;
  name: string;
  slug: string;
  state: string;
  region: 'South India' | 'North India' | 'West India' | 'East India';
  description: string;
  heroImage: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  weather: {
    temp: string;
    condition: string;
  };
  bestTime: string;
  recommendedDays: number;
  interests: Interest[];
  defaultDistanceKm: number;
  distanceFrom: Record<string, { km: number; duration: string }>;
  
  // Stays
  stays: StayOption[];
  
  // Transport template
  transportOptions: TransportOption[];

  // Food plan
  dailyFood: {
    breakfast: { cost: number; items: string[] };
    lunch: { cost: number; items: string[] };
    snacks: { cost: number; items: string[] };
    dinner: { cost: number; items: string[] };
    signatureDishes: FoodDish[];
  };

  // Activities
  activities: ActivityItem[];

  // Itinerary template generator helper
  itineraryTemplate: DayItinerary[];

  nearbyDestinations: string[];
}

export interface BudgetBreakdown {
  transport: number;
  stay: number;
  food: number;
  localTransport: number;
  activities: number;
  total: number;
  remaining: number;
  costPerPerson: number;
  percentPlanned: number;
}

export interface TripPlan {
  id: string;
  destination: Destination;
  origin: string;
  travellers: number;
  days: number;
  travelDate: string;
  isFlexible: boolean;
  travelStyle: TravelStyle;
  selectedInterests: Interest[];
  userBudget: number;
  breakdown: BudgetBreakdown;
  selectedTransport: TransportOption;
  selectedStay: StayOption;
  itinerary: DayItinerary[];
  budgetFitPercent: number;
  interestMatchPercent: number;
  isWithinBudget: boolean;
  savedAt?: string;
  customNotes?: string;
}

export interface UserPreferences {
  origin: string;
  budget: number;
  travellers: number;
  days: number;
  travelDate: string;
  isFlexible: boolean;
  travelStyle: TravelStyle;
  interests: Interest[];
}
