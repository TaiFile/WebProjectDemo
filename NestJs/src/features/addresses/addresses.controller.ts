import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AddressesService } from './addresses.service';
import {
  CreateAddressSchema,
  CreateAddressDto,
  UpdateAddressSchema,
  UpdateAddressDto,
} from './dtos/address.dto';
import {
  GeocodeAddressSchema,
  ReverseGeocodeSchema,
  CalculateDistanceSchema,
  AutocompleteSchema,
  FindNearbySchema,
} from './dtos/geolocation.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { UserPayload } from '@features/auth/strategies/jwt.strategy';
import { ZodValidationPipe } from '@common/pipes/zod-validation.pipe';

@Controller('addresses')
@UseGuards(JwtAuthGuard)
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(CreateAddressSchema)) dto: CreateAddressDto,
  ) {
    return this.addressesService.create(user.sub, dto);
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(@CurrentUser() user: UserPayload) {
    return this.addressesService.findAll(user.sub);
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findById(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.addressesService.findById(user.sub, id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(
    @CurrentUser() user: UserPayload,
    @Param('id') id: string,
    @Body(new ZodValidationPipe(UpdateAddressSchema)) dto: UpdateAddressDto,
  ) {
    return this.addressesService.update(user.sub, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    await this.addressesService.delete(user.sub, id);
  }

  @Patch(':id/set-default')
  @HttpCode(HttpStatus.OK)
  async setAsDefault(@CurrentUser() user: UserPayload, @Param('id') id: string) {
    return this.addressesService.setAsDefault(user.sub, id);
  }

  @Post('from-place')
  @HttpCode(HttpStatus.CREATED)
  async createFromPlace(
    @CurrentUser() user: UserPayload,
    @Body() body: { placeId: string; label?: string },
  ) {
    return this.addressesService.createFromPlaceId(user.sub, body.placeId, body.label);
  }

  @Post('geocode')
  @HttpCode(HttpStatus.OK)
  async geocode(@Body(new ZodValidationPipe(GeocodeAddressSchema)) dto: { address: string }) {
    const result = await this.addressesService.geocode(dto.address);
    return { result };
  }

  @Post('reverse-geocode')
  @HttpCode(HttpStatus.OK)
  async reverseGeocode(
    @Body(new ZodValidationPipe(ReverseGeocodeSchema))
    dto: {
      latitude: number;
      longitude: number;
    },
  ) {
    const result = await this.addressesService.reverseGeocode({
      latitude: dto.latitude,
      longitude: dto.longitude,
    });
    return { result };
  }

  @Post('distance')
  @HttpCode(HttpStatus.OK)
  async calculateDistance(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(CalculateDistanceSchema))
    dto: {
      originAddressId?: string;
      originLatitude?: number;
      originLongitude?: number;
      destinationAddressId?: string;
      destinationLatitude?: number;
      destinationLongitude?: number;
    },
  ) {
    const originCoords =
      dto.originLatitude !== undefined && dto.originLongitude !== undefined
        ? { latitude: dto.originLatitude, longitude: dto.originLongitude }
        : undefined;

    const destinationCoords =
      dto.destinationLatitude !== undefined && dto.destinationLongitude !== undefined
        ? { latitude: dto.destinationLatitude, longitude: dto.destinationLongitude }
        : undefined;

    return this.addressesService.calculateDistance(
      user.sub,
      dto.originAddressId,
      originCoords,
      dto.destinationAddressId,
      destinationCoords,
    );
  }

  @Get('search/autocomplete')
  @HttpCode(HttpStatus.OK)
  async autocomplete(
    @Query(new ZodValidationPipe(AutocompleteSchema))
    query: {
      input: string;
      sessionToken?: string;
    },
  ) {
    const results = await this.addressesService.autocomplete(query.input, query.sessionToken);
    return { results };
  }

  @Post('nearby')
  @HttpCode(HttpStatus.OK)
  async findNearby(
    @CurrentUser() user: UserPayload,
    @Body(new ZodValidationPipe(FindNearbySchema))
    dto: { latitude: number; longitude: number; radiusInKm?: number },
  ) {
    const results = await this.addressesService.findNearby(
      user.sub,
      dto.latitude,
      dto.longitude,
      dto.radiusInKm || 10,
    );
    return { results, total: results.length };
  }
}
