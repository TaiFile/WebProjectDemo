export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface GeocodingResult {
  formattedAddress: string;
  latitude: number;
  longitude: number;
  placeId: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
}

export interface ReverseGeocodingResult {
  formattedAddress: string;
  street?: string;
  number?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  placeId: string;
}

export interface DistanceResult {
  distanceInMeters: number;
  distanceInKilometers: number;
  durationInSeconds: number;
  durationText: string;
  distanceText: string;
}

export interface PlaceDetails {
  placeId: string;
  name: string;
  formattedAddress: string;
  latitude: number;
  longitude: number;
  types: string[];
  phoneNumber?: string;
  website?: string;
  rating?: number;
  openingHours?: string[];
}

export interface PlaceAutocompleteResult {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

export interface IGeolocationService {
  geocode(address: string): Promise<GeocodingResult | null>;

  reverseGeocode(coordinates: Coordinates): Promise<ReverseGeocodingResult | null>;

  calculateDistance(origin: Coordinates, destination: Coordinates): Promise<DistanceResult>;

  calculateStraightLineDistance(origin: Coordinates, destination: Coordinates): number;

  getPlaceDetails(placeId: string): Promise<PlaceDetails | null>;

  autocomplete(input: string, sessionToken?: string): Promise<PlaceAutocompleteResult[]>;
}
