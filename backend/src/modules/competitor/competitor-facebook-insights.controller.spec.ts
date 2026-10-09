import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { CompetitorController } from './competitor.controller';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { CompetitorService } from './competitor.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { TStrategicInsight } from '../ai/schema/strategic-insights.schema';

const AGENCY_ID = 'agency-uuid-1';

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

const COMPETITOR_UUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const NON_EXISTENT_UUID = 'ffffffff-ffff-ffff-ffff-ffffffffffff';

describe('CompetitorController — facebook-insights endpoints', () => {
  let app: INestApplication;
  let competitorService: Record<string, jest.Mock>;

  beforeAll(async () => {
    competitorService = {
      generateCompetitorFacebookInsights: jest.fn(),
      getCompetitorFacebookInsights: jest.fn(),
      getCompetitors: jest.fn(),
      getCompetitor: jest.fn(),
      createCompetitor: jest.fn(),
      updateCompetitor: jest.fn(),
      deleteCompetitor: jest.fn(),
      fetchCompetitorInstagramReport: jest.fn(),
      fetchCompetitorFacebookReport: jest.fn(),
      fetchPosts: jest.fn(),
      getPosts: jest.fn(),
      fetchInstagramPosts: jest.fn(),
      getInstagramPosts: jest.fn(),
      fetchInstagramReels: jest.fn(),
      getInstagramReels: jest.fn(),
      fetchAds: jest.fn(),
      getAds: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompetitorController],
      providers: [{ provide: CompetitorService, useValue: competitorService }],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          req.user = { id: 'user-1', agencyId: AGENCY_ID };
          return true;
        },
      })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('POST /:id/facebook-insights/generate', () => {
    it('returns 201 with insights on success', async () => {
      const insights = makeInsights();
      competitorService.generateCompetitorFacebookInsights.mockResolvedValue(
        insights,
      );

      const res = await request(app.getHttpServer())
        .post(`/competitors/${COMPETITOR_UUID}/facebook-insights/generate`)
        .expect(201);

      expect(res.body).toHaveLength(6);
      expect(
        competitorService.generateCompetitorFacebookInsights,
      ).toHaveBeenCalledWith(COMPETITOR_UUID, AGENCY_ID);
    });

    it('returns 404 when competitor does not exist', async () => {
      competitorService.generateCompetitorFacebookInsights.mockRejectedValue(
        new NotFoundException(
          `Competitor with ID ${NON_EXISTENT_UUID} not found`,
        ),
      );

      await request(app.getHttpServer())
        .post(`/competitors/${NON_EXISTENT_UUID}/facebook-insights/generate`)
        .expect(404);
    });

    it('returns 400 when no facebook report exists', async () => {
      competitorService.generateCompetitorFacebookInsights.mockRejectedValue(
        new BadRequestException(
          'No Facebook report found for this competitor.',
        ),
      );

      await request(app.getHttpServer())
        .post(`/competitors/${COMPETITOR_UUID}/facebook-insights/generate`)
        .expect(400);
    });

    it('returns 400 when id param is not a valid UUID', async () => {
      await request(app.getHttpServer())
        .post('/competitors/not-a-uuid/facebook-insights/generate')
        .expect(400);
    });
  });

  describe('GET /:id/facebook-insights', () => {
    it('returns 200 with stored insights', async () => {
      const insights = makeInsights();
      competitorService.getCompetitorFacebookInsights.mockResolvedValue(
        insights,
      );

      const res = await request(app.getHttpServer())
        .get(`/competitors/${COMPETITOR_UUID}/facebook-insights`)
        .expect(200);

      expect(res.body).toHaveLength(6);
      expect(
        competitorService.getCompetitorFacebookInsights,
      ).toHaveBeenCalledWith(COMPETITOR_UUID, AGENCY_ID);
    });

    it('returns 200 with empty array when no insights generated yet', async () => {
      competitorService.getCompetitorFacebookInsights.mockResolvedValue([]);

      const res = await request(app.getHttpServer())
        .get(`/competitors/${COMPETITOR_UUID}/facebook-insights`)
        .expect(200);

      expect(res.body).toEqual([]);
    });

    it('returns 400 when no facebook report exists', async () => {
      competitorService.getCompetitorFacebookInsights.mockRejectedValue(
        new BadRequestException(
          'No Facebook report found for this competitor.',
        ),
      );

      await request(app.getHttpServer())
        .get(`/competitors/${COMPETITOR_UUID}/facebook-insights`)
        .expect(400);
    });

    it('returns 400 when id param is not a valid UUID', async () => {
      await request(app.getHttpServer())
        .get('/competitors/not-a-uuid/facebook-insights')
        .expect(400);
    });
  });
});
