import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { THoliday } from './entities/holiday.entity';

@Injectable()
export class HolidaysService {
  private readonly logger = new Logger(HolidaysService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getHolidays(year: number, countryCode: string): Promise<THoliday[]> {
    const cached = await this.prisma.publicHoliday.findUnique({
      where: { year_countryCode: { year, countryCode } },
    });

    if (cached) {
      return cached.holidays as THoliday[];
    }

    const holidays = await this.fetchFromNagerDate(year, countryCode);

    await this.prisma.publicHoliday.create({
      data: { year, countryCode, holidays: holidays as any },
    });

    return holidays;
  }

  private async fetchFromNagerDate(year: number, countryCode: string): Promise<THoliday[]> {
    const url = `https://date.nager.at/api/v3/PublicHolidays/${year}/${countryCode}`;

    this.logger.log(`Fetching holidays from ${url}`);

    const response = await fetch(url);

    if (!response.ok) {
      this.logger.error(`Nager.Date API error: ${response.status} ${response.statusText}`);
      throw new InternalServerErrorException('Failed to fetch public holidays');
    }

    const data = await response.json();

    return data.map((item: any) => ({
      date: item.date,
      localName: item.localName,
      name: item.name,
      countryCode: item.countryCode,
    }));
  }
}
