import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { CalendarificService } from './calendarific.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { AiBaseService, AiModel } from '../ai/services/ai-base.service';
import {
  TCalendarificHoliday,
  TCalendarificHolidayCached,
} from './entities/calendarific.entity';

// ─────────────────────────────────────────────
// Shared test fixtures
// ─────────────────────────────────────────────

const cachedHoliday: TCalendarificHolidayCached = {
  date: '2024-01-01',
  type: ['National holiday'],
  primaryType: 'National holiday',
  names: { en: 'New Year', uk: 'Новий рік' },
  descriptions: { en: 'New Year celebration', uk: 'Святкування Нового року' },
};

const secondCachedHoliday: TCalendarificHolidayCached = {
  date: '2024-03-08',
  type: ['National holiday'],
  primaryType: 'National holiday',
  names: { en: "International Women's Day", uk: 'Міжнародний жіночий день' },
  descriptions: {
    en: "International Women's Day",
    uk: 'Міжнародний жіночий день',
  },
};

const apiResponseHoliday = {
  name: 'New Year',
  description: 'New Year celebration',
  date: { iso: '2024-01-01' },
  type: ['National holiday'],
  primary_type: 'National holiday',
};

const validTranslationResponse = JSON.stringify([
  {
    name: { en: 'New Year', uk: 'Новий рік' },
    description: {
      en: 'New Year celebration',
      uk: 'Святкування Нового року',
    },
  },
]);

// ─────────────────────────────────────────────
// CalendarificService — cache hit
// ─────────────────────────────────────────────

describe('CalendarificService — cache hit', () => {
  let module: TestingModule;
  let service: CalendarificService;
  let mockPrisma: {
    calendarificHoliday: { findUnique: jest.Mock; create: jest.Mock };
  };
  let mockAiBaseService: {
    getModel: jest.Mock;
    extractTextContent: jest.Mock;
    safeParseJson: jest.Mock;
  };

  beforeAll(async () => {
    mockPrisma = {
      calendarificHoliday: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    mockAiBaseService = {
      getModel: jest.fn(),
      extractTextContent: jest.fn(),
      safeParseJson: jest.fn(),
    };

    module = await Test.createTestingModule({
      providers: [
        CalendarificService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AiBaseService, useValue: mockAiBaseService },
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn().mockReturnValue('test-api-key') },
        },
      ],
    }).compile();

    service = module.get<CalendarificService>(CalendarificService);
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns holidays from cache without calling API or AI', async () => {
    mockPrisma.calendarificHoliday.findUnique.mockResolvedValue({
      year: 2024,
      countryCode: 'UA',
      holidays: [cachedHoliday],
    });

    const result = await service.getHolidays(2024, 'UA', 'uk');

    expect(result).toHaveLength(1);
    expect(mockAiBaseService.getModel).not.toHaveBeenCalled();
    expect(mockPrisma.calendarificHoliday.create).not.toHaveBeenCalled();
  });

  it('queries cache with correct year and countryCode composite key', async () => {
    mockPrisma.calendarificHoliday.findUnique.mockResolvedValue({
      year: 2024,
      countryCode: 'UA',
      holidays: [cachedHoliday],
    });

    await service.getHolidays(2024, 'UA', 'uk');

    expect(mockPrisma.calendarificHoliday.findUnique).toHaveBeenCalledWith({
      where: { year_countryCode: { year: 2024, countryCode: 'UA' } },
    });
  });

  it('extracts Ukrainian translation when language=uk', async () => {
    mockPrisma.calendarificHoliday.findUnique.mockResolvedValue({
      year: 2024,
      countryCode: 'UA',
      holidays: [cachedHoliday],
    });

    const result = await service.getHolidays(2024, 'UA', 'uk');

    expect(result[0].name).toBe('Новий рік');
    expect(result[0].description).toBe('Святкування Нового року');
  });

  it('extracts English translation when language=en', async () => {
    mockPrisma.calendarificHoliday.findUnique.mockResolvedValue({
      year: 2024,
      countryCode: 'UA',
      holidays: [cachedHoliday],
    });

    const result = await service.getHolidays(2024, 'UA', 'en');

    expect(result[0].name).toBe('New Year');
    expect(result[0].description).toBe('New Year celebration');
  });

  it('falls back to English when requested language is not in translations', async () => {
    mockPrisma.calendarificHoliday.findUnique.mockResolvedValue({
      year: 2024,
      countryCode: 'UA',
      holidays: [cachedHoliday],
    });

    const result = await service.getHolidays(2024, 'UA', 'de');

    expect(result[0].name).toBe('New Year');
    expect(result[0].description).toBe('New Year celebration');
  });

  it('returns all holidays preserving date, type, and primaryType fields', async () => {
    mockPrisma.calendarificHoliday.findUnique.mockResolvedValue({
      year: 2024,
      countryCode: 'UA',
      holidays: [cachedHoliday, secondCachedHoliday],
    });

    const result = await service.getHolidays(2024, 'UA', 'uk');

    expect(result).toHaveLength(2);
    expect(result[0].date).toBe('2024-01-01');
    expect(result[0].type).toEqual(['National holiday']);
    expect(result[0].primaryType).toBe('National holiday');
    expect(result[1].date).toBe('2024-03-08');
  });

  it('returns an empty array when cache has an empty holidays list', async () => {
    mockPrisma.calendarificHoliday.findUnique.mockResolvedValue({
      year: 2024,
      countryCode: 'UA',
      holidays: [],
    });

    const result = await service.getHolidays(2024, 'UA', 'uk');

    expect(result).toEqual([]);
  });
});

// ─────────────────────────────────────────────
// CalendarificService — cache miss (API + AI)
// ─────────────────────────────────────────────

describe('CalendarificService — cache miss (API fetch + AI translation)', () => {
  let module: TestingModule;
  let service: CalendarificService;
  let mockPrisma: {
    calendarificHoliday: { findUnique: jest.Mock; create: jest.Mock };
  };
  let mockAiBaseService: {
    getModel: jest.Mock;
    extractTextContent: jest.Mock;
    safeParseJson: jest.Mock;
  };
  let mockModel: { invoke: jest.Mock };
  let mockFetch: jest.SpyInstance;

  beforeAll(async () => {
    mockPrisma = {
      calendarificHoliday: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
      },
    };

    mockModel = { invoke: jest.fn() };

    mockAiBaseService = {
      getModel: jest.fn().mockReturnValue(mockModel),
      extractTextContent: jest.fn().mockImplementation((content) => content),
      safeParseJson: jest.fn().mockImplementation((text) => JSON.parse(text)),
    };

    module = await Test.createTestingModule({
      providers: [
        CalendarificService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AiBaseService, useValue: mockAiBaseService },
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn().mockReturnValue('test-api-key') },
        },
      ],
    }).compile();

    service = module.get<CalendarificService>(CalendarificService);
  });

  afterAll(async () => {
    await module.close();
    mockFetch?.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.calendarificHoliday.findUnique.mockResolvedValue(null);
    mockPrisma.calendarificHoliday.create.mockResolvedValue({});
    mockAiBaseService.getModel.mockReturnValue(mockModel);
    mockAiBaseService.extractTextContent.mockImplementation(
      (content) => content,
    );
    mockAiBaseService.safeParseJson.mockImplementation((text) =>
      JSON.parse(text),
    );

    mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        response: { holidays: [apiResponseHoliday] },
      }),
    } as unknown as Response);

    mockModel.invoke.mockResolvedValue({ content: validTranslationResponse });
  });

  afterEach(() => {
    mockFetch?.mockRestore();
  });

  it('fetches from Calendarific API when cache is empty', async () => {
    await service.getHolidays(2024, 'UA', 'uk');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toContain('calendarific.com');
    expect(url).toContain('country=UA');
    expect(url).toContain('year=2024');
  });

  it('calls AI model to translate holidays', async () => {
    await service.getHolidays(2024, 'UA', 'uk');

    expect(mockAiBaseService.getModel).toHaveBeenCalledWith(AiModel.Fast);
    expect(mockModel.invoke).toHaveBeenCalledTimes(1);
  });

  it('saves translated holidays to DB after API fetch', async () => {
    await service.getHolidays(2024, 'UA', 'uk');

    expect(mockPrisma.calendarificHoliday.create).toHaveBeenCalledTimes(1);
    const createCall = mockPrisma.calendarificHoliday.create.mock.calls[0][0];
    expect(createCall.data.year).toBe(2024);
    expect(createCall.data.countryCode).toBe('UA');
    expect(Array.isArray(createCall.data.holidays)).toBe(true);
  });

  it('returns holidays with Ukrainian translation after API fetch', async () => {
    const result = await service.getHolidays(2024, 'UA', 'uk');

    expect(result).toHaveLength(1);
    expect(result[0].name).toBe('Новий рік');
    expect(result[0].description).toBe('Святкування Нового року');
  });

  it('returns holidays with English translation when language=en on cache miss', async () => {
    const result = await service.getHolidays(2024, 'UA', 'en');

    expect(result[0].name).toBe('New Year');
    expect(result[0].description).toBe('New Year celebration');
  });

  it('saved holidays contain both en and uk translations for each entry', async () => {
    await service.getHolidays(2024, 'UA', 'uk');

    const createCall = mockPrisma.calendarificHoliday.create.mock.calls[0][0];
    const firstHoliday = (
      createCall.data.holidays as TCalendarificHolidayCached[]
    )[0];
    expect(firstHoliday.names.en).toBe('New Year');
    expect(firstHoliday.names.uk).toBe('Новий рік');
  });

  it('uses the API key from ConfigService to build the request URL', async () => {
    const configService = module.get<ConfigService>(ConfigService);
    (configService.getOrThrow as jest.Mock).mockReturnValue('my-secret-key');

    await service.getHolidays(2024, 'UA', 'uk');

    const [url] = mockFetch.mock.calls[0] as [string];
    expect(url).toContain('api_key=my-secret-key');
  });
});

// ─────────────────────────────────────────────
// CalendarificService — error handling
// ─────────────────────────────────────────────

describe('CalendarificService — error handling', () => {
  let module: TestingModule;
  let service: CalendarificService;
  let mockPrisma: {
    calendarificHoliday: { findUnique: jest.Mock; create: jest.Mock };
  };
  let mockAiBaseService: {
    getModel: jest.Mock;
    extractTextContent: jest.Mock;
    safeParseJson: jest.Mock;
  };
  let mockModel: { invoke: jest.Mock };
  let mockFetch: jest.SpyInstance;

  beforeAll(async () => {
    mockPrisma = {
      calendarificHoliday: {
        findUnique: jest.fn().mockResolvedValue(null),
        create: jest.fn().mockResolvedValue({}),
      },
    };

    mockModel = { invoke: jest.fn() };

    mockAiBaseService = {
      getModel: jest.fn().mockReturnValue(mockModel),
      extractTextContent: jest.fn().mockImplementation((content) => content),
      safeParseJson: jest.fn().mockImplementation((text) => JSON.parse(text)),
    };

    module = await Test.createTestingModule({
      providers: [
        CalendarificService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: AiBaseService, useValue: mockAiBaseService },
        {
          provide: ConfigService,
          useValue: { getOrThrow: jest.fn().mockReturnValue('test-api-key') },
        },
      ],
    }).compile();

    service = module.get<CalendarificService>(CalendarificService);
  });

  afterAll(async () => {
    await module.close();
    mockFetch?.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockPrisma.calendarificHoliday.findUnique.mockResolvedValue(null);
    mockPrisma.calendarificHoliday.create.mockResolvedValue({});
    mockAiBaseService.getModel.mockReturnValue(mockModel);
    mockAiBaseService.extractTextContent.mockImplementation(
      (content) => content,
    );
    mockAiBaseService.safeParseJson.mockImplementation((text) =>
      JSON.parse(text),
    );
  });

  afterEach(() => {
    mockFetch?.mockRestore();
  });

  it('throws InternalServerErrorException when Calendarific API returns a non-ok status', async () => {
    mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 503,
      statusText: 'Service Unavailable',
    } as unknown as Response);

    await expect(service.getHolidays(2024, 'UA', 'uk')).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('throws InternalServerErrorException when AI returns a Zod-invalid structure', async () => {
    mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        response: { holidays: [apiResponseHoliday] },
      }),
    } as unknown as Response);

    // AI returns wrong schema — missing required fields
    mockModel.invoke.mockResolvedValue({
      content: JSON.stringify([{ wrong: 'schema' }]),
    });

    await expect(service.getHolidays(2024, 'UA', 'uk')).rejects.toThrow(
      InternalServerErrorException,
    );
  });

  it('does not save to DB when API call fails', async () => {
    mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    } as unknown as Response);

    await expect(service.getHolidays(2024, 'UA', 'uk')).rejects.toThrow();

    expect(mockPrisma.calendarificHoliday.create).not.toHaveBeenCalled();
  });

  it('does not save to DB when AI translation fails Zod validation', async () => {
    mockFetch = jest.spyOn(global, 'fetch').mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({
        response: { holidays: [apiResponseHoliday] },
      }),
    } as unknown as Response);

    mockModel.invoke.mockResolvedValue({
      content: JSON.stringify([{ bad: 'data' }]),
    });

    await expect(service.getHolidays(2024, 'UA', 'uk')).rejects.toThrow();

    expect(mockPrisma.calendarificHoliday.create).not.toHaveBeenCalled();
  });
});
