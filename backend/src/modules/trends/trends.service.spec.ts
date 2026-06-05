import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { TrendsService } from './trends.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { TiktokService } from '../tiktok/tiktok.service';
import { BusinessStatus } from '@prisma/client';

describe('TrendsService', () => {
  let service: TrendsService;
  let prisma: { business: { findMany: jest.Mock }; tiktokVideo: { findMany: jest.Mock } };
  let tiktokService: { fetchTikTokVideosByBusinessId: jest.Mock };
  let loggerWarnSpy: jest.SpyInstance;
  let loggerLogSpy: jest.SpyInstance;

  beforeEach(async () => {
    prisma = {
      business: { findMany: jest.fn().mockResolvedValue([]) },
      tiktokVideo: { findMany: jest.fn().mockResolvedValue([]) },
    };

    tiktokService = {
      fetchTikTokVideosByBusinessId: jest.fn().mockResolvedValue([]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrendsService,
        { provide: PrismaService, useValue: prisma },
        { provide: TiktokService, useValue: tiktokService },
      ],
    }).compile();

    service = module.get<TrendsService>(TrendsService);

    loggerWarnSpy = jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    loggerLogSpy = jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('handleTikTokVideosCron', () => {
    it('fetches videos for all active businesses', async () => {
      const businesses = [
        { id: 'biz-1', name: 'Business One' },
        { id: 'biz-2', name: 'Business Two' },
      ];
      prisma.business.findMany.mockResolvedValue(businesses);

      await service.handleTikTokVideosCron();

      expect(prisma.business.findMany).toHaveBeenCalledWith({
        where: { status: BusinessStatus.Active },
        select: { id: true, name: true },
      });
      expect(tiktokService.fetchTikTokVideosByBusinessId).toHaveBeenCalledTimes(2);
      expect(tiktokService.fetchTikTokVideosByBusinessId).toHaveBeenNthCalledWith(1, 'biz-1');
      expect(tiktokService.fetchTikTokVideosByBusinessId).toHaveBeenNthCalledWith(2, 'biz-2');
    });

    it('does not call TiktokService when no active businesses exist', async () => {
      prisma.business.findMany.mockResolvedValue([]);

      await service.handleTikTokVideosCron();

      expect(tiktokService.fetchTikTokVideosByBusinessId).not.toHaveBeenCalled();
    });

    it('continues processing remaining businesses when one throws', async () => {
      const businesses = [
        { id: 'biz-1', name: 'Failing Biz' },
        { id: 'biz-2', name: 'OK Biz' },
        { id: 'biz-3', name: 'Also OK Biz' },
      ];
      prisma.business.findMany.mockResolvedValue(businesses);
      tiktokService.fetchTikTokVideosByBusinessId
        .mockRejectedValueOnce(new Error('Apify timeout'))
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);

      await expect(service.handleTikTokVideosCron()).resolves.toBeUndefined();

      expect(tiktokService.fetchTikTokVideosByBusinessId).toHaveBeenCalledTimes(3);
      expect(tiktokService.fetchTikTokVideosByBusinessId).toHaveBeenNthCalledWith(2, 'biz-2');
      expect(tiktokService.fetchTikTokVideosByBusinessId).toHaveBeenNthCalledWith(3, 'biz-3');
    });

    it('handles non-Error thrown values without crashing', async () => {
      const businesses = [{ id: 'biz-1', name: 'Biz' }];
      prisma.business.findMany.mockResolvedValue(businesses);
      tiktokService.fetchTikTokVideosByBusinessId.mockRejectedValueOnce('string error');

      await expect(service.handleTikTokVideosCron()).resolves.toBeUndefined();
    });

    // ─────────────────────────────────────────────────────────────
    // emptyCount observability — the core logging change
    // ─────────────────────────────────────────────────────────────
    it('logs a warn for each business that returns 0 videos (emptyCount path)', async () => {
      const businesses = [
        { id: 'biz-1', name: 'Empty Biz' },
        { id: 'biz-2', name: 'Also Empty Biz' },
      ];
      prisma.business.findMany.mockResolvedValue(businesses);
      tiktokService.fetchTikTokVideosByBusinessId.mockResolvedValue([]);

      await service.handleTikTokVideosCron();

      expect(loggerWarnSpy).toHaveBeenCalledTimes(2);
      expect(loggerWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Empty Biz'));
      expect(loggerWarnSpy).toHaveBeenCalledWith(expect.stringContaining('Also Empty Biz'));
    });

    it('logs (not warns) for each business that returns videos (successCount path)', async () => {
      const businesses = [{ id: 'biz-1', name: 'Active Biz' }];
      prisma.business.findMany.mockResolvedValue(businesses);
      tiktokService.fetchTikTokVideosByBusinessId.mockResolvedValue([
        { id: 'v1' } as any,
        { id: 'v2' } as any,
      ]);

      await service.handleTikTokVideosCron();

      expect(loggerWarnSpy).not.toHaveBeenCalled();
      // logger.log should mention the video count and business name
      const logCalls = loggerLogSpy.mock.calls.map((args) => args[0] as string);
      const videoLog = logCalls.find((msg) => msg.includes('Active Biz'));
      expect(videoLog).toBeDefined();
      expect(videoLog).toMatch(/2.*TikTok/i);
    });

    it('includes "empty" count in the final summary log', async () => {
      const businesses = [
        { id: 'biz-1', name: 'Good Biz' },
        { id: 'biz-2', name: 'Empty Biz' },
      ];
      prisma.business.findMany.mockResolvedValue(businesses);
      tiktokService.fetchTikTokVideosByBusinessId
        .mockResolvedValueOnce([{ id: 'v1' } as any])
        .mockResolvedValueOnce([]);

      await service.handleTikTokVideosCron();

      const logCalls = loggerLogSpy.mock.calls.map((args) => args[0] as string);
      const summaryLog = logCalls.find(
        (msg) => msg.includes('succeeded') && msg.includes('empty') && msg.includes('failed'),
      );
      expect(summaryLog).toBeDefined();
      // 1 succeeded, 1 empty, 0 failed
      expect(summaryLog).toMatch(/1 succeeded/);
      expect(summaryLog).toMatch(/1 empty/);
      expect(summaryLog).toMatch(/0 failed/);
    });

    it('counts a failed business in failCount, not emptyCount', async () => {
      const businesses = [{ id: 'biz-1', name: 'Crashing Biz' }];
      prisma.business.findMany.mockResolvedValue(businesses);
      tiktokService.fetchTikTokVideosByBusinessId.mockRejectedValueOnce(
        new Error('network error'),
      );

      await service.handleTikTokVideosCron();

      const logCalls = loggerLogSpy.mock.calls.map((args) => args[0] as string);
      const summaryLog = logCalls.find(
        (msg) => msg.includes('succeeded') && msg.includes('empty') && msg.includes('failed'),
      );
      expect(summaryLog).toBeDefined();
      expect(summaryLog).toMatch(/0 succeeded/);
      expect(summaryLog).toMatch(/0 empty/);
      expect(summaryLog).toMatch(/1 failed/);
    });
  });
});
