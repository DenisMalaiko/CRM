import { Module } from '@nestjs/common';
import { AuthModule } from "../auth/auth.module";
import { S3Module } from "../../core/s3/s3.module";
import { GalleryController } from "./gallery.controller";
import { GalleryService } from "./gallery.service";
import { StorageModule } from "../../core/storage/storage.module";

@Module({
  imports: [AuthModule, S3Module, StorageModule],
  controllers: [GalleryController],
  providers: [GalleryService],
})
export class GalleryModule {}