import { Module } from '@nestjs/common';
import { S3Module } from "../../core/s3/s3.module";
import { AiService } from "./ai.service";
import { AiImageService } from "./ai-image.service";
import { AiReplicate } from "./ai-replicate";
import { AiVertexImage } from "./ai-vertex";

@Module({
  imports: [ S3Module],
  providers: [AiService, AiImageService, AiReplicate, AiVertexImage ],
  exports: [ AiService ],
})
export class AiModule {}