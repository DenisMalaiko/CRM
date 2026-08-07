import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class CalendarificService {
  private readonly logger = new Logger(CalendarificService.name);

  constructor(private readonly configService: ConfigService) {}

  async getHolidays(year: number, countryCode: string) {
    const apiKey = this.configService.getOrThrow<string>('CALENDARIFIC_API_KEY');
    const url = `https://calendarific.com/api/v2/holidays?api_key=${apiKey}&country=${countryCode}&year=${year}`;

    this.logger.log(`Fetching holidays from Calendarific for ${countryCode}/${year}`);

    const response = await fetch(url);

    if (!response.ok) {
      this.logger.error(`Calendarific API error: ${response.status} ${response.statusText}`);
      throw new InternalServerErrorException('Failed to fetch Calendarific holidays');
    }

    const data = await response.json();

    return data.response.holidays.map((item: any) => ({
      name: item.name,
      description: item.description,
      date: item.date.iso,
      type: item.type,
      primaryType: item.primary_type,
    }));
  }
}
