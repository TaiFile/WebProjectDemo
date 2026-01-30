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
import { FileResponseDto } from './dtos/file-response.dto';
import { UploadResponseDto } from './dtos/upload-response.dto';
import { CurrentUser } from '@common/decorators/current-user.decorator';
import { JwtAuthGuard } from '@common/guards/jwt-auth.guard';
import { UserPayload } from '@features/auth/strategies/jwt.strategy';

@Controller('files')
@UseGuards(JwtAuthGuard)
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @CurrentUser() user: UserPayload,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UploadResponseDto> {
    return this.filesService.upload(user.sub, file);
  }

  @Get()
  async getUserFiles(@CurrentUser() user: UserPayload): Promise<FileResponseDto[]> {
    return this.filesService.getUserFiles(user.sub);
  }

  @Get(':id')
  async getFile(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
  ): Promise<FileResponseDto> {
    return this.filesService.getFileById(id, user.sub);
  }

  @Get(':id/download')
  async download(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
    @Response({ passthrough: true }) res: ExpressResponse,
  ): Promise<StreamableFile> {
    const { buffer, file } = await this.filesService.download(id, user.sub);

    res.set({
      'Content-Type': file.mimeType,
      'Content-Disposition': `attachment; filename="${file.originalName}"`,
    });

    return new StreamableFile(buffer);
  }

  @Get(':id/url')
  async getUrl(
    @Param('id') id: string,
    @CurrentUser() user: UserPayload,
    @Query('expiresIn') expiresIn?: number,
  ) {
    return this.filesService.getUrl(id, user.sub, expiresIn);
  }

  @Delete(':id')
  async delete(@Param('id') id: string, @CurrentUser() user: UserPayload) {
    return this.filesService.delete(id, user.sub);
  }
}
