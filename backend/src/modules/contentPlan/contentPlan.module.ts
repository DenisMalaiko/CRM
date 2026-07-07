import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { AiModule } from '../ai/ai.module';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { ContentPlanController } from './contentPlan.controller';
import { ContentPlanService } from './contentPlan.service';

@Module({
  imports: [AuthModule, AiModule, PrismaModule],
  controllers: [ContentPlanController],
  providers: [ContentPlanService],
})
export class ContentPlanModule {}
