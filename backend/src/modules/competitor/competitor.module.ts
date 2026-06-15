import { Module } from '@nestjs/common';
import { AuthModule } from "../auth/auth.module";
import { FacebookModule } from "../facebook/facebook.module";
import { InstagramModule } from "../instagram/instagram.module";
import { S3Module } from "../../core/s3/s3.module";
import { StorageModule } from "../../core/storage/storage.module";
import { CompetitorController } from "./competitor.controller";
import { CompetitorService } from './competitor.service';
import { CompetitorMediaService } from './competitor-media.service';

@Module({
  imports: [AuthModule, FacebookModule, InstagramModule, S3Module, StorageModule],
  controllers: [CompetitorController],
  providers: [CompetitorService, CompetitorMediaService],
  exports: [CompetitorService]
})
export class CompetitorModule {}