import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { NicheNewsCronService } from './nicheNews-cron.service';
import { NicheNewsService, NewsItem } from './nicheNews.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { BusinessStatus, type NicheNews } from '@prisma/client';

const makeNewsItem = (overrides: Partial<NewsItem> = {}): NewsItem => ({
  title: 'Test headline',
  url: 'https://example.com/article-1',
  summary: 'Test summary',
  source: 'Test Source',
  publishedAt: new Date('2026-09-22T10:00:00Z'),
  ...overrides,
});

const makeNicheNewsRecord = (
  overrides: Partial<NicheNews> = {},
): NicheNews => ({
  id: 'news-uuid-1',
  agencyId: 'agency-uuid-1',
  title: 'Test headline',
  summary: 'Test summary',
  url: 'https://example.com/article-1',
  source: 'Test Source',
  industry: 'Health',
  publishedAt: new Date('2026-09-22T10:00:00Z'),
  createdAt: new Date('2026-09-22T00:00:00Z'),
  ...overrides,
});

describe('NicheNewsCronService', () => {
  let service: NicheNewsCronService;
  let prisma: { business: { findMany: jest.Mock } };
  let nicheNewsService: {
    fetchFromNewsdata: jest.Mock;
    selectTopItems: jest.Mock;
    saveNewsForIndustry: jest.Mock;
  };
  let loggerWarnSpy: jest.SpyInstance;
  let loggerLogSpy: jest.SpyInstance;
  let loggerErrorSpy: jest.SpyInstance;

  beforeEach(async () => {
    prisma = {
      business: { findMany: jest.fn().mockResolvedValue([]) },
    };

    nicheNewsService = {
      fetchFromNewsdata: jest.fn().mockResolvedValue([]),
      selectTopItems: jest.fn().mockReturnValue([]),
      saveNewsForIndustry: jest.fn().mockResolvedValue([]),
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
      expect(nicheNewsService.saveNewsForIndustry).not.toHaveBeenCalled();
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
        {
          id: 'biz-1',
          agencyId: 'agency-1',
          industry: 'Health',
          language: 'en',
        },
        {
          id: 'biz-2',
          agencyId: 'agency-2',
          industry: 'Health',
          language: 'en',
        },
      ]);

      const items = [makeNewsItem()];
      nicheNewsService.fetchFromNewsdata.mockResolvedValue(items);
      nicheNewsService.selectTopItems.mockReturnValue(items);
      nicheNewsService.saveNewsForIndustry.mockResolvedValue([
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
        {
          id: 'biz-1',
          agencyId: 'agency-1',
          industry: 'Health',
          language: 'en',
        },
        {
          id: 'biz-2',
          agencyId: 'agency-2',
          industry: 'Education',
          language: 'en',
        },
      ]);

      const items = [makeNewsItem()];
      nicheNewsService.fetchFromNewsdata.mockResolvedValue(items);
      nicheNewsService.selectTopItems.mockReturnValue(items);
      nicheNewsService.saveNewsForIndustry.mockResolvedValue([
        makeNicheNewsRecord(),
      ]);

      await service.handleNicheNewsCron();

      expect(nicheNewsService.fetchFromNewsdata).toHaveBeenCalledTimes(2);
    });

    it('makes separate API calls for same industry in different languages', async () => {
      prisma.business.findMany.mockResolvedValue([
        {
          id: 'biz-1',
          agencyId: 'agency-1',
          industry: 'Health',
          language: 'en',
        },
        {
          id: 'biz-2',
          agencyId: 'agency-2',
          industry: 'Health',
          language: 'ua',
        },
      ]);

      const items = [makeNewsItem()];
      nicheNewsService.fetchFromNewsdata.mockResolvedValue(items);
      nicheNewsService.selectTopItems.mockReturnValue(items);
      nicheNewsService.saveNewsForIndustry.mockResolvedValue([
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

    it('calls saveNewsForIndustry for each unique (agencyId, industry) pair in the group', async () => {
      prisma.business.findMany.mockResolvedValue([
        {
          id: 'biz-1',
          agencyId: 'agency-1',
          industry: 'Health',
          language: 'en',
        },
        {
          id: 'biz-2',
          agencyId: 'agency-2',
          industry: 'Health',
          language: 'en',
        },
      ]);

      const items = [makeNewsItem()];
      nicheNewsService.fetchFromNewsdata.mockResolvedValue(items);
      nicheNewsService.selectTopItems.mockReturnValue(items);
      nicheNewsService.saveNewsForIndustry
        .mockResolvedValueOnce([makeNicheNewsRecord({ agencyId: 'agency-1' })])
        .mockResolvedValueOnce([makeNicheNewsRecord({ agencyId: 'agency-2' })]);

      await service.handleNicheNewsCron();

      expect(nicheNewsService.saveNewsForIndustry).toHaveBeenCalledTimes(2);
      expect(nicheNewsService.saveNewsForIndustry).toHaveBeenCalledWith(
        'agency-1',
        'Health',
        items,
      );
      expect(nicheNewsService.saveNewsForIndustry).toHaveBeenCalledWith(
        'agency-2',
        'Health',
        items,
      );
    });

    it('deduplicates save calls when the same agency appears twice with the same industry', async () => {
      // Same agencyId + industry via two different businesses (e.g. two profiles)
      prisma.business.findMany.mockResolvedValue([
        {
          id: 'biz-1',
          agencyId: 'agency-1',
          industry: 'Health',
          language: 'en',
        },
        {
          id: 'biz-2',
          agencyId: 'agency-1',
          industry: 'Health',
          language: 'en',
        },
      ]);

      const items = [makeNewsItem()];
      nicheNewsService.fetchFromNewsdata.mockResolvedValue(items);
      nicheNewsService.selectTopItems.mockReturnValue(items);
      nicheNewsService.saveNewsForIndustry.mockResolvedValue([
        makeNicheNewsRecord(),
      ]);

      await service.handleNicheNewsCron();

      // Same agencyId::industry pair → saved only once
      expect(nicheNewsService.saveNewsForIndustry).toHaveBeenCalledTimes(1);
    });

    it('logs success count in the final summary', async () => {
      prisma.business.findMany.mockResolvedValue([
        {
          id: 'biz-1',
          agencyId: 'agency-1',
          industry: 'Health',
          language: 'en',
        },
      ]);

      const items = [makeNewsItem()];
      nicheNewsService.fetchFromNewsdata.mockResolvedValue(items);
      nicheNewsService.selectTopItems.mockReturnValue(items);
      nicheNewsService.saveNewsForIndustry.mockResolvedValue([
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
  });

  // ─────────────────────────────────────────────────────────────
  // Industry without category mapping
  // ─────────────────────────────────────────────────────────────
  describe('handleNicheNewsCron — unknown industry', () => {
    it('logs a warning and skips businesses with unmapped industry', async () => {
      prisma.business.findMany.mockResolvedValue([
        {
          id: 'biz-1',
          agencyId: 'agency-1',
          industry: 'UnknownIndustry',
          language: 'en',
        },
      ]);

      await service.handleNicheNewsCron();

      expect(nicheNewsService.fetchFromNewsdata).not.toHaveBeenCalled();
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('UnknownIndustry'),
      );
    });

    it('still processes valid businesses when another has an unmapped industry', async () => {
      prisma.business.findMany.mockResolvedValue([
        {
          id: 'biz-1',
          agencyId: 'agency-1',
          industry: 'UnknownIndustry',
          language: 'en',
        },
        {
          id: 'biz-2',
          agencyId: 'agency-2',
          industry: 'Health',
          language: 'en',
        },
      ]);

      const items = [makeNewsItem()];
      nicheNewsService.fetchFromNewsdata.mockResolvedValue(items);
      nicheNewsService.selectTopItems.mockReturnValue(items);
      nicheNewsService.saveNewsForIndustry.mockResolvedValue([
        makeNicheNewsRecord(),
      ]);

      await service.handleNicheNewsCron();

      expect(nicheNewsService.fetchFromNewsdata).toHaveBeenCalledTimes(1);
      expect(nicheNewsService.saveNewsForIndustry).toHaveBeenCalledWith(
        'agency-2',
        'Health',
        items,
      );
    });
  });

  // ─────────────────────────────────────────────────────────────
  // API returns empty results
  // ─────────────────────────────────────────────────────────────
  describe('handleNicheNewsCron — empty API response', () => {
    it('logs a warning and skips saveNewsForIndustry when fetchFromNewsdata returns no items', async () => {
      prisma.business.findMany.mockResolvedValue([
        {
          id: 'biz-1',
          agencyId: 'agency-1',
          industry: 'Health',
          language: 'en',
        },
      ]);

      nicheNewsService.fetchFromNewsdata.mockResolvedValue([]);
      nicheNewsService.selectTopItems.mockReturnValue([]);

      await service.handleNicheNewsCron();

      expect(nicheNewsService.saveNewsForIndustry).not.toHaveBeenCalled();
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('health::en'),
      );
    });

    it('continues processing other groups after one returns empty results', async () => {
      prisma.business.findMany.mockResolvedValue([
        {
          id: 'biz-1',
          agencyId: 'agency-1',
          industry: 'Health',
          language: 'en',
        },
        {
          id: 'biz-2',
          agencyId: 'agency-2',
          industry: 'Education',
          language: 'en',
        },
      ]);

      const items = [makeNewsItem()];
      nicheNewsService.fetchFromNewsdata
        .mockResolvedValueOnce([]) // Health — empty
        .mockResolvedValueOnce(items); // Education — has results
      nicheNewsService.selectTopItems
        .mockReturnValueOnce([])
        .mockReturnValueOnce(items);
      nicheNewsService.saveNewsForIndustry.mockResolvedValue([
        makeNicheNewsRecord(),
      ]);

      await service.handleNicheNewsCron();

      expect(nicheNewsService.saveNewsForIndustry).toHaveBeenCalledTimes(1);
      expect(nicheNewsService.saveNewsForIndustry).toHaveBeenCalledWith(
        'agency-2',
        'Education',
        items,
      );
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Save failure for one agency
  // ─────────────────────────────────────────────────────────────
  describe('handleNicheNewsCron — partial save failure', () => {
    it('continues processing other agencies when saveNewsForIndustry throws for one', async () => {
      prisma.business.findMany.mockResolvedValue([
        {
          id: 'biz-1',
          agencyId: 'agency-1',
          industry: 'Health',
          language: 'en',
        },
        {
          id: 'biz-2',
          agencyId: 'agency-2',
          industry: 'Health',
          language: 'en',
        },
      ]);

      const items = [makeNewsItem()];
      nicheNewsService.fetchFromNewsdata.mockResolvedValue(items);
      nicheNewsService.selectTopItems.mockReturnValue(items);
      nicheNewsService.saveNewsForIndustry
        .mockRejectedValueOnce(new Error('Prisma transaction failed'))
        .mockResolvedValueOnce([makeNicheNewsRecord()]);

      await expect(service.handleNicheNewsCron()).resolves.toBeUndefined();

      expect(nicheNewsService.saveNewsForIndustry).toHaveBeenCalledTimes(2);
    });

    it('increments failCount for each save that throws', async () => {
      prisma.business.findMany.mockResolvedValue([
        {
          id: 'biz-1',
          agencyId: 'agency-1',
          industry: 'Health',
          language: 'en',
        },
        {
          id: 'biz-2',
          agencyId: 'agency-2',
          industry: 'Health',
          language: 'en',
        },
      ]);

      const items = [makeNewsItem()];
      nicheNewsService.fetchFromNewsdata.mockResolvedValue(items);
      nicheNewsService.selectTopItems.mockReturnValue(items);
      nicheNewsService.saveNewsForIndustry.mockRejectedValue(
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

    it('logs an error with agency and industry details when save fails', async () => {
      prisma.business.findMany.mockResolvedValue([
        {
          id: 'biz-1',
          agencyId: 'agency-1',
          industry: 'Health',
          language: 'en',
        },
      ]);

      const items = [makeNewsItem()];
      nicheNewsService.fetchFromNewsdata.mockResolvedValue(items);
      nicheNewsService.selectTopItems.mockReturnValue(items);
      nicheNewsService.saveNewsForIndustry.mockRejectedValue(
        new Error('Timeout'),
      );

      await service.handleNicheNewsCron();

      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('agency-1'),
      );
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Health'),
      );
    });

    it('handles non-Error thrown values from saveNewsForIndustry without crashing', async () => {
      prisma.business.findMany.mockResolvedValue([
        {
          id: 'biz-1',
          agencyId: 'agency-1',
          industry: 'Health',
          language: 'en',
        },
      ]);

      const items = [makeNewsItem()];
      nicheNewsService.fetchFromNewsdata.mockResolvedValue(items);
      nicheNewsService.selectTopItems.mockReturnValue(items);
      nicheNewsService.saveNewsForIndustry.mockRejectedValue('string error');

      await expect(service.handleNicheNewsCron()).resolves.toBeUndefined();
    });
  });
});
