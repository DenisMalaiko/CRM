import { Module } from '@nestjs/common';
import { S3Module } from '../../core/s3/s3.module';
import { AiService } from './ai.service';
import { AiReplicateService } from './ai-replicate.service';
import { FalImageService } from './fal/fal-image.service';
import { AiBaseService } from './services/ai-base.service';
import { AiContentPlanService } from './services/ai-content-plan.service';

@Module({
  imports: [S3Module],
  providers: [
    AiService,
    AiReplicateService,
    FalImageService,
    AiBaseService,
    AiContentPlanService,
  ],
  exports: [
    AiService,
    AiReplicateService,
    FalImageService,
    AiBaseService,
    AiContentPlanService,
  ],
})
export class AiModule {}
