import { Module } from '@nestjs/common';
import { ProfilesController } from './profiles.controller';
import { ProfilesService } from "./profiles.service";
import { AuthModule } from "../auth/auth.module";
import { AiModule } from "../ai/ai.module";
import { GalleryModule } from "../gallery/gallery.module";

@Module({
  imports: [AuthModule, AiModule, GalleryModule],
  controllers: [ProfilesController],
  providers: [ProfilesService],
})
export class ProfilesModule {}