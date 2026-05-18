import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HiggsfieldsService } from './higgsfields.service';
import { S3Module } from '../../core/s3/s3.module';

@Module({
  imports: [S3Module, ConfigModule],
  providers: [HiggsfieldsService],
  exports: [HiggsfieldsService],
})
export class VideoAIModule {}
