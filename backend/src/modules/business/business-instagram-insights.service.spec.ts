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

const makeIgReport = (overrides: Record<string, unknown> = {}) => ({
  id: 'ig-report-uuid-1',
  businessId: 'biz-uuid-1',
  followers: 12000,
  posts: 200,
  postsImageCount: 100,
  postsVideoCount: 60,
  postsCarouselCount: 40,
  reels: 80,
  stories: 150,
  storiesImageCount: 90,
  storiesVideoCount: 60,
  strategicInsights: [],
  fetchedAt: new Date('2026-10-01T00:00:00Z'),
  createdAt: new Date('2026-10-01T00:00:00Z'),
  updatedAt: new Date('2026-10-01T00:00:00Z'),
  ...overrides,
});

const makeInsights = (): TStrategicInsight[] => [
  {
    type: 'strength',
    title: 'Large follower base',
    description: 'Your page has 12k followers.',
  },
  {
    type: 'strength',
    title: 'Consistent posting',
    description: 'You post reels and stories regularly.',
  },
  {
    type: 'improvement',
    title: 'Low carousel usage',
    description: 'Only 20% of posts are carousels.',
  },
  {
    type: 'improvement',
    title: 'Stories engagement gap',
    description: 'Stories-to-follower ratio is low.',
  },
  {
    type: 'opportunity',
    title: 'Reels growth potential',
    description: 'Reels drive organic reach on Instagram.',
  },
  {
    type: 'opportunity',
    title: 'Video stories untapped',
    description: 'Video stories have higher completion rates.',
  },
];

describe('BusinessService — generateInstagramInsights', () => {
  let service: BusinessService;
  let prisma: {
    business: { findUnique: jest.Mock };
    instagramReport: { findUnique: jest.Mock; update: jest.Mock };
  };
  let aiService: { generateInstagramInsights: jest.Mock };

  beforeEach(async () => {
    prisma = {
      business: { findUnique: jest.fn() },
      instagramReport: { findUnique: jest.fn(), update: jest.fn() },
    };

    aiService = {
      generateInstagramInsights: jest.fn(),
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
    it('returns 6 insights when business and instagram report both exist', async () => {
      prisma.business.findUnique.mockResolvedValue(makeBusiness());
      prisma.instagramReport.findUnique.mockResolvedValue(makeIgReport());
      aiService.generateInstagramInsights.mockResolvedValue(makeInsights());

      const result = await service.generateInstagramInsights(
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

    it('calls prisma.business.findUnique with the correct businessId and agencyId', async () => {
      prisma.business.findUnique.mockResolvedValue(makeBusiness());
      prisma.instagramReport.findUnique.mockResolvedValue(makeIgReport());
      aiService.generateInstagramInsights.mockResolvedValue(makeInsights());

      await service.generateInstagramInsights('biz-uuid-1', 'agency-uuid-1');

      expect(prisma.business.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: 'biz-uuid-1', agencyId: 'agency-uuid-1' },
        }),
      );
    });

    it('calls prisma.instagramReport.findUnique with the correct businessId', async () => {
      prisma.business.findUnique.mockResolvedValue(makeBusiness());
      prisma.instagramReport.findUnique.mockResolvedValue(makeIgReport());
      aiService.generateInstagramInsights.mockResolvedValue(makeInsights());

      await service.generateInstagramInsights('biz-uuid-1', 'agency-uuid-1');

      expect(prisma.instagramReport.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { businessId: 'biz-uuid-1' } }),
      );
    });

    it('delegates to AiService.generateInstagramInsights with business and igReport', async () => {
      const business = makeBusiness();
      const igReport = makeIgReport();
      prisma.business.findUnique.mockResolvedValue(business);
      prisma.instagramReport.findUnique.mockResolvedValue(igReport);
      aiService.generateInstagramInsights.mockResolvedValue(makeInsights());

      await service.generateInstagramInsights('biz-uuid-1', 'agency-uuid-1');

      expect(aiService.generateInstagramInsights).toHaveBeenCalledWith(
        business,
        igReport,
      );
    });

    it('returns insights that include all three types (strength, improvement, opportunity)', async () => {
      prisma.business.findUnique.mockResolvedValue(makeBusiness());
      prisma.instagramReport.findUnique.mockResolvedValue(makeIgReport());
      aiService.generateInstagramInsights.mockResolvedValue(makeInsights());

      const result = await service.generateInstagramInsights(
        'biz-uuid-1',
        'agency-uuid-1',
      );

      const types = result.map((i) => i.type);
      expect(types).toContain('strength');
      expect(types).toContain('improvement');
      expect(types).toContain('opportunity');
    });

    it('persists insights to instagramReport after generation', async () => {
      const insights = makeInsights();
      prisma.business.findUnique.mockResolvedValue(makeBusiness());
      prisma.instagramReport.findUnique.mockResolvedValue(makeIgReport());
      aiService.generateInstagramInsights.mockResolvedValue(insights);
      prisma.instagramReport.update.mockResolvedValue(
        makeIgReport({ strategicInsights: insights }),
      );

      await service.generateInstagramInsights('biz-uuid-1', 'agency-uuid-1');

      expect(prisma.instagramReport.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { businessId: 'biz-uuid-1' },
          data: expect.objectContaining({ strategicInsights: insights }),
        }),
      );
    });

    it('returns insights from AI even after persisting them', async () => {
      const insights = makeInsights();
      prisma.business.findUnique.mockResolvedValue(makeBusiness());
      prisma.instagramReport.findUnique.mockResolvedValue(makeIgReport());
      aiService.generateInstagramInsights.mockResolvedValue(insights);
      prisma.instagramReport.update.mockResolvedValue(
        makeIgReport({ strategicInsights: insights }),
      );

      const result = await service.generateInstagramInsights(
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
        service.generateInstagramInsights('non-existent-uuid', 'agency-uuid-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('does not call instagramReport.findUnique when business is not found', async () => {
      prisma.business.findUnique.mockResolvedValue(null);

      await expect(
        service.generateInstagramInsights('non-existent-uuid', 'agency-uuid-1'),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.instagramReport.findUnique).not.toHaveBeenCalled();
    });

    it('does not call AiService when business is not found', async () => {
      prisma.business.findUnique.mockResolvedValue(null);

      await expect(
        service.generateInstagramInsights('non-existent-uuid', 'agency-uuid-1'),
      ).rejects.toThrow(NotFoundException);

      expect(aiService.generateInstagramInsights).not.toHaveBeenCalled();
    });
  });

  describe('tenant isolation', () => {
    it('throws NotFoundException when business belongs to a different agency', async () => {
      prisma.business.findUnique.mockResolvedValue(null);

      await expect(
        service.generateInstagramInsights('biz-uuid-1', 'other-agency-uuid'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('no instagram report', () => {
    it('throws BadRequestException when instagram report does not exist', async () => {
      prisma.business.findUnique.mockResolvedValue(makeBusiness());
      prisma.instagramReport.findUnique.mockResolvedValue(null);

      await expect(
        service.generateInstagramInsights('biz-uuid-1', 'agency-uuid-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException with the expected message', async () => {
      prisma.business.findUnique.mockResolvedValue(makeBusiness());
      prisma.instagramReport.findUnique.mockResolvedValue(null);

      await expect(
        service.generateInstagramInsights('biz-uuid-1', 'agency-uuid-1'),
      ).rejects.toThrow(
        'No Instagram report found. Fetch Instagram data first.',
      );
    });

    it('does not call AiService when instagram report is not found', async () => {
      prisma.business.findUnique.mockResolvedValue(makeBusiness());
      prisma.instagramReport.findUnique.mockResolvedValue(null);

      await expect(
        service.generateInstagramInsights('biz-uuid-1', 'agency-uuid-1'),
      ).rejects.toThrow(BadRequestException);

      expect(aiService.generateInstagramInsights).not.toHaveBeenCalled();
    });
  });
});

describe('BusinessService — getInstagramInsights', () => {
  let service: BusinessService;
  let prisma: {
    business: { findUnique: jest.Mock };
    instagramReport: { findUnique: jest.Mock };
  };

  beforeEach(async () => {
    prisma = {
      business: { findUnique: jest.fn() },
      instagramReport: { findUnique: jest.fn() },
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
    it('returns saved insights from the instagram report', async () => {
      const insights = makeInsights();
      prisma.business.findUnique.mockResolvedValue({ id: 'biz-uuid-1' });
      prisma.instagramReport.findUnique.mockResolvedValue({
        strategicInsights: insights,
      });

      const result = await service.getInstagramInsights(
        'biz-uuid-1',
        'agency-uuid-1',
      );

      expect(result).toEqual(insights);
    });

    it('returns empty array when no insights have been generated yet', async () => {
      prisma.business.findUnique.mockResolvedValue({ id: 'biz-uuid-1' });
      prisma.instagramReport.findUnique.mockResolvedValue({
        strategicInsights: [],
      });

      const result = await service.getInstagramInsights(
        'biz-uuid-1',
        'agency-uuid-1',
      );

      expect(result).toEqual([]);
    });

    it('queries instagramReport by businessId selecting only strategicInsights', async () => {
      prisma.business.findUnique.mockResolvedValue({ id: 'biz-uuid-1' });
      prisma.instagramReport.findUnique.mockResolvedValue({
        strategicInsights: [],
      });

      await service.getInstagramInsights('biz-uuid-1', 'agency-uuid-1');

      expect(prisma.instagramReport.findUnique).toHaveBeenCalledWith(
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
        service.getInstagramInsights('biz-uuid-1', 'other-agency-uuid'),
      ).rejects.toThrow(NotFoundException);
    });

    it('does not query instagramReport when business is not found', async () => {
      prisma.business.findUnique.mockResolvedValue(null);

      await expect(
        service.getInstagramInsights('biz-uuid-1', 'other-agency-uuid'),
      ).rejects.toThrow(NotFoundException);

      expect(prisma.instagramReport.findUnique).not.toHaveBeenCalled();
    });
  });

  describe('no instagram report', () => {
    it('throws BadRequestException when no instagram report exists for the business', async () => {
      prisma.business.findUnique.mockResolvedValue({ id: 'biz-uuid-1' });
      prisma.instagramReport.findUnique.mockResolvedValue(null);

      await expect(
        service.getInstagramInsights('biz-uuid-1', 'agency-uuid-1'),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException with the expected message', async () => {
      prisma.business.findUnique.mockResolvedValue({ id: 'biz-uuid-1' });
      prisma.instagramReport.findUnique.mockResolvedValue(null);

      await expect(
        service.getInstagramInsights('biz-uuid-1', 'agency-uuid-1'),
      ).rejects.toThrow(
        'No Instagram report found. Fetch Instagram data first.',
      );
    });
  });
});
