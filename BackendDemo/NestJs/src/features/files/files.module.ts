import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { FilesRepository } from './repositories/files.repository';
import { UsersModule } from '@features/users/users.module';
import { KeycloakModule } from '@infrastructure/keycloak';

@Module({
  imports: [UsersModule, KeycloakModule],
  providers: [FilesService, FilesRepository],
  controllers: [FilesController],
  exports: [FilesService, FilesRepository],
})
export class FilesModule {}
