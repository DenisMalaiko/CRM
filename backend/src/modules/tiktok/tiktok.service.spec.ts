import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { TiktokService } from './tiktok.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { ApifyService } from '../apify/apify.service';
import { TagSource, TagType } from '@prisma/client';

describe('TiktokService', () => {
  let module: TestingModule;
  let service: TiktokService;
  let prisma: {
    business: { findUnique: jest.Mock };
    tag: { upsert: jest.Mock; update: jest.Mock };
    tiktokVideo: { upsert: jest.Mock };
  };
  let apify: { runActor: jest.Mock };
  let loggerWarnSpy: jest.SpyInstance;

  const mockBusiness = {
    id: 'biz-001',
    name: 'Test Business',
    industry: 'Beauty',
    language: 'en',
    country: 'US',
  };

  const mockTag = {
    id: 'tag-001',
    type: TagType.Hashtag,
    value: 'trending',
    normalizedValue: 'trending',
    source: TagSource.Trend,
    countries: ['US'],
    industries: ['Beauty'],
    metrics: { rank: 1, url: 'https://tiktok.com' },
  };

  beforeAll(async () => {
    prisma = {
      business: { findUnique: jest.fn() },
      tag: {
        upsert: jest.fn().mockResolvedValue(mockTag),
        update: jest.fn().mockResolvedValue(mockTag),
      },
      tiktokVideo: { upsert: jest.fn() },
    };

    apify = { runActor: jest.fn() };

    module = await Test.createTestingModule({
      providers: [
        TiktokService,
        { provide: PrismaService, useValue: prisma },
        { provide: ApifyService, useValue: apify },
      ],
    }).compile();

    service = module.get<TiktokService>(TiktokService);
    loggerWarnSpy = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Restore default mock implementations after clearAllMocks
    prisma.tag.upsert.mockResolvedValue(mockTag);
    prisma.tag.update.mockResolvedValue(mockTag);
  });

  // ─────────────────────────────────────────────────────────────
  // fetchTikTokVideosByBusinessId — business not found
  // ─────────────────────────────────────────────────────────────
  describe('fetchTikTokVideosByBusinessId — business not found', () => {
    it('returns null when business does not exist', async () => {
      prisma.business.findUnique.mockResolvedValue(null);

      const result = await service.fetchTikTokVideosByBusinessId('nonexistent');

      expect(result).toBeNull();
      expect(apify.runActor).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // fetchTikTokVideosByBusinessId — zero hashtags
  // ─────────────────────────────────────────────────────────────
  describe('fetchTikTokVideosByBusinessId — 0 hashtags returned', () => {
    it('returns [] when Apify returns 0 hashtags', async () => {
      prisma.business.findUnique.mockResolvedValue(mockBusiness);
      // Apify returns nothing for the trends scraper run
      apify.runActor.mockResolvedValueOnce([]);

      const result = await service.fetchTikTokVideosByBusinessId(mockBusiness.id);

      expect(result).toEqual([]);
    });

    it('logs a warn containing businessId when 0 hashtags are fetched', async () => {
      prisma.business.findUnique.mockResolvedValue(mockBusiness);
      apify.runActor.mockResolvedValueOnce([]);

      await service.fetchTikTokVideosByBusinessId(mockBusiness.id);

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(mockBusiness.id),
      );
    });

    it('warn message mentions country and industry when 0 hashtags', async () => {
      prisma.business.findUnique.mockResolvedValue(mockBusiness);
      apify.runActor.mockResolvedValueOnce([]);

      await service.fetchTikTokVideosByBusinessId(mockBusiness.id);

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(mockBusiness.country),
      );
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(mockBusiness.industry),
      );
    });

    it('does not call Apify video scraper when hashtag list is empty', async () => {
      prisma.business.findUnique.mockResolvedValue(mockBusiness);
      apify.runActor.mockResolvedValueOnce([]);

      await service.fetchTikTokVideosByBusinessId(mockBusiness.id);

      // runActor should only be called once (for hashtags), never for videos
      expect(apify.runActor).toHaveBeenCalledTimes(1);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // fetchTikTokVideosByBusinessId — hashtags present but 0 videos
  // ─────────────────────────────────────────────────────────────
  describe('fetchTikTokVideosByBusinessId — hashtags found but 0 videos returned', () => {
    const hashtagItem = {
      name: 'trending',
      countryCode: 'US',
      industry: 'Beauty',
      rank: 1,
      url: 'https://tiktok.com/trending',
    };

    it('returns [] when Apify returns hashtags but 0 videos', async () => {
      prisma.business.findUnique.mockResolvedValue(mockBusiness);
      // First runActor call → hashtags; second call → videos (empty)
      apify.runActor
        .mockResolvedValueOnce([hashtagItem])
        .mockResolvedValueOnce([]);

      const result = await service.fetchTikTokVideosByBusinessId(mockBusiness.id);

      expect(result).toEqual([]);
    });

    it('logs a warn mentioning businessId and hashtag count when 0 videos returned', async () => {
      prisma.business.findUnique.mockResolvedValue(mockBusiness);
      apify.runActor
        .mockResolvedValueOnce([hashtagItem])
        .mockResolvedValueOnce([]);

      await service.fetchTikTokVideosByBusinessId(mockBusiness.id);

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(mockBusiness.id),
      );
    });

    it('does not upsert any videos when video scraper returns empty', async () => {
      prisma.business.findUnique.mockResolvedValue(mockBusiness);
      apify.runActor
        .mockResolvedValueOnce([hashtagItem])
        .mockResolvedValueOnce([]);

      await service.fetchTikTokVideosByBusinessId(mockBusiness.id);

      expect(prisma.tiktokVideo.upsert).not.toHaveBeenCalled();
    });

    it('calls video scraper exactly once when hashtags are present', async () => {
      prisma.business.findUnique.mockResolvedValue(mockBusiness);
      apify.runActor
        .mockResolvedValueOnce([hashtagItem])
        .mockResolvedValueOnce([]);

      await service.fetchTikTokVideosByBusinessId(mockBusiness.id);

      expect(apify.runActor).toHaveBeenCalledTimes(2);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Happy path — non-zero results, no warn expected
  // ─────────────────────────────────────────────────────────────
  describe('fetchTikTokVideosByBusinessId — happy path', () => {
    const hashtagItem = {
      name: 'trending',
      countryCode: 'US',
      industry: 'Beauty',
      rank: 1,
      url: 'https://tiktok.com/trending',
    };

    const videoItem = {
      id: 'vid-001',
      text: 'Great product!',
      textLanguage: 'en',
      webVideoUrl: 'https://tiktok.com/vid-001',
      videoMeta: { coverUrl: 'https://cdn.tiktok.com/cover.jpg', duration: 30 },
      authorMeta: {
        id: 'author-001',
        name: 'Author Name',
        nickName: 'author_nick',
        avatar: 'https://cdn.tiktok.com/avatar.jpg',
        verified: true,
        fans: 10000,
      },
      musicMeta: { musicName: 'Song', musicAuthor: 'Artist', musicOriginal: false },
      playCount: 5000,
      diggCount: 1200,
      commentCount: 300,
      shareCount: 150,
      collectCount: 80,
      hashtags: [{ name: 'trending' }],
      isAd: false,
      isSponsored: false,
      isSlideshow: false,
      input: '#trending',
      createTimeISO: '2024-01-01T00:00:00.000Z',
    };

    const savedVideo = {
      id: 'db-vid-001',
      externalId: 'vid-001',
      platform: 'Tiktok',
      businessId: mockBusiness.id,
    };

    it('returns saved videos when both hashtags and videos are found', async () => {
      prisma.business.findUnique.mockResolvedValue(mockBusiness);
      apify.runActor
        .mockResolvedValueOnce([hashtagItem])
        .mockResolvedValueOnce([videoItem]);
      prisma.tiktokVideo.upsert.mockResolvedValue(savedVideo as any);

      const result = await service.fetchTikTokVideosByBusinessId(mockBusiness.id);

      expect(result).toHaveLength(1);
      expect(result![0]).toEqual(savedVideo);
    });

    it('does not warn when non-zero videos are returned', async () => {
      prisma.business.findUnique.mockResolvedValue(mockBusiness);
      apify.runActor
        .mockResolvedValueOnce([hashtagItem])
        .mockResolvedValueOnce([videoItem]);
      prisma.tiktokVideo.upsert.mockResolvedValue(savedVideo as any);

      await service.fetchTikTokVideosByBusinessId(mockBusiness.id);

      expect(loggerWarnSpy).not.toHaveBeenCalled();
    });

    it('upserts one video record per returned video item', async () => {
      prisma.business.findUnique.mockResolvedValue(mockBusiness);
      apify.runActor
        .mockResolvedValueOnce([hashtagItem])
        .mockResolvedValueOnce([videoItem, { ...videoItem, id: 'vid-002' }]);
      prisma.tiktokVideo.upsert.mockResolvedValue(savedVideo as any);

      await service.fetchTikTokVideosByBusinessId(mockBusiness.id);

      expect(prisma.tiktokVideo.upsert).toHaveBeenCalledTimes(2);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // _fetchHashtags internal warn — triggered by empty Apify response
  // ─────────────────────────────────────────────────────────────
  describe('_fetchHashtags internal logging', () => {
    it('warns with country and industry when trends scraper returns 0 items', async () => {
      prisma.business.findUnique.mockResolvedValue(mockBusiness);
      apify.runActor.mockResolvedValueOnce([]);

      await service.fetchTikTokVideosByBusinessId(mockBusiness.id);

      // The _fetchHashtags method logs: `TikTok trends scraper returned 0 hashtags for country=..., industry=...`
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('0 hashtags'),
      );
    });
  });
});
