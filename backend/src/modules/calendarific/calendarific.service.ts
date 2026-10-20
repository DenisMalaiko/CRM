import {
  Injectable,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { PrismaService } from '../../core/prisma/prisma.service';
import { AiBaseService, AiModel } from '../ai/services/ai-base.service';
import {
  TCalendarificHoliday,
  TCalendarificHolidayCached,
} from './entities/calendarific.entity';
import {
  translateHolidaysSystemPrompt,
  translateHolidaysHumanPrompt,
  HolidayInput,
} from '../ai/prompts/calendarific/translate-holidays';
import {
  holidayTranslationSchema,
  THolidayTranslation,
} from '../ai/schema/ai-calendarific.schema';

type CalendarificApiHoliday = {
  name: string;
  description: string;
  date: { iso: string };
  type: string[];
  primary_type: string;
};

@Injectable()
export class CalendarificService {
  private readonly logger = new Logger(CalendarificService.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly aiBaseService: AiBaseService,
  ) {}

  async getHolidays(
    year: number,
    countryCode: string,
    language = 'uk',
  ): Promise<TCalendarificHoliday[]> {
    const cached = await this.prisma.calendarificHoliday.findUnique({
      where: { year_countryCode: { year, countryCode } },
    });

    if (cached) {
      this.logger.log(`Cache hit for ${countryCode}/${year}`);
      return this.extractLanguage(
        cached.holidays as unknown as TCalendarificHolidayCached[],
        language,
      );
    }

    this.logger.log(
      `Cache miss — fetching from Calendarific for ${countryCode}/${year}`,
    );

    const raw = await this.fetchFromApi(year, countryCode);
    const translations = await this.translateHolidays(
      raw.map((h) => ({ name: h.name, description: h.description })),
    );

    const cachedHolidays: TCalendarificHolidayCached[] = raw.map((h, i) => ({
      date: h.date.iso,
      type: h.type,
      primaryType: h.primary_type,
      names: translations[i].name,
      descriptions: translations[i].description,
    }));

    await this.prisma.calendarificHoliday.create({
      data: {
        year,
        countryCode,
        holidays: cachedHolidays as unknown as object[],
      },
    });

    return this.extractLanguage(cachedHolidays, language);
  }

  private async fetchFromApi(
    year: number,
    countryCode: string,
  ): Promise<CalendarificApiHoliday[]> {
    const apiKey = this.configService.getOrThrow<string>(
      'CALENDARIFIC_API_KEY',
    );
    const url = `https://calendarific.com/api/v2/holidays?api_key=${apiKey}&country=${countryCode}&year=${year}`;

    const response = await fetch(url);

    if (!response.ok) {
      this.logger.error(
        `Calendarific API error: ${response.status} ${response.statusText}`,
      );
      throw new InternalServerErrorException(
        'Failed to fetch Calendarific holidays',
      );
    }

    const data = await response.json();

    if (!Array.isArray(data?.response?.holidays)) {
      this.logger.error(
        'Unexpected Calendarific API response shape',
        JSON.stringify(data).slice(0, 500),
      );
      throw new InternalServerErrorException(
        'Unexpected Calendarific API response shape',
      );
    }

    return data.response.holidays as CalendarificApiHoliday[];
  }

  private async translateHolidays(
    holidays: HolidayInput[],
  ): Promise<THolidayTranslation> {
    const model = this.aiBaseService.getModel(AiModel.Fast);

    const response = await model.invoke([
      new SystemMessage(translateHolidaysSystemPrompt()),
      new HumanMessage(translateHolidaysHumanPrompt(holidays)),
    ]);

    const text = this.aiBaseService.extractTextContent(response.content);

    let parsed: unknown;
    try {
      parsed = this.aiBaseService.safeParseJson(text);
    } catch {
      this.logger.error('AI returned malformed JSON for holiday translation');
      throw new InternalServerErrorException(
        'AI returned malformed holiday translation',
      );
    }

    const result = holidayTranslationSchema.safeParse(parsed);

    if (!result.success) {
      this.logger.error(
        'AI holiday translation failed Zod validation',
        result.error.format(),
      );
      throw new InternalServerErrorException(
        'AI returned invalid holiday translation structure',
      );
    }

    if (result.data.length !== holidays.length) {
      this.logger.error(
        `AI returned ${result.data.length} translations for ${holidays.length} holidays`,
      );
      throw new InternalServerErrorException(
        'AI returned mismatched number of holiday translations',
      );
    }

    return result.data;
  }

  private extractLanguage(
    cached: TCalendarificHolidayCached[],
    language: string,
  ): TCalendarificHoliday[] {
    const lang = language as keyof TCalendarificHolidayCached['names'];

    return cached.map((h) => ({
      name: h.names[lang] ?? h.names['en'],
      description: h.descriptions[lang] ?? h.descriptions['en'],
      date: h.date,
      type: h.type,
      primaryType: h.primaryType,
    }));
  }
}
