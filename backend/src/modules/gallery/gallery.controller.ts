import { Controller, Get, Post, Delete, Param, Res, Body, UseGuards, UploadedFiles, UseInterceptors } from '@nestjs/common';
import { JwtAuthGuard } from "../../core/guards/jwt-auth.guard";
import { ResponseMessage } from "../../core/decorators/response-message.decorator";
import { GalleryPhotoBaseDto, GalleryPhotoIdParamDto } from "./dto/gallery.dto";
import { FilesInterceptor } from '@nestjs/platform-express';
import { GalleryService } from "./gallery.service";

@UseGuards(JwtAuthGuard)
@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Get("/list/:id")
  @ResponseMessage('Gallery photos have been got!')
  async getGalleryPhotos(@Param() { id }: GalleryPhotoIdParamDto) {
    return await this.galleryService.getPhotos(id);
  }

  @Post()
  @UseInterceptors(FilesInterceptor('files'))
  @ResponseMessage('Gallery photos have been uploaded!')
  async uploadGalleryPhotos(
    @Body() dto: GalleryPhotoBaseDto,
    @UploadedFiles() files: Express.Multer.File[]
  ) {
    return await this.galleryService.uploadPhotos(dto, files);
  }

  @Delete("/:id")
  @ResponseMessage('Photo has been deleted!')
  async deleteGalleryPhoto(@Param() { id }: GalleryPhotoIdParamDto) {
    return await this.galleryService.deletePhoto(id);
  }
}