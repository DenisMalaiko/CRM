import { Module } from '@nestjs/common';
import { S3Module } from '../../core/s3/s3.module';
import { AiService } from './ai.service';
import { AiReplicateService } from './ai-replicate.service';
import { AiBaseService } from './services/ai-base.service';

@Module({
  imports: [S3Module],
  providers: [AiService, AiReplicateService, AiBaseService],
  exports: [AiService, AiReplicateService, AiBaseService],
})
export class AiModule {}
