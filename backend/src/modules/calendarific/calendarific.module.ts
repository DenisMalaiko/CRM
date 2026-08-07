import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { CalendarificController } from './calendarific.controller';
import { CalendarificService } from './calendarific.service';

@Module({
  imports: [AuthModule],
  controllers: [CalendarificController],
  providers: [CalendarificService],
})
export class CalendarificModule {}
