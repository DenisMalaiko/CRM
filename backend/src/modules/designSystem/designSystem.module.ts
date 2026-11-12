import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { AiModule } from '../ai/ai.module';
import { S3Module } from '../../core/s3/s3.module';
import { DesignSystemController } from './designSystem.controller';
import { DesignSystemService } from './designSystem.service';

@Module({
  imports: [AuthModule, PrismaModule, AiModule, S3Module],
  controllers: [DesignSystemController],
  providers: [DesignSystemService],
  exports: [DesignSystemService],
})
export class DesignSystemModule {}
