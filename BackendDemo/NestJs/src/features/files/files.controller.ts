import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  StreamableFile,
  Response,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response as ExpressResponse } from 'express';
import { FilesService } from './files.service';
import { FileResponseDto, UploadResponseDto } from './dtos';
import { CurrentUser } from '@common/decorators';
import { JwtAuthGuard } from '@common/guards';
import { KeycloakUser } from '@infrastructure/keycloak';
import { UsersService } from '@features/users/users.service';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(
    private readonly filesService: FilesService,
    private readonly usersService: UsersService,
  ) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @CurrentUser() keycloakUser: KeycloakUser,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    const user = await this.usersService.findOrCreateUser(keycloakUser);
    return this.filesService.upload(user.id, file);
  }

  @Get()
  async getUserFiles(@CurrentUser() keycloakUser: KeycloakUser): Promise<FileResponseDto[]> {
    const user = await this.usersService.findOrCreateUser(keycloakUser);
    return this.filesService.getUserFiles(user.id);
  }

  @Get(':id')
  async getFile(
    @Param('id') id: string,
    @CurrentUser() keycloakUser: KeycloakUser,
  ): Promise<FileResponseDto> {
    const user = await this.usersService.findOrCreateUser(keycloakUser);
    return this.filesService.getFileById(id, user.id);
  }

  @Get(':id/download')
  async download(
    @Param('id') id: string,
    @CurrentUser() keycloakUser: KeycloakUser,
    @Response({ passthrough: true }) res: ExpressResponse,
  ): Promise<StreamableFile> {
    const user = await this.usersService.findOrCreateUser(keycloakUser);
    const { buffer, file } = await this.filesService.download(id, user.id);

    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.originalName}"`,
    });

    return new StreamableFile(buffer);
  }

  @Get(':id/url')
  async getUrl(
    @Param('id') id: string,
    @CurrentUser() keycloakUser: KeycloakUser,
    @Query('expiresIn') expiresIn?: number,
  ) {
    const user = await this.usersService.findOrCreateUser(keycloakUser);
    return this.filesService.getUrl(id, user.id, expiresIn);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() keycloakUser: KeycloakUser) {
    const user = await this.usersService.findOrCreateUser(keycloakUser);
    return this.filesService.delete(id, user.id);
  }
}
