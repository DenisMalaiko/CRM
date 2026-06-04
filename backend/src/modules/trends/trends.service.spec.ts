import { Test, TestingModule } from '@nestjs/testing';
import { TrendsService } from './trends.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { TiktokService } from '../tiktok/tiktok.service';
import { BusinessStatus } from '@prisma/client';

describe('TrendsService', () => {
  let service: TrendsService;
  let prisma: { business: { findMany: jest.Mock }; tiktokVideo: { findMany: jest.Mock } };
  let tiktokService: { fetchTikTokVideosByBusinessId: jest.Mock };

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
  });

  describe('handleTikTokVideosCron', () => {
    it('should fetch videos for all active businesses', async () => {
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

    it('should not call TiktokService when no active businesses', async () => {
      prisma.business.findMany.mockResolvedValue([]);

      await service.handleTikTokVideosCron();

      expect(tiktokService.fetchTikTokVideosByBusinessId).not.toHaveBeenCalled();
    });

    it('should continue processing when one business fails', async () => {
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

    it('should handle non-Error thrown values', async () => {
      const businesses = [{ id: 'biz-1', name: 'Biz' }];
      prisma.business.findMany.mockResolvedValue(businesses);
      tiktokService.fetchTikTokVideosByBusinessId.mockRejectedValueOnce('string error');

      await expect(service.handleTikTokVideosCron()).resolves.toBeUndefined();
    });
  });
});
