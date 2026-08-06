import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { ResponseMessage } from '../../core/decorators/response-message.decorator';
import { HolidaysService } from './holidays.service';
import { GetHolidaysParamsDto } from './dto/holidays.dto';

@UseGuards(JwtAuthGuard)
@Controller('holidays')
export class HolidaysController {
  constructor(private readonly holidaysService: HolidaysService) {}

  @Get('/:year/:countryCode')
  @ResponseMessage('Public holidays retrieved successfully')
  async getHolidays(@Param() { year, countryCode }: GetHolidaysParamsDto) {
    return this.holidaysService.getHolidays(year, countryCode.toUpperCase());
  }
}
