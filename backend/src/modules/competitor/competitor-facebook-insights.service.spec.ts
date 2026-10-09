import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { CompetitorService } from './competitor.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { AiService } from '../ai/ai.service';
import { FacebookService } from '../facebook/facebook.service';
import { InstagramService } from '../instagram/instagram.service';
import { CompetitorMediaService } from './competitor-media.service';
import { TStrategicInsight } from '../ai/schema/strategic-insights.schema';

const AGENCY_ID = 'agency-uuid-1';

const makeCompetitorWithBusiness = (
  overrides: Record<string, unknown> = {},
) => ({
  name: 'Rival Co',
  business: {
    agencyId: AGENCY_ID,
    name: 'My Business',
    industry: 'Health',
    goals: ['grow', 'convert'],
    advantages: ['fast', 'reliable'],
    language: 'en',
  },
  ...overrides,
});

const makeFbReport = (overrides: Record<string, unknown> = {}) => ({
  id: 'fb-report-uuid-1',
  competitorId: 'competitor-uuid-1',
  followers: 8000,
  posts: 90,
  postsImageCount: 40,
  postsVideoCount: 30,
  postsCarouselCount: 20,
  ads: 10,
  ads30d: 6,
  adsVideoCount: 4,
  adsImageCount: 4,
  adsCarouselCount: 2,
  adsDcoCount: 0,
  adsCtaWebsite: 5,
  adsCtaDirectMessage: 2,
  adsCtaInstagramPage: 1,
  adsCtaProduct: 2,
  adsCtaMetaPage: 0,
  topPosts: [],
  topPostTexts: [],
  topAds: [],
  topAdTexts: [],
  strategicInsights: [],
  fetchedAt: new Date('2026-10-01T00:00:00Z'),
  ...overrides,
});

const makeInsights = (): TStrategicInsight[] => [
  {
    type: 'strength',
    title: 'Active ad spend',
    description: 'Competitor runs 10 active ads.',
  },
  {
    type: 'strength',
    title: 'High follower count',
    description: 'Competitor has 8k followers.',
  },
  {
    type: 'improvement',
    title: 'Low carousel usage',
    description: 'Only 22% of posts are carousels.',
  },
  {
    type: 'improvement',
    title: 'DCO underutilized',
    description: 'No DCO ads detected.',
  },
  {
    type: 'opportunity',
    title: 'DM funnel gap',
    description: 'Competitor uses DM CTA sparingly.',
  },
  {
    type: 'opportunity',
    title: 'Video content dominance',
    description: 'Videos perform well in this niche.',
  },
];

describe('CompetitorService — generateCompetitorFacebookInsights', () => {
  let service: CompetitorService;
  let prisma: {
    competitor: { findUnique: jest.Mock };
    competitorFacebookReport: { findUnique: jest.Mock; update: jest.Mock };
  };
  let aiService: { generateCompetitorFacebookInsights: jest.Mock };

  beforeEach(async () => {
    prisma = {
      competitor: { findUnique: jest.fn() },
      competitorFacebookReport: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
    };

    aiService = {
      generateCompetitorFacebookInsights: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompetitorService,
        { provide: PrismaService, useValue: prisma },
        { provide: AiService, useValue: aiService },
        { provide: FacebookService, useValue: {} },
        { provide: InstagramService, useValue: {} },
        { provide: CompetitorMediaService, useValue: {} },
      ],
    }).compile();

    service = module.get<CompetitorService>(CompetitorService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('happy path', () => {
    it('returns 6 insights when competitor and facebook report exist', async () => {
      prisma.competitor.findUnique.mockResolvedValue(
        makeCompetitorWithBusiness(),
      );
      prisma.competitorFacebookReport.findUnique.mockResolvedValue(
        makeFbReport(),
      );
      aiService.generateCompetitorFacebookInsights.mockResolvedValue(
        makeInsights(),
      );
      prisma.competitorFacebookReport.update.mockResolvedValue(makeFbReport());

      const result = await service.generateCompetitorFacebookInsights(
        'competitor-uuid-1',
        AGENCY_ID,
      );

      expect(result).toHaveLength(6);
      result.forEach((insight) => {
        expect(['strength', 'improvement', 'opportunity']).toContain(
          insight.type,
        );
      });
    });

    it('delegates to AiService with business context, competitor name, and report', async () => {
      const competitor = makeCompetitorWithBusiness();
      const fbReport = makeFbReport();
      prisma.competitor.findUnique.mockResolvedValue(competitor);
      prisma.competitorFacebookReport.findUnique.mockResolvedValue(fbReport);
      aiService.generateCompetitorFacebookInsights.mockResolvedValue(
        makeInsights(),
      );
      prisma.competitorFacebookReport.update.mockResolvedValue(makeFbReport());

      await service.generateCompetitorFacebookInsights(
        'competitor-uuid-1',
        AGENCY_ID,
      );

      expect(aiService.generateCompetitorFacebookInsights).toHaveBeenCalledWith(
        competitor.business,
        'Rival Co',
        fbReport,
      );
    });

    it('persists insights to competitorFacebookReport', async () => {
      const insights = makeInsights();
      prisma.competitor.findUnique.mockResolvedValue(
        makeCompetitorWithBusiness(),
      );
      prisma.competitorFacebookReport.findUnique.mockResolvedValue(
        makeFbReport(),
      );
      aiService.generateCompetitorFacebookInsights.mockResolvedValue(insights);
      prisma.competitorFacebookReport.update.mockResolvedValue(makeFbReport());

      await service.generateCompetitorFacebookInsights(
        'competitor-uuid-1',
        AGENCY_ID,
      );

      expect(prisma.competitorFacebookReport.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { competitorId: 'competitor-uuid-1' },
          data: expect.objectContaining({ strategicInsights: insights }),
        }),
      );
    });
  });

  describe('competitor not found', () => {
    it('throws NotFoundException when competitor does not exist', async () => {
      prisma.competitor.findUnique.mockResolvedValue(null);

      await expect(
        service.generateCompetitorFacebookInsights(
          'non-existent-uuid',
          AGENCY_ID,
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when competitor belongs to different agency', async () => {
      prisma.competitor.findUnique.mockResolvedValue(
        makeCompetitorWithBusiness(),
      );

      await expect(
        service.generateCompetitorFacebookInsights(
          'competitor-uuid-1',
          'other-agency-id',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('does not call AiService when competitor is not found', async () => {
      prisma.competitor.findUnique.mockResolvedValue(null);

      await expect(
        service.generateCompetitorFacebookInsights(
          'non-existent-uuid',
          AGENCY_ID,
        ),
      ).rejects.toThrow();

      expect(
        aiService.generateCompetitorFacebookInsights,
      ).not.toHaveBeenCalled();
    });
  });

  describe('no facebook report', () => {
    it('throws BadRequestException when facebook report does not exist', async () => {
      prisma.competitor.findUnique.mockResolvedValue(
        makeCompetitorWithBusiness(),
      );
      prisma.competitorFacebookReport.findUnique.mockResolvedValue(null);

      await expect(
        service.generateCompetitorFacebookInsights(
          'competitor-uuid-1',
          AGENCY_ID,
        ),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('AI service failure', () => {
    it('propagates error when AiService throws', async () => {
      const { InternalServerErrorException } = await import('@nestjs/common');

      prisma.competitor.findUnique.mockResolvedValue(
        makeCompetitorWithBusiness(),
      );
      prisma.competitorFacebookReport.findUnique.mockResolvedValue(
        makeFbReport(),
      );
      aiService.generateCompetitorFacebookInsights.mockRejectedValue(
        new InternalServerErrorException('AI generation failed'),
      );

      await expect(
        service.generateCompetitorFacebookInsights(
          'competitor-uuid-1',
          AGENCY_ID,
        ),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('does not persist insights when AiService throws', async () => {
      const { InternalServerErrorException } = await import('@nestjs/common');

      prisma.competitor.findUnique.mockResolvedValue(
        makeCompetitorWithBusiness(),
      );
      prisma.competitorFacebookReport.findUnique.mockResolvedValue(
        makeFbReport(),
      );
      aiService.generateCompetitorFacebookInsights.mockRejectedValue(
        new InternalServerErrorException('AI generation failed'),
      );

      await expect(
        service.generateCompetitorFacebookInsights(
          'competitor-uuid-1',
          AGENCY_ID,
        ),
      ).rejects.toThrow();

      expect(prisma.competitorFacebookReport.update).not.toHaveBeenCalled();
    });
  });
});

describe('CompetitorService — getCompetitorFacebookInsights', () => {
  let service: CompetitorService;
  let prisma: {
    competitor: { findUnique: jest.Mock };
    competitorFacebookReport: { findUnique: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      competitor: { findUnique: jest.fn() },
      competitorFacebookReport: { findUnique: jest.fn() },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompetitorService,
        { provide: PrismaService, useValue: prisma },
        { provide: AiService, useValue: {} },
        { provide: FacebookService, useValue: {} },
        { provide: InstagramService, useValue: {} },
        { provide: CompetitorMediaService, useValue: {} },
      ],
    }).compile();

    service = module.get<CompetitorService>(CompetitorService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('happy path', () => {
    it('returns saved insights from the facebook report', async () => {
      const insights = makeInsights();
      prisma.competitor.findUnique.mockResolvedValue({
        business: { agencyId: AGENCY_ID },
      });
      prisma.competitorFacebookReport.findUnique.mockResolvedValue({
        strategicInsights: insights,
      });

      const result = await service.getCompetitorFacebookInsights(
        'competitor-uuid-1',
        AGENCY_ID,
      );

      expect(result).toEqual(insights);
    });

    it('returns empty array when no insights have been generated yet', async () => {
      prisma.competitor.findUnique.mockResolvedValue({
        business: { agencyId: AGENCY_ID },
      });
      prisma.competitorFacebookReport.findUnique.mockResolvedValue({
        strategicInsights: [],
      });

      const result = await service.getCompetitorFacebookInsights(
        'competitor-uuid-1',
        AGENCY_ID,
      );

      expect(result).toEqual([]);
    });
  });

  describe('tenant isolation', () => {
    it('throws NotFoundException when competitor belongs to different agency', async () => {
      prisma.competitor.findUnique.mockResolvedValue({
        business: { agencyId: AGENCY_ID },
      });

      await expect(
        service.getCompetitorFacebookInsights(
          'competitor-uuid-1',
          'other-agency-id',
        ),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('no facebook report', () => {
    it('throws BadRequestException when no facebook report exists', async () => {
      prisma.competitor.findUnique.mockResolvedValue({
        business: { agencyId: AGENCY_ID },
      });
      prisma.competitorFacebookReport.findUnique.mockResolvedValue(null);

      await expect(
        service.getCompetitorFacebookInsights('competitor-uuid-1', AGENCY_ID),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
