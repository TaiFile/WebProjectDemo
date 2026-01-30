import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { FilesRepository } from './repositories/files.repository';
import { StorageModule } from '@infrastructure/storage/storage.module';

@Module({
  imports: [StorageModule],
  providers: [FilesService, FilesRepository],
  controllers: [FilesController],
  exports: [FilesService, FilesRepository],
})
export class FilesModule {}
