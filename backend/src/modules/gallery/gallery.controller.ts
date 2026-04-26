import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Patch,
  Body,
  UseGuards,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { ResponseMessage } from '../../core/decorators/response-message.decorator';
import {
  GalleryPhotoBaseDto,
  GalleryPhotoIdParamDto,
  UpdateGalleryPhotoDto,
  DefaultGalleryPhotoBaseDto,
  DefaultUpdateGalleryPhotoDto,
  AiGeneratedGalleryPhotoDto,
} from './dto/gallery.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { GalleryService } from './gallery.service';

@UseGuards(JwtAuthGuard)
@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get('/list/:id')
  @ResponseMessage('Gallery defaultGalleryPhotos have been got!')
  async getGalleryPhotos(@Param() { id }: GalleryPhotoIdParamDto) {
    return await this.galleryService.getPhotos(id);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  @ResponseMessage('Gallery defaultGalleryPhotos have been uploaded!')
  async uploadGalleryPhotos(
    @Body() dto: GalleryPhotoBaseDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.galleryService.uploadPhotos(dto, files);
  }

  @Patch('/:id')
  @ResponseMessage('Photo has been updated!')
  async updateGalleryPhoto(
    @Param() { id }: GalleryPhotoIdParamDto,
    @Body() body: UpdateGalleryPhotoDto,
  ) {
    return await this.galleryService.updatePhoto(id, body);
  }

  @Delete('/:id')
  @ResponseMessage('Photo has been deleted!')
  async deleteGalleryPhoto(@Param() { id }: GalleryPhotoIdParamDto) {
    return await this.galleryService.deletePhoto(id);
  }

  // Default Photo
  @Get('/default-list')
  @ResponseMessage('Default gallery photos have been got!')
  async getDefaultGalleryPhotos() {
    return await this.galleryService.getDefaultPhotos();
  }

  @Post('/default-list')
  @UseInterceptors(FilesInterceptor('files'))
  @ResponseMessage('Default gallery photo have been uploaded!')
  async uploadDefaultGalleryPhotos(
    @Body() dto: DefaultGalleryPhotoBaseDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return await this.galleryService.uploadDefaultPhotos(dto, files);
  }

  @Patch('/default-list/:id')
  @ResponseMessage('Default gallery photo has been updated!')
  async updateDefaultGalleryPhoto(
    @Param() { id }: GalleryPhotoIdParamDto,
    @Body() body: DefaultUpdateGalleryPhotoDto,
  ) {
    return await this.galleryService.updateDefaultPhoto(id, body);
  }

  @Delete('/default-list/:id')
  @ResponseMessage('Default gallery photo has been deleted!')
  async deleteDefaultGalleryPhoto(@Param() { id }: GalleryPhotoIdParamDto) {
    return await this.galleryService.deleteDefaultPhoto(id);
  }

  // AI Photos
  @Get('/ai-list/:id')
  @ResponseMessage('Ai photos have been got!')
  async getAiGalleryPhotos(@Param() { id }: GalleryPhotoIdParamDto) {
    return await this.galleryService.getAiPhotos(id);
  }

  @Post('/ai-list/:id')
  @ResponseMessage('Ai photo has been generated!')
  async generateAiGalleryPhoto(
    @Param() { id }: GalleryPhotoIdParamDto,
    @Body() body: AiGeneratedGalleryPhotoDto,
  ) {
    return await this.galleryService.generateAiPhoto(id, body)
  }
}
