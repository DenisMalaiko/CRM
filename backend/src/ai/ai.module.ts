import { Module } from '@nestjs/common';
import { AiService } from "./ai.service";
import { AiImageService } from "./ai-image.service";

@Module({
  providers: [AiService, AiImageService],
  exports: [AiService],
})
export class AiModule {}