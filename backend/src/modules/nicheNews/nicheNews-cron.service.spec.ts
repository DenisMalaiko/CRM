import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { NicheNewsCronService } from './nicheNews-cron.service';
import { NicheNewsService, NewsItem } from './nicheNews.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { BusinessStatus } from '@prisma/client';

// Local type mirrors the current schema — agencyId was replaced by businessId.
type NicheNewsRecord = {
  id: string;
  businessId: string;
  title: string;
  summary: string;
  url: string;
  source: string;
  industry: string;
  publishedAt: Date;
  createdAt: Date;
};

const makeNewsItem = (overrides: Partial<NewsItem> = {}): NewsItem => ({
  title: 'Test headline',
  url: 'https://example.com/article-1',
  summary: 'Test summary',
  source: 'Test Source',
  publishedAt: new Date('2026-09-22T10:00:00Z'),
  ...overrides,
});

const makeNicheNewsRecord = (
  overrides: Partial<NicheNewsRecord> = {},
): NicheNewsRecord => ({
  id: 'news-uuid-1',
  businessId: 'biz-1',
  title: 'Test headline',
  summary: 'Test summary',
  url: 'https://example.com/article-1',
  source: 'Test Source',
  industry: 'Health',
  publishedAt: new Date('2026-09-22T10:00:00Z'),
  createdAt: new Date('2026-09-22T00:00:00Z'),
  ...overrides,
});

const makeBusiness = (overrides: Record<string, unknown> = {}) => ({
  id: 'biz-1',
  industry: 'Health',
  language: 'en',
  name: 'Test Business',
  goals: ['grow'],
  advantages: ['quality'],
  ...overrides,
});

describe('NicheNewsCronService', () => {
  let service: NicheNewsCronService;
  let prisma: {
    business: { findMany: jest.Mock };
    nicheNews: { deleteMany: jest.Mock };
  };
  let nicheNewsService: {
    fetchFromNewsdata: jest.Mock;
    selectTopItems: jest.Mock;
    filterNewsByRelevance: jest.Mock;
    saveNewsForBusiness: jest.Mock;
    generateIdeasFromNews: jest.Mock;
  };
  let loggerWarnSpy: jest.SpyInstance;
  let loggerLogSpy: jest.SpyInstance;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    prisma = {
      business: { findMany: jest.fn().mockResolvedValue([]) },
      nicheNews: { deleteMany: jest.fn().mockResolvedValue({ count: 0 }) },
    };

    nicheNewsService = {
      fetchFromNewsdata: jest.fn().mockResolvedValue([]),
      selectTopItems: jest.fn().mockReturnValue([]),
      filterNewsByRelevance: jest
        .fn()
        .mockImplementation((_biz, items) => Promise.resolve(items)),
      saveNewsForBusiness: jest.fn().mockResolvedValue([]),
      generateIdeasFromNews: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NicheNewsCronService,
        { provide: PrismaService, useValue: prisma },
        { provide: NicheNewsService, useValue: nicheNewsService },
      ],
    }).compile();

    service = module.get<NicheNewsCronService>(NicheNewsCronService);

    loggerWarnSpy = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
    loggerLogSpy = jest
      .spyOn(Logger.prototype, 'log')
      .mockImplementation(() => undefined);
    loggerErrorSpy = jest
      .spyOn(Logger.prototype, 'error')
      .mockImplementation(() => undefined);

    // Eliminate the 1s rate-limiting delay so tests run fast
    jest.spyOn(global, 'setTimeout').mockImplementation((fn: TimerHandler) => {
      if (typeof fn === 'function') fn();
      return 0 as unknown as ReturnType<typeof setTimeout>;
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ─────────────────────────────────────────────────────────────
  // Early exit — no businesses
  // ─────────────────────────────────────────────────────────────
  describe('handleNicheNewsCron — no businesses', () => {
    it('returns early without calling fetchFromNewsdata when no businesses have industry set', async () => {
      prisma.business.findMany.mockResolvedValue([]);

      await service.handleNicheNewsCron();

      expect(nicheNewsService.fetchFromNewsdata).not.toHaveBeenCalled();
      expect(nicheNewsService.saveNewsForBusiness).not.toHaveBeenCalled();
    });

    it('queries only Active businesses with industry set', async () => {
      prisma.business.findMany.mockResolvedValue([]);

      await service.handleNicheNewsCron();

      expect(prisma.business.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            status: BusinessStatus.Active,
            industry: { not: null },
          },
        }),
      );
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Happy path — correct grouping and API call minimization
  // ─────────────────────────────────────────────────────────────
  describe('handleNicheNewsCron — happy path', () => {
    it('makes one API call per unique (category, language) group', async () => {
      // Two businesses share the same industry+language → one API call
      prisma.business.findMany.mockResolvedValue([
        makeBusiness(),
        makeBusiness({ id: 'biz-2' }),
      ]);

      const items = [makeNewsItem()];
      nicheNewsService.fetchFromNewsdata.mockResolvedValue(items);
      nicheNewsService.selectTopItems.mockReturnValue(items);
      nicheNewsService.saveNewsForBusiness.mockResolvedValue([
        makeNicheNewsRecord(),
      ]);

      await service.handleNicheNewsCron();

      expect(nicheNewsService.fetchFromNewsdata).toHaveBeenCalledTimes(1);
      expect(nicheNewsService.fetchFromNewsdata).toHaveBeenCalledWith(
        'health',
        'en',
      );
    });

    it('makes separate API calls for different industries', async () => {
      prisma.business.findMany.mockResolvedValue([
        makeBusiness(),
        makeBusiness({
          id: 'biz-2',
          industry: 'Education',
        }),
      ]);

      const items = [makeNewsItem()];
      nicheNewsService.fetchFromNewsdata.mockResolvedValue(items);
      nicheNewsService.selectTopItems.mockReturnValue(items);
      nicheNewsService.saveNewsForBusiness.mockResolvedValue([
        makeNicheNewsRecord(),
      ]);

      await service.handleNicheNewsCron();

      expect(nicheNewsService.fetchFromNewsdata).toHaveBeenCalledTimes(2);
    });

    it('makes separate API calls for same industry in different languages', async () => {
      prisma.business.findMany.mockResolvedValue([
        makeBusiness(),
        makeBusiness({ id: 'biz-2', language: 'ua' }),
      ]);

      const items = [makeNewsItem()];
      nicheNewsService.fetchFromNewsdata.mockResolvedValue(items);
      nicheNewsService.selectTopItems.mockReturnValue(items);
      nicheNewsService.saveNewsForBusiness.mockResolvedValue([
        makeNicheNewsRecord(),
      ]);

      await service.handleNicheNewsCron();

      expect(nicheNewsService.fetchFromNewsdata).toHaveBeenCalledTimes(2);
      expect(nicheNewsService.fetchFromNewsdata).toHaveBeenCalledWith(
        'health',
        'en',
      );
      expect(nicheNewsService.fetchFromNewsdata).toHaveBeenCalledWith(
        'health',
        'ua',
      );
    });

    it('calls saveNewsForBusiness for each unique business in the group', async () => {
      prisma.business.findMany.mockResolvedValue([
        makeBusiness(),
        makeBusiness({ id: 'biz-2' }),
      ]);

      const items = [makeNewsItem()];
      nicheNewsService.fetchFromNewsdata.mockResolvedValue(items);
      nicheNewsService.selectTopItems.mockReturnValue(items);
      nicheNewsService.saveNewsForBusiness
        .mockResolvedValueOnce([makeNicheNewsRecord({ businessId: 'biz-1' })])
        .mockResolvedValueOnce([makeNicheNewsRecord({ businessId: 'biz-2' })]);

      await service.handleNicheNewsCron();

      expect(nicheNewsService.saveNewsForBusiness).toHaveBeenCalledTimes(2);
      expect(nicheNewsService.saveNewsForBusiness).toHaveBeenCalledWith(
        'biz-1',
        'Health',
        items,
      );
      expect(nicheNewsService.saveNewsForBusiness).toHaveBeenCalledWith(
        'biz-2',
        'Health',
        items,
      );
    });

    it('deduplicates save calls when the same businessId appears twice', async () => {
      // Same businessId via duplicate entry — should only be processed once
      prisma.business.findMany.mockResolvedValue([
        makeBusiness(),
        makeBusiness(), // same id: 'biz-1'
      ]);

      const items = [makeNewsItem()];
      nicheNewsService.fetchFromNewsdata.mockResolvedValue(items);
      nicheNewsService.selectTopItems.mockReturnValue(items);
      nicheNewsService.saveNewsForBusiness.mockResolvedValue([
        makeNicheNewsRecord(),
      ]);

      await service.handleNicheNewsCron();

      expect(nicheNewsService.saveNewsForBusiness).toHaveBeenCalledTimes(1);
    });

    it('logs success count in the final summary', async () => {
      prisma.business.findMany.mockResolvedValue([makeBusiness()]);

      const items = [makeNewsItem()];
      nicheNewsService.fetchFromNewsdata.mockResolvedValue(items);
      nicheNewsService.selectTopItems.mockReturnValue(items);
      nicheNewsService.saveNewsForBusiness.mockResolvedValue([
        makeNicheNewsRecord(),
      ]);

      await service.handleNicheNewsCron();

      const logCalls = loggerLogSpy.mock.calls.map((args) => args[0] as string);
      const summary = logCalls.find(
        (msg) => msg.includes('succeeded') && msg.includes('failed'),
      );
      expect(summary).toBeDefined();
      expect(summary).toMatch(/1 succeeded/);
      expect(summary).toMatch(/0 failed/);
    });

    it('calls generateIdeasFromNews after successful saveNewsForBusiness', async () => {
      prisma.business.findMany.mockResolvedValue([makeBusiness()]);

      const items = [makeNewsItem()];
      const saved = [makeNicheNewsRecord()];
      nicheNewsService.fetchFromNewsdata.mockResolvedValue(items);
      nicheNewsService.selectTopItems.mockReturnValue(items);
      nicheNewsService.saveNewsForBusiness.mockResolvedValue(saved);

      await service.handleNicheNewsCron();

      expect(nicheNewsService.generateIdeasFromNews).toHaveBeenCalledWith(
        expect.objectContaining({ industry: 'Health' }),
        'biz-1',
        saved,
      );
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Industry without category mapping
  // ─────────────────────────────────────────────────────────────
  describe('handleNicheNewsCron — unknown industry', () => {
    it('logs a warning and skips businesses with unmapped industry', async () => {
      prisma.business.findMany.mockResolvedValue([
        makeBusiness({ industry: 'UnknownIndustry' }),
      ]);

      await service.handleNicheNewsCron();

      expect(nicheNewsService.fetchFromNewsdata).not.toHaveBeenCalled();
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('UnknownIndustry'),
      );
    });

    it('still processes valid businesses when another has an unmapped industry', async () => {
      prisma.business.findMany.mockResolvedValue([
        makeBusiness({ industry: 'UnknownIndustry' }),
        makeBusiness({ id: 'biz-2' }),
      ]);

      const items = [makeNewsItem()];
      nicheNewsService.fetchFromNewsdata.mockResolvedValue(items);
      nicheNewsService.selectTopItems.mockReturnValue(items);
      nicheNewsService.saveNewsForBusiness.mockResolvedValue([
        makeNicheNewsRecord(),
      ]);

      await service.handleNicheNewsCron();

      expect(nicheNewsService.fetchFromNewsdata).toHaveBeenCalledTimes(1);
      expect(nicheNewsService.saveNewsForBusiness).toHaveBeenCalledWith(
        'biz-2',
        'Health',
        items,
      );
    });
  });

  // ─────────────────────────────────────────────────────────────
  // API returns empty results
  // ─────────────────────────────────────────────────────────────
  describe('handleNicheNewsCron — empty API response', () => {
    it('logs a warning and skips saveNewsForBusiness when fetchFromNewsdata returns no items', async () => {
      prisma.business.findMany.mockResolvedValue([makeBusiness()]);

      nicheNewsService.fetchFromNewsdata.mockResolvedValue([]);
      nicheNewsService.selectTopItems.mockReturnValue([]);

      await service.handleNicheNewsCron();

      expect(nicheNewsService.saveNewsForBusiness).not.toHaveBeenCalled();
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('health::en'),
      );
    });

    it('continues processing other groups after one returns empty results', async () => {
      prisma.business.findMany.mockResolvedValue([
        makeBusiness(),
        makeBusiness({
          id: 'biz-2',
          industry: 'Education',
        }),
      ]);

      const items = [makeNewsItem()];
      nicheNewsService.fetchFromNewsdata
        .mockResolvedValueOnce([]) // Health — empty
        .mockResolvedValueOnce(items); // Education — has results
      nicheNewsService.selectTopItems
        .mockReturnValueOnce([])
        .mockReturnValueOnce(items);
      nicheNewsService.saveNewsForBusiness.mockResolvedValue([
        makeNicheNewsRecord(),
      ]);

      await service.handleNicheNewsCron();

      expect(nicheNewsService.saveNewsForBusiness).toHaveBeenCalledTimes(1);
      expect(nicheNewsService.saveNewsForBusiness).toHaveBeenCalledWith(
        'biz-2',
        'Education',
        items,
      );
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Save failure for one business
  // ─────────────────────────────────────────────────────────────
  describe('handleNicheNewsCron — partial save failure', () => {
    it('continues processing other businesses when saveNewsForBusiness throws for one', async () => {
      prisma.business.findMany.mockResolvedValue([
        makeBusiness(),
        makeBusiness({ id: 'biz-2' }),
      ]);

      const items = [makeNewsItem()];
      nicheNewsService.fetchFromNewsdata.mockResolvedValue(items);
      nicheNewsService.selectTopItems.mockReturnValue(items);
      nicheNewsService.saveNewsForBusiness
        .mockRejectedValueOnce(new Error('Prisma transaction failed'))
        .mockResolvedValueOnce([makeNicheNewsRecord()]);

      await expect(service.handleNicheNewsCron()).resolves.toBeUndefined();

      expect(nicheNewsService.saveNewsForBusiness).toHaveBeenCalledTimes(2);
    });

    it('increments failCount for each save that throws', async () => {
      prisma.business.findMany.mockResolvedValue([
        makeBusiness(),
        makeBusiness({ id: 'biz-2' }),
      ]);

      const items = [makeNewsItem()];
      nicheNewsService.fetchFromNewsdata.mockResolvedValue(items);
      nicheNewsService.selectTopItems.mockReturnValue(items);
      nicheNewsService.saveNewsForBusiness.mockRejectedValue(
        new Error('DB error'),
      );

      await service.handleNicheNewsCron();

      const logCalls = loggerLogSpy.mock.calls.map((args) => args[0] as string);
      const summary = logCalls.find(
        (msg) => msg.includes('succeeded') && msg.includes('failed'),
      );
      expect(summary).toBeDefined();
      expect(summary).toMatch(/0 succeeded/);
      expect(summary).toMatch(/2 failed/);
    });

    it('logs an error with business id and industry details when save fails', async () => {
      prisma.business.findMany.mockResolvedValue([makeBusiness()]);

      const items = [makeNewsItem()];
      nicheNewsService.fetchFromNewsdata.mockResolvedValue(items);
      nicheNewsService.selectTopItems.mockReturnValue(items);
      nicheNewsService.saveNewsForBusiness.mockRejectedValue(
        new Error('Timeout'),
      );

      await service.handleNicheNewsCron();

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('biz-1'),
      );
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Health'),
      );
    });

    it('handles non-Error thrown values from saveNewsForBusiness without crashing', async () => {
      prisma.business.findMany.mockResolvedValue([makeBusiness()]);

      const items = [makeNewsItem()];
      nicheNewsService.fetchFromNewsdata.mockResolvedValue(items);
      nicheNewsService.selectTopItems.mockReturnValue(items);
      nicheNewsService.saveNewsForBusiness.mockRejectedValue('string error');

      await expect(service.handleNicheNewsCron()).resolves.toBeUndefined();
    });
  });
});
