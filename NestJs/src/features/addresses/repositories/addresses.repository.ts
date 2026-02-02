import { Injectable } from '@nestjs/common';
import { PrismaService } from '@infrastructure/database/prisma.service';
import { Address } from '@prisma/client';

export interface CreateAddressData {
  label?: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  country?: string;
  zipCode: string;
  latitude?: number;
  longitude?: number;
  formattedAddress?: string;
  placeId?: string;
  isDefault?: boolean;
  userId: string;
}

export interface UpdateAddressData {
  label?: string | null;
  street?: string;
  number?: string;
  complement?: string | null;
  neighborhood?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  latitude?: number | null;
  longitude?: number | null;
  formattedAddress?: string | null;
  placeId?: string | null;
  isDefault?: boolean;
}

@Injectable()
export class AddressesRepository {
  constructor(private prisma: PrismaService) {}

  async create(data: CreateAddressData): Promise<Address> {
    return this.prisma.address.create({
      data: {
        label: data.label,
        street: data.street,
        number: data.number,
        complement: data.complement,
        neighborhood: data.neighborhood,
        city: data.city,
        state: data.state,
        country: data.country || 'Brasil',
        zipCode: data.zipCode,
        latitude: data.latitude,
        longitude: data.longitude,
        formattedAddress: data.formattedAddress,
        placeId: data.placeId,
        isDefault: data.isDefault || false,
        userId: data.userId,
      },
    });
  }

  async findById(id: string): Promise<Address | null> {
    return this.prisma.address.findUnique({
      where: { id },
    });
  }

  async findByIdAndUser(id: string, userId: string): Promise<Address | null> {
    return this.prisma.address.findFirst({
      where: { id, userId },
    });
  }

  async findByUser(userId: string): Promise<Address[]> {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findDefaultByUser(userId: string): Promise<Address | null> {
    return this.prisma.address.findFirst({
      where: { userId, isDefault: true },
    });
  }

  async update(id: string, data: UpdateAddressData): Promise<Address> {
    return this.prisma.address.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.address.delete({
      where: { id },
    });
  }

  async clearDefaultForUser(userId: string): Promise<void> {
    await this.prisma.address.updateMany({
      where: { userId, isDefault: true },
      data: { isDefault: false },
    });
  }

  async findNearby(
    latitude: number,
    longitude: number,
    radiusInKm: number,
    userId?: string,
  ): Promise<Address[]> {
    const latDelta = radiusInKm / 111;
    const lonDelta = radiusInKm / (111 * Math.cos((latitude * Math.PI) / 180));

    const whereClause: any = {
      latitude: {
        not: null,
        gte: latitude - latDelta,
        lte: latitude + latDelta,
      },
      longitude: {
        not: null,
        gte: longitude - lonDelta,
        lte: longitude + lonDelta,
      },
    };

    if (userId) {
      whereClause.userId = userId;
    }

    return this.prisma.address.findMany({
      where: whereClause,
    });
  }

  async countByUser(userId: string): Promise<number> {
    return this.prisma.address.count({
      where: { userId },
    });
  }
}
