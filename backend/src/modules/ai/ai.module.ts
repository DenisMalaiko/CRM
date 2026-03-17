import { Module } from '@nestjs/common';
import { S3Module } from "../../core/s3/s3.module";
import { AiService } from "./ai.service";
import { AiReplicate } from "./ai-replicate";

@Module({
  imports: [ S3Module],
  providers: [AiService, AiReplicate ],
  exports: [ AiService ],
})
export class AiModule {}
