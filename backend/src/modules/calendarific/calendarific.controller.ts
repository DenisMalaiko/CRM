import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { ResponseMessage } from '../../core/decorators/response-message.decorator';
import { CalendarificService } from './calendarific.service';
import {
  GetCalendarificParamsDto,
  GetCalendarificQueryDto,
} from './dto/calendarific.dto';

@UseGuards(JwtAuthGuard)
@Controller('calendarific')
export class CalendarificController {
  constructor(private readonly calendarificService: CalendarificService) {}

  @Get('/:year/:countryCode')
  @ResponseMessage('Calendarific holidays retrieved successfully')
  async getHolidays(
    @Param() { year, countryCode }: GetCalendarificParamsDto,
    @Query() { language }: GetCalendarificQueryDto,
  ) {
    return this.calendarificService.getHolidays(
      year,
      countryCode.toUpperCase(),
      language,
    );
  }
}
