import { Module } from '@nestjs/common';
import { AuthModule } from "../auth/auth.module";
import { AiModule } from "../ai/ai.module";
import { S3Module } from "../../core/s3/s3.module";
import { GalleryController } from "./gallery.controller";
import { GalleryService } from "./gallery.service";
import { StorageModule } from "../../core/storage/storage.module";

@Module({
  imports: [AuthModule, AiModule, S3Module, StorageModule],
  controllers: [GalleryController],
  providers: [GalleryService],
  exports: [GalleryService]
})
export class GalleryModule {}