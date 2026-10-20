import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';

import { CalendarificController } from './calendarific.controller';
import { CalendarificService } from './calendarific.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

const fakeHolidays = [
  {
    name: 'Новий рік',
    description: 'Святкування Нового року',
    date: '2024-01-01',
    type: ['National holiday'],
    primaryType: 'National holiday',
  },
];

describe('CalendarificController (integration)', () => {
  let app: INestApplication;
  let mockService: jest.Mocked<Pick<CalendarificService, 'getHolidays'>>;

  beforeAll(async () => {
    mockService = {
      getHolidays: jest.fn().mockResolvedValue(fakeHolidays),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      controllers: [CalendarificController],
      providers: [{ provide: CalendarificService, useValue: mockService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({ whitelist: true, transform: true }),
    );
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockService.getHolidays.mockResolvedValue(fakeHolidays);
  });

  // ─────────────────────────────────────────────
  // Happy path
  // ─────────────────────────────────────────────

  it('returns 200 with holidays for a valid year and countryCode', async () => {
    const response = await request(app.getHttpServer())
      .get('/calendarific/2024/ua')
      .expect(200);

    expect(response.body).toEqual(fakeHolidays);
  });

  it('calls service.getHolidays with correct year, uppercased countryCode, and language', async () => {
    await request(app.getHttpServer())
      .get('/calendarific/2024/ua')
      .query({ language: 'en' })
      .expect(200);

    expect(mockService.getHolidays).toHaveBeenCalledWith(2024, 'UA', 'en');
  });

  it('defaults language to "uk" when no language query param is provided', async () => {
    await request(app.getHttpServer()).get('/calendarific/2024/ua').expect(200);

    expect(mockService.getHolidays).toHaveBeenCalledWith(2024, 'UA', 'uk');
  });

  it('uppercases countryCode before passing it to the service', async () => {
    await request(app.getHttpServer()).get('/calendarific/2024/de').expect(200);

    expect(mockService.getHolidays).toHaveBeenCalledWith(2024, 'DE', 'uk');
  });

  // ─────────────────────────────────────────────
  // Validation — year param
  // ─────────────────────────────────────────────

  it('returns 400 when year is below minimum (1999)', async () => {
    await request(app.getHttpServer()).get('/calendarific/1999/ua').expect(400);

    expect(mockService.getHolidays).not.toHaveBeenCalled();
  });

  it('returns 400 when year is above maximum (2101)', async () => {
    await request(app.getHttpServer()).get('/calendarific/2101/ua').expect(400);

    expect(mockService.getHolidays).not.toHaveBeenCalled();
  });

  it('returns 400 when year is not a number', async () => {
    await request(app.getHttpServer())
      .get('/calendarific/notayear/ua')
      .expect(400);

    expect(mockService.getHolidays).not.toHaveBeenCalled();
  });

  // ─────────────────────────────────────────────
  // Validation — countryCode param
  // ─────────────────────────────────────────────

  it('returns 400 when countryCode is longer than 2 characters', async () => {
    await request(app.getHttpServer())
      .get('/calendarific/2024/ukr')
      .expect(400);

    expect(mockService.getHolidays).not.toHaveBeenCalled();
  });

  it('returns 400 when countryCode is shorter than 2 characters', async () => {
    await request(app.getHttpServer()).get('/calendarific/2024/u').expect(400);

    expect(mockService.getHolidays).not.toHaveBeenCalled();
  });

  // ─────────────────────────────────────────────
  // Validation — language query param
  // ─────────────────────────────────────────────

  it('returns 400 when language query param is not exactly 2 characters', async () => {
    await request(app.getHttpServer())
      .get('/calendarific/2024/ua')
      .query({ language: 'ukr' })
      .expect(400);

    expect(mockService.getHolidays).not.toHaveBeenCalled();
  });

  it('returns 400 when language query param is a single character', async () => {
    await request(app.getHttpServer())
      .get('/calendarific/2024/ua')
      .query({ language: 'u' })
      .expect(400);

    expect(mockService.getHolidays).not.toHaveBeenCalled();
  });
});
