import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { AiBaseService } from '../ai/services/ai-base.service';
import { CalendarificController } from './calendarific.controller';
import { CalendarificService } from './calendarific.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [CalendarificController],
  providers: [CalendarificService, AiBaseService],
})
export class CalendarificModule {}
