import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BusinessService } from './business.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { InstagramService } from '../instagram/instagram.service';
import { FacebookService } from '../facebook/facebook.service';
import { AiReplicateService } from '../ai/ai-replicate.service';
import { TStrategicInsight } from '../ai/schema/strategic-insights.schema';

const makeBusiness = (overrides: Record<string, unknown> = {}) => ({
  name: 'Test Business',
  industry: 'Health',
  goals: ['grow', 'convert'],
  advantages: ['fast', 'reliable'],
  language: 'en',
  ...overrides,
});

const makeFbReport = (overrides: Record<string, unknown> = {}) => ({
  id: 'report-uuid-1',
  businessId: 'biz-uuid-1',
  followers: 5000,
  posts: 120,
  likes: 800,
  postsImageCount: 60,
  postsVideoCount: 30,
  postsCarouselCount: 30,
  activeAds: 5,
  activeAds30d: 3,
  adsVideoCount: 2,
  adsImageCount: 2,
  adsCarouselCount: 1,
  adsDcoCount: 0,
  adsCtaWebsite: 3,
  adsCtaDirectMessage: 1,
  adsCtaInstagramPage: 0,
  adsCtaProduct: 1,
  adsCtaMetaPage: 0,
  topPosts: [],
  topPostTexts: [],
  topAds: [],
  topAdTexts: [],
  fetchedAt: new Date('2026-10-01T00:00:00Z'),
  createdAt: new Date('2026-10-01T00:00:00Z'),
  updatedAt: new Date('2026-10-01T00:00:00Z'),
  ...overrides,
});

const makeInsights = (): TStrategicInsight[] => [
  {
    type: 'strength',
    title: 'Strong follower base',
    description: 'Your page has 5k followers.',
  },
  {
    type: 'strength',
    title: 'Active posting',
    description: 'You post consistently.',
  },
  {
    type: 'improvement',
    title: 'Low ad diversity',
    description: 'Most ads are website-CTA.',
  },
  {
    type: 'improvement',
    title: 'Carousel underused',
    description: 'Only 25% carousel posts.',
  },
  {
    type: 'opportunity',
    title: 'Video ads potential',
    description: 'Video ads drive more reach.',
  },
  {
    type: 'opportunity',
    title: 'DM funnel',
    description: 'Direct message CTA is underutilized.',
  },
];

describe('BusinessService — generateFacebookInsights', () => {
  let service: BusinessService;
  let prisma: {
    business: { findUnique: jest.Mock };
    facebookReport: { findUnique: jest.Mock; update: jest.Mock };
  };
  let aiService: { generateStrategicInsights: jest.Mock };

  beforeEach(async () => {
    prisma = {
      business: { findUnique: jest.fn() },
      facebookReport: { findUnique: jest.fn(), update: jest.fn() },
    };

    aiService = {
      generateStrategicInsights: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessService,
        { provide: PrismaService, useValue: prisma },
        { provide: AiService, useValue: aiService },
        { provide: InstagramService, useValue: {} },
        { provide: FacebookService, useValue: {} },
        { provide: AiReplicateService, useValue: {} },
      ],
    }).compile();

    service = module.get<BusinessService>(BusinessService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('happy path', () => {
    it('returns 6 insights when business and facebook report both exist', async () => {
      prisma.business.findUnique.mockResolvedValue(makeBusiness());
      prisma.facebookReport.findUnique.mockResolvedValue(makeFbReport());
      aiService.generateStrategicInsights.mockResolvedValue(makeInsights());

      const result = await service.generateFacebookInsights(
        'biz-uuid-1',
        'agency-uuid-1',
      );

      expect(result).toHaveLength(6);
      result.forEach((insight) => {
        expect(['strength', 'improvement', 'opportunity']).toContain(
          insight.type,
        );
        expect(typeof insight.title).toBe('string');
        expect(typeof insight.description).toBe('string');
      });
    });

    it('calls prisma.business.findUnique with the correct businessId', async () => {
      prisma.business.findUnique.mockResolvedValue(makeBusiness());
      prisma.facebookReport.findUnique.mockResolvedValue(makeFbReport());
      aiService.generateStrategicInsights.mockResolvedValue(makeInsights());

      await service.generateFacebookInsights('biz-uuid-1', 'agency-uuid-1');

      expect(prisma.business.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'biz-uuid-1', agencyId: 'agency-uuid-1' },
        }),
      );
    });

    it('calls prisma.facebookReport.findUnique with the correct businessId', async () => {
      prisma.business.findUnique.mockResolvedValue(makeBusiness());
      prisma.facebookReport.findUnique.mockResolvedValue(makeFbReport());
      aiService.generateStrategicInsights.mockResolvedValue(makeInsights());

      await service.generateFacebookInsights('biz-uuid-1', 'agency-uuid-1');

      expect(prisma.facebookReport.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { businessId: 'biz-uuid-1' } }),
      );
    });

    it('delegates to AiService.generateStrategicInsights with business and fbReport', async () => {
      const business = makeBusiness();
      const fbReport = makeFbReport();
      prisma.business.findUnique.mockResolvedValue(business);
      prisma.facebookReport.findUnique.mockResolvedValue(fbReport);
      aiService.generateStrategicInsights.mockResolvedValue(makeInsights());

      await service.generateFacebookInsights('biz-uuid-1', 'agency-uuid-1');

      expect(aiService.generateStrategicInsights).toHaveBeenCalledWith(
        business,
        fbReport,
      );
    });

    it('returns insights that include all three types (strength, improvement, opportunity)', async () => {
      prisma.business.findUnique.mockResolvedValue(makeBusiness());
      prisma.facebookReport.findUnique.mockResolvedValue(makeFbReport());
      aiService.generateStrategicInsights.mockResolvedValue(makeInsights());

      const result = await service.generateFacebookInsights(
        'biz-uuid-1',
        'agency-uuid-1',
      );

      const types = result.map((i) => i.type);
      expect(types).toContain('strength');
      expect(types).toContain('improvement');
      expect(types).toContain('opportunity');
    });

    it('persists insights to facebookReport after generation', async () => {
      const insights = makeInsights();
      prisma.business.findUnique.mockResolvedValue(makeBusiness());
      prisma.facebookReport.findUnique.mockResolvedValue(makeFbReport());
      aiService.generateStrategicInsights.mockResolvedValue(insights);
      prisma.facebookReport.update.mockResolvedValue(
        makeFbReport({ strategicInsights: insights }),
      );

      await service.generateFacebookInsights('biz-uuid-1', 'agency-uuid-1');

      expect(prisma.facebookReport.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { businessId: 'biz-uuid-1' },
          data: expect.objectContaining({ strategicInsights: insights }),
        }),
      );
    });

    it('returns insights from AI even after persisting them', async () => {
      const insights = makeInsights();
      prisma.business.findUnique.mockResolvedValue(makeBusiness());
      prisma.facebookReport.findUnique.mockResolvedValue(makeFbReport());
      aiService.generateStrategicInsights.mockResolvedValue(insights);
      prisma.facebookReport.update.mockResolvedValue(
        makeFbReport({ strategicInsights: insights }),
      );

      const result = await service.generateFacebookInsights(
        'biz-uuid-1',
        'agency-uuid-1',
      );

      expect(result).toEqual(insights);
    });
  });

  describe('business not found', () => {
    it('throws NotFoundException when business does not exist', async () => {
      prisma.business.findUnique.mockResolvedValue(null);

      await expect(
        service.generateFacebookInsights('non-existent-uuid', 'agency-uuid-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('does not call facebookReport.findUnique when business is not found', async () => {
      prisma.business.findUnique.mockResolvedValue(null);

      await expect(
        service.generateFacebookInsights('non-existent-uuid', 'agency-uuid-1'),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.facebookReport.findUnique).not.toHaveBeenCalled();
    });

    it('does not call AiService when business is not found', async () => {
      prisma.business.findUnique.mockResolvedValue(null);

      await expect(
        service.generateFacebookInsights('non-existent-uuid', 'agency-uuid-1'),
      ).rejects.toThrow(NotFoundException);

      expect(aiService.generateStrategicInsights).not.toHaveBeenCalled();
    });
  });

  describe('no facebook report', () => {
    it('throws BadRequestException when facebook report does not exist', async () => {
      prisma.business.findUnique.mockResolvedValue(makeBusiness());
      prisma.facebookReport.findUnique.mockResolvedValue(null);

      await expect(
        service.generateFacebookInsights('biz-uuid-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException with the expected message', async () => {
      prisma.business.findUnique.mockResolvedValue(makeBusiness());
      prisma.facebookReport.findUnique.mockResolvedValue(null);

      await expect(
        service.generateFacebookInsights('biz-uuid-1'),
      ).rejects.toThrow('No Facebook report found. Fetch Facebook data first.');
    });

    it('does not call AiService when facebook report is not found', async () => {
      prisma.business.findUnique.mockResolvedValue(makeBusiness());
      prisma.facebookReport.findUnique.mockResolvedValue(null);

      await expect(
        service.generateFacebookInsights('biz-uuid-1'),
      ).rejects.toThrow(BadRequestException);

      expect(aiService.generateStrategicInsights).not.toHaveBeenCalled();
    });
  });
});

describe('BusinessService — getFacebookInsights', () => {
  let service: BusinessService;
  let prisma: {
    business: { findUnique: jest.Mock };
    facebookReport: { findUnique: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      business: { findUnique: jest.fn() },
      facebookReport: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        BusinessService,
        { provide: PrismaService, useValue: prisma },
        { provide: AiService, useValue: {} },
        { provide: InstagramService, useValue: {} },
        { provide: FacebookService, useValue: {} },
        { provide: AiReplicateService, useValue: {} },
      ],
    }).compile();

    service = module.get<BusinessService>(BusinessService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('happy path', () => {
    it('returns saved insights from the facebook report', async () => {
      const insights = makeInsights();
      prisma.business.findUnique.mockResolvedValue({ id: 'biz-uuid-1' });
      prisma.facebookReport.findUnique.mockResolvedValue({
        strategicInsights: insights,
      });

      const result = await service.getFacebookInsights(
        'biz-uuid-1',
        'agency-uuid-1',
      );

      expect(result).toEqual(insights);
    });

    it('returns empty array when no insights have been generated yet', async () => {
      prisma.business.findUnique.mockResolvedValue({ id: 'biz-uuid-1' });
      prisma.facebookReport.findUnique.mockResolvedValue({
        strategicInsights: [],
      });

      const result = await service.getFacebookInsights(
        'biz-uuid-1',
        'agency-uuid-1',
      );

      expect(result).toEqual([]);
    });

    it('queries facebookReport by businessId selecting only strategicInsights', async () => {
      prisma.business.findUnique.mockResolvedValue({ id: 'biz-uuid-1' });
      prisma.facebookReport.findUnique.mockResolvedValue({
        strategicInsights: [],
      });

      await service.getFacebookInsights('biz-uuid-1', 'agency-uuid-1');

      expect(prisma.facebookReport.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { businessId: 'biz-uuid-1' },
          select: { strategicInsights: true },
        }),
      );
    });
  });

  describe('business not found', () => {
    it('throws NotFoundException when business does not belong to the agency', async () => {
      prisma.business.findUnique.mockResolvedValue(null);

      await expect(
        service.getFacebookInsights('biz-uuid-1', 'other-agency-uuid'),
      ).rejects.toThrow(NotFoundException);
    });

    it('does not query facebookReport when business is not found', async () => {
      prisma.business.findUnique.mockResolvedValue(null);

      await expect(
        service.getFacebookInsights('biz-uuid-1', 'other-agency-uuid'),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.facebookReport.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('no facebook report', () => {
    it('throws BadRequestException when no facebook report exists for the business', async () => {
      prisma.business.findUnique.mockResolvedValue({ id: 'biz-uuid-1' });
      prisma.facebookReport.findUnique.mockResolvedValue(null);

      await expect(
        service.getFacebookInsights('biz-uuid-1', 'agency-uuid-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException with the expected message', async () => {
      prisma.business.findUnique.mockResolvedValue({ id: 'biz-uuid-1' });
      prisma.facebookReport.findUnique.mockResolvedValue(null);

      await expect(
        service.getFacebookInsights('biz-uuid-1', 'agency-uuid-1'),
      ).rejects.toThrow('No Facebook report found. Fetch Facebook data first.');
    });
  });
});
