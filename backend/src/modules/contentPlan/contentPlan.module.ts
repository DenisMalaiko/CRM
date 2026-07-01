import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { ContentPlanController } from './contentPlan.controller';
import { ContentPlanService } from './contentPlan.service';

@Module({
  imports: [AuthModule],
  controllers: [ContentPlanController],
  providers: [ContentPlanService],
})
export class ContentPlanModule {}
