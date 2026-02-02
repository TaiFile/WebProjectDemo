import { Module, Global } from '@nestjs/common';
import { GoogleMapsService } from './google-maps.service';

@Global()
@Module({
  providers: [
    GoogleMapsService,
    {
      provide: 'GEOLOCATION_SERVICE',
      useExisting: GoogleMapsService,
    },
  ],
  exports: [GoogleMapsService, 'GEOLOCATION_SERVICE'],
})
export class GeolocationModule {}
