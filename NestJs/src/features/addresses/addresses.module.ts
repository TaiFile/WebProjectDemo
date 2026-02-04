import { Module } from '@nestjs/common';
import { AddressesService } from './addresses.service';
import { AddressesController } from './addresses.controller';
import { AddressesRepository } from './repositories/addresses.repository';
import { GeolocationModule } from '@infrastructure/geolocation/geolocation.module';

@Module({
  imports: [GeolocationModule],
  providers: [AddressesService, AddressesRepository],
  controllers: [AddressesController],
  exports: [AddressesService, AddressesRepository],
})
export class AddressesModule {}
