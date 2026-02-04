import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IGeolocationService,
  Coordinates,
  GeocodingResult,
  ReverseGeocodingResult,
  DistanceResult,
  PlaceDetails,
  PlaceAutocompleteResult,
} from './geolocation.interface';

interface GoogleGeocodingResponse {
  results: Array<{
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    place_id: string;
    address_components: Array<{
      long_name: string;
      short_name: string;
      types: string[];
    }>;
  }>;
  status: string;
  error_message?: string;
}

interface GoogleDistanceMatrixResponse {
  rows: Array<{
    elements: Array<{
      distance: {
        value: number;
        text: string;
      };
      duration: {
        value: number;
        text: string;
      };
      status: string;
    }>;
  }>;
  status: string;
  error_message?: string;
}

interface GooglePlaceDetailsResponse {
  result: {
    place_id: string;
    name: string;
    formatted_address: string;
    geometry: {
      location: {
        lat: number;
        lng: number;
      };
    };
    types: string[];
    formatted_phone_number?: string;
    website?: string;
    rating?: number;
    opening_hours?: {
      weekday_text: string[];
    };
  };
  status: string;
  error_message?: string;
}

interface GoogleAutocompleteResponse {
  predictions: Array<{
    place_id: string;
    description: string;
    structured_formatting: {
      main_text: string;
      secondary_text: string;
    };
  }>;
  status: string;
  error_message?: string;
}

@Injectable()
export class GoogleMapsService implements IGeolocationService {
  private readonly logger = new Logger(GoogleMapsService.name);
  private readonly apiKey: string;
  private readonly baseUrl = 'https://maps.googleapis.com/maps/api';

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOOGLE_MAPS_API_KEY') || '';

    if (!this.apiKey) {
      this.logger.warn(
        'GOOGLE_MAPS_API_KEY não configurada. Funcionalidades de geolocalização estarão limitadas.',
      );
    }
  }

  async geocode(address: string): Promise<GeocodingResult | null> {
    try {
      const url = `${this.baseUrl}/geocode/json?address=${encodeURIComponent(address)}&key=${this.apiKey}&language=pt-BR`;

      const response = await fetch(url);
      const data: GoogleGeocodingResponse = await response.json();

      if (data.status !== 'OK' || !data.results.length) {
        this.logger.warn(`Geocoding falhou para endereço: ${address}. Status: ${data.status}`);
        return null;
      }

      const result = data.results[0];
      const addressComponents = this.parseAddressComponents(result.address_components);

      return {
        formattedAddress: result.formatted_address,
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        placeId: result.place_id,
        ...addressComponents,
      };
    } catch (error) {
      this.logger.error(`Erro ao geocodificar endereço: ${address}`, error);
      throw error;
    }
  }

  async reverseGeocode(coordinates: Coordinates): Promise<ReverseGeocodingResult | null> {
    try {
      const url = `${this.baseUrl}/geocode/json?latlng=${coordinates.latitude},${coordinates.longitude}&key=${this.apiKey}&language=pt-BR`;

      const response = await fetch(url);
      const data: GoogleGeocodingResponse = await response.json();

      if (data.status !== 'OK' || !data.results.length) {
        this.logger.warn(
          `Reverse geocoding falhou para coordenadas: ${coordinates.latitude}, ${coordinates.longitude}`,
        );
        return null;
      }

      const result = data.results[0];
      const addressComponents = this.parseAddressComponents(result.address_components);

      return {
        formattedAddress: result.formatted_address,
        placeId: result.place_id,
        ...addressComponents,
      };
    } catch (error) {
      this.logger.error(`Erro ao fazer reverse geocoding`, error);
      throw error;
    }
  }

  async calculateDistance(origin: Coordinates, destination: Coordinates): Promise<DistanceResult> {
    try {
      const url = `${this.baseUrl}/distancematrix/json?origins=${origin.latitude},${origin.longitude}&destinations=${destination.latitude},${destination.longitude}&key=${this.apiKey}&language=pt-BR&units=metric`;

      const response = await fetch(url);
      const data: GoogleDistanceMatrixResponse = await response.json();

      if (data.status !== 'OK') {
        this.logger.warn(`Distance Matrix falhou. Status: ${data.status}`);
        const straightLineDistance = this.calculateStraightLineDistance(origin, destination);
        return {
          distanceInMeters: straightLineDistance * 1000,
          distanceInKilometers: straightLineDistance,
          durationInSeconds: 0,
          durationText: 'N/A',
          distanceText: `${straightLineDistance.toFixed(2)} km (linha reta)`,
        };
      }

      const element = data.rows[0].elements[0];

      if (element.status !== 'OK') {
        const straightLineDistance = this.calculateStraightLineDistance(origin, destination);
        return {
          distanceInMeters: straightLineDistance * 1000,
          distanceInKilometers: straightLineDistance,
          durationInSeconds: 0,
          durationText: 'N/A',
          distanceText: `${straightLineDistance.toFixed(2)} km (linha reta)`,
        };
      }

      return {
        distanceInMeters: element.distance.value,
        distanceInKilometers: element.distance.value / 1000,
        durationInSeconds: element.duration.value,
        durationText: element.duration.text,
        distanceText: element.distance.text,
      };
    } catch (error) {
      this.logger.error(`Erro ao calcular distância`, error);
      throw error;
    }
  }

  calculateStraightLineDistance(origin: Coordinates, destination: Coordinates): number {
    const R = 6371;
    const dLat = this.toRad(destination.latitude - origin.latitude);
    const dLon = this.toRad(destination.longitude - origin.longitude);
    const lat1 = this.toRad(origin.latitude);
    const lat2 = this.toRad(destination.latitude);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  async getPlaceDetails(placeId: string): Promise<PlaceDetails | null> {
    try {
      const fields =
        'place_id,name,formatted_address,geometry,types,formatted_phone_number,website,rating,opening_hours';
      const url = `${this.baseUrl}/place/details/json?place_id=${placeId}&fields=${fields}&key=${this.apiKey}&language=pt-BR`;

      const response = await fetch(url);
      const data: GooglePlaceDetailsResponse = await response.json();

      if (data.status !== 'OK') {
        this.logger.warn(`Place Details falhou para placeId: ${placeId}`);
        return null;
      }

      const result = data.result;

      return {
        placeId: result.place_id,
        name: result.name,
        formattedAddress: result.formatted_address,
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        types: result.types,
        phoneNumber: result.formatted_phone_number,
        website: result.website,
        rating: result.rating,
        openingHours: result.opening_hours?.weekday_text,
      };
    } catch (error) {
      this.logger.error(`Erro ao buscar detalhes do lugar: ${placeId}`, error);
      throw error;
    }
  }

  async autocomplete(input: string, sessionToken?: string): Promise<PlaceAutocompleteResult[]> {
    try {
      let url = `${this.baseUrl}/place/autocomplete/json?input=${encodeURIComponent(input)}&key=${this.apiKey}&language=pt-BR&components=country:br`;

      if (sessionToken) {
        url += `&sessiontoken=${sessionToken}`;
      }

      const response = await fetch(url);
      const data: GoogleAutocompleteResponse = await response.json();

      if (data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        this.logger.warn(`Autocomplete falhou. Status: ${data.status}`);
        return [];
      }

      return data.predictions.map((prediction) => ({
        placeId: prediction.place_id,
        description: prediction.description,
        mainText: prediction.structured_formatting.main_text,
        secondaryText: prediction.structured_formatting.secondary_text,
      }));
    } catch (error) {
      this.logger.error(`Erro ao fazer autocomplete: ${input}`, error);
      throw error;
    }
  }

  private toRad(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private parseAddressComponents(
    components: Array<{ long_name: string; short_name: string; types: string[] }>,
  ): {
    street?: string;
    number?: string;
    neighborhood?: string;
    city?: string;
    state?: string;
    country?: string;
    zipCode?: string;
  } {
    const result: {
      street?: string;
      number?: string;
      neighborhood?: string;
      city?: string;
      state?: string;
      country?: string;
      zipCode?: string;
    } = {};

    for (const component of components) {
      if (component.types.includes('route')) {
        result.street = component.long_name;
      }
      if (component.types.includes('street_number')) {
        result.number = component.long_name;
      }
      if (
        component.types.includes('sublocality') ||
        component.types.includes('sublocality_level_1')
      ) {
        result.neighborhood = component.long_name;
      }
      if (
        component.types.includes('administrative_area_level_2') ||
        component.types.includes('locality')
      ) {
        result.city = component.long_name;
      }
      if (component.types.includes('administrative_area_level_1')) {
        result.state = component.short_name;
      }
      if (component.types.includes('country')) {
        result.country = component.long_name;
      }
      if (component.types.includes('postal_code')) {
        result.zipCode = component.long_name;
      }
    }

    return result;
  }
}
