import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  AddressesRepository,
  CreateAddressData,
  UpdateAddressData,
} from './repositories/addresses.repository';
import { GoogleMapsService } from '@infrastructure/geolocation/google-maps.service';
import { AddressResponseDto } from './dtos/address-response.dto';
import { CreateAddressDto, UpdateAddressDto } from './dtos/address.dto';
import { Address } from '@prisma/client';
import {
  Coordinates,
  GeocodingResult,
  ReverseGeocodingResult,
  DistanceResult,
  PlaceAutocompleteResult,
} from '@infrastructure/geolocation/geolocation.interface';

export interface AddressListResponse {
  addresses: AddressResponseDto[];
  total: number;
}

export interface DistanceCalculationResult {
  origin: AddressResponseDto | Coordinates;
  destination: AddressResponseDto | Coordinates;
  distance: DistanceResult;
}

export interface NearbyAddressResult {
  address: AddressResponseDto;
  distanceInKm: number;
}

@Injectable()
export class AddressesService {
  constructor(
    private addressesRepository: AddressesRepository,
    private googleMapsService: GoogleMapsService,
  ) {}

  async create(userId: string, dto: CreateAddressDto): Promise<AddressResponseDto> {
    if (dto.isDefault) {
      await this.addressesRepository.clearDefaultForUser(userId);
    }

    let geocodeResult: GeocodingResult | null = null;

    if (!dto.latitude || !dto.longitude) {
      const addressString = this.buildAddressString(dto);
      geocodeResult = await this.googleMapsService.geocode(addressString);
    }

    const createData: CreateAddressData = {
      label: dto.label,
      street: dto.street,
      number: dto.number,
      complement: dto.complement,
      neighborhood: dto.neighborhood,
      city: dto.city,
      state: dto.state,
      country: dto.country,
      zipCode: dto.zipCode || '',
      isDefault: dto.isDefault,
      userId,
      latitude: dto.latitude ?? geocodeResult?.latitude,
      longitude: dto.longitude ?? geocodeResult?.longitude,
      formattedAddress: geocodeResult?.formattedAddress,
      placeId: geocodeResult?.placeId,
    };

    const address = await this.addressesRepository.create(createData);

    // Se for o primeiro endereço, marca como padrão
    const count = await this.addressesRepository.countByUser(userId);
    if (count === 1) {
      await this.addressesRepository.update(address.id, { isDefault: true });
      address.isDefault = true;
    }

    return this.mapToResponse(address);
  }

  async findAll(userId: string): Promise<AddressListResponse> {
    const addresses = await this.addressesRepository.findByUser(userId);

    return {
      addresses: addresses.map((addr) => this.mapToResponse(addr)),
      total: addresses.length,
    };
  }

  async findById(userId: string, addressId: string): Promise<AddressResponseDto> {
    const address = await this.addressesRepository.findByIdAndUser(addressId, userId);

    if (!address) {
      throw new NotFoundException('Endereço não encontrado.');
    }

    return this.mapToResponse(address);
  }

  async update(
    userId: string,
    addressId: string,
    dto: UpdateAddressDto,
  ): Promise<AddressResponseDto> {
    const existingAddress = await this.addressesRepository.findByIdAndUser(addressId, userId);

    if (!existingAddress) {
      throw new NotFoundException('Endereço não encontrado.');
    }

    if (dto.isDefault) {
      await this.addressesRepository.clearDefaultForUser(userId);
    }

    let geocodeResult: GeocodingResult | null = null;
    const addressChanged =
      dto.street || dto.number || dto.neighborhood || dto.city || dto.state || dto.zipCode;

    if (addressChanged && !dto.latitude && !dto.longitude) {
      const updatedAddressData = {
        street: dto.street ?? existingAddress.street,
        number: dto.number ?? existingAddress.number,
        neighborhood: dto.neighborhood ?? existingAddress.neighborhood,
        city: dto.city ?? existingAddress.city,
        state: dto.state ?? existingAddress.state,
        country: dto.country ?? existingAddress.country,
        zipCode: dto.zipCode ?? existingAddress.zipCode,
      };

      const addressString = this.buildAddressString(updatedAddressData);
      geocodeResult = await this.googleMapsService.geocode(addressString);
    }

    const updateData: UpdateAddressData = {
      ...dto,
      latitude: dto.latitude ?? geocodeResult?.latitude ?? undefined,
      longitude: dto.longitude ?? geocodeResult?.longitude ?? undefined,
      formattedAddress: geocodeResult?.formattedAddress ?? undefined,
      placeId: geocodeResult?.placeId ?? undefined,
    };

    const updatedAddress = await this.addressesRepository.update(addressId, updateData);

    return this.mapToResponse(updatedAddress);
  }

  async delete(userId: string, addressId: string): Promise<void> {
    const address = await this.addressesRepository.findByIdAndUser(addressId, userId);

    if (!address) {
      throw new NotFoundException('Endereço não encontrado.');
    }

    await this.addressesRepository.delete(addressId);

    if (address.isDefault) {
      const addresses = await this.addressesRepository.findByUser(userId);
      if (addresses.length > 0) {
        await this.addressesRepository.update(addresses[0].id, { isDefault: true });
      }
    }
  }

  async setAsDefault(userId: string, addressId: string): Promise<AddressResponseDto> {
    const address = await this.addressesRepository.findByIdAndUser(addressId, userId);

    if (!address) {
      throw new NotFoundException('Endereço não encontrado.');
    }

    await this.addressesRepository.clearDefaultForUser(userId);
    const updatedAddress = await this.addressesRepository.update(addressId, { isDefault: true });

    return this.mapToResponse(updatedAddress);
  }

  async geocode(address: string): Promise<GeocodingResult | null> {
    return this.googleMapsService.geocode(address);
  }

  async reverseGeocode(coordinates: Coordinates): Promise<ReverseGeocodingResult | null> {
    return this.googleMapsService.reverseGeocode(coordinates);
  }

  async calculateDistance(
    userId: string,
    originAddressId?: string,
    originCoords?: Coordinates,
    destinationAddressId?: string,
    destinationCoords?: Coordinates,
  ): Promise<DistanceCalculationResult> {
    let origin: Coordinates;
    let destination: Coordinates;
    let originAddress: AddressResponseDto | undefined;
    let destinationAddress: AddressResponseDto | undefined;

    if (originAddressId) {
      const addr = await this.addressesRepository.findByIdAndUser(originAddressId, userId);
      if (!addr) {
        throw new NotFoundException('Endereço de origem não encontrado.');
      }
      if (!addr.latitude || !addr.longitude) {
        throw new BadRequestException('Endereço de origem não possui coordenadas.');
      }
      origin = { latitude: addr.latitude, longitude: addr.longitude };
      originAddress = this.mapToResponse(addr);
    } else if (originCoords) {
      origin = originCoords;
    } else {
      throw new BadRequestException('Origem não especificada.');
    }

    if (destinationAddressId) {
      const addr = await this.addressesRepository.findByIdAndUser(destinationAddressId, userId);
      if (!addr) {
        throw new NotFoundException('Endereço de destino não encontrado.');
      }
      if (!addr.latitude || !addr.longitude) {
        throw new BadRequestException('Endereço de destino não possui coordenadas.');
      }
      destination = { latitude: addr.latitude, longitude: addr.longitude };
      destinationAddress = this.mapToResponse(addr);
    } else if (destinationCoords) {
      destination = destinationCoords;
    } else {
      throw new BadRequestException('Destino não especificado.');
    }

    const distance = await this.googleMapsService.calculateDistance(origin, destination);

    return {
      origin: originAddress || origin,
      destination: destinationAddress || destination,
      distance,
    };
  }

  calculateStraightLineDistance(origin: Coordinates, destination: Coordinates): number {
    return this.googleMapsService.calculateStraightLineDistance(origin, destination);
  }

  async autocomplete(input: string, sessionToken?: string): Promise<PlaceAutocompleteResult[]> {
    return this.googleMapsService.autocomplete(input, sessionToken);
  }

  async findNearby(
    userId: string,
    latitude: number,
    longitude: number,
    radiusInKm: number,
  ): Promise<NearbyAddressResult[]> {
    const addresses = await this.addressesRepository.findNearby(
      latitude,
      longitude,
      radiusInKm,
      userId,
    );

    const results: NearbyAddressResult[] = addresses
      .filter((addr) => addr.latitude && addr.longitude)
      .map((addr) => {
        const distanceInKm = this.googleMapsService.calculateStraightLineDistance(
          { latitude, longitude },
          { latitude: addr.latitude!, longitude: addr.longitude! },
        );

        return {
          address: this.mapToResponse(addr),
          distanceInKm: Math.round(distanceInKm * 100) / 100,
        };
      })
      .filter((result) => result.distanceInKm <= radiusInKm)
      .sort((a, b) => a.distanceInKm - b.distanceInKm);

    return results;
  }

  async createFromPlaceId(
    userId: string,
    placeId: string,
    label?: string,
  ): Promise<AddressResponseDto> {
    const placeDetails = await this.googleMapsService.getPlaceDetails(placeId);

    if (!placeDetails) {
      throw new BadRequestException('Não foi possível obter detalhes do lugar.');
    }

    const geocodeResult = await this.googleMapsService.geocode(placeDetails.formattedAddress);

    if (!geocodeResult) {
      throw new BadRequestException('Não foi possível geocodificar o endereço.');
    }

    const createData: CreateAddressData = {
      userId,
      label,
      street: geocodeResult.street || '',
      number: geocodeResult.number || 'S/N',
      neighborhood: geocodeResult.neighborhood || '',
      city: geocodeResult.city || '',
      state: geocodeResult.state || '',
      country: geocodeResult.country || 'Brasil',
      zipCode: geocodeResult.zipCode || '',
      latitude: placeDetails.latitude,
      longitude: placeDetails.longitude,
      formattedAddress: placeDetails.formattedAddress,
      placeId: placeDetails.placeId,
    };

    const address = await this.addressesRepository.create(createData);

    // Se for o primeiro endereço, marca como padrão
    const count = await this.addressesRepository.countByUser(userId);
    if (count === 1) {
      await this.addressesRepository.update(address.id, { isDefault: true });
      address.isDefault = true;
    }

    return this.mapToResponse(address);
  }

  private buildAddressString(address: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    country?: string;
    zipCode?: string;
  }): string {
    return `${address.street}, ${address.number}, ${address.neighborhood}, ${address.city} - ${address.state}, ${address.zipCode || ''}, ${address.country || 'Brasil'}`.trim();
  }

  private mapToResponse(address: Address): AddressResponseDto {
    return {
      id: address.id,
      label: address.label,
      street: address.street,
      number: address.number,
      complement: address.complement,
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      country: address.country,
      zipCode: address.zipCode,
      latitude: address.latitude,
      longitude: address.longitude,
      formattedAddress: address.formattedAddress,
      placeId: address.placeId,
      isDefault: address.isDefault,
      createdAt: address.createdAt,
      updatedAt: address.updatedAt,
    };
  }
}
