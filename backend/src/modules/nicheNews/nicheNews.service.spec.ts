import { Test, TestingModule } from '@nestjs/testing';
import { Logger, NotFoundException } from '@nestjs/common';
import { NicheNewsService, NewsItem } from './nicheNews.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { AiBaseService, AiModel } from '../ai/services/ai-base.service';

// Local type mirrors the current schema — agencyId was replaced by businessId.
// Using a local type avoids coupling to the stale generated Prisma client.
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
  businessId: 'biz-uuid-1',
  title: 'Test headline',
  summary: 'Test summary',
  url: 'https://example.com/article-1',
  source: 'Test Source',
  industry: 'Health',
  publishedAt: new Date('2026-09-22T10:00:00Z'),
  createdAt: new Date('2026-09-22T00:00:00Z'),
  ...overrides,
});

describe('NicheNewsService', () => {
  let service: NicheNewsService;
  let prisma: {
    business: { findUnique: jest.Mock };
    nicheNews: {
      findMany: jest.Mock;
      deleteMany: jest.Mock;
      upsert: jest.Mock;
    };
    ideaAI: { create: jest.Mock };
    $transaction: jest.Mock;
  };
  let mockModel: { invoke: jest.Mock };
  let aiBase: {
    getModel: jest.Mock;
    safeParseJson: jest.Mock;
    extractTextContent: jest.Mock;
  };
  let loggerWarnSpy: jest.SpyInstance;

  beforeEach(async () => {
    prisma = {
      business: { findUnique: jest.fn() },
      nicheNews: {
        findMany: jest.fn().mockResolvedValue([]),
        deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
        upsert: jest.fn(),
      },
      ideaAI: { create: jest.fn() },
      $transaction: jest.fn().mockImplementation((input) => {
        if (typeof input === 'function') return input(prisma);
        return Promise.resolve(input);
      }),
    };

    mockModel = { invoke: jest.fn() };

    aiBase = {
      getModel: jest.fn().mockReturnValue(mockModel),
      safeParseJson: jest.fn(),
      extractTextContent: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NicheNewsService,
        { provide: PrismaService, useValue: prisma },
        { provide: AiBaseService, useValue: aiBase },
      ],
    }).compile();

    service = module.get<NicheNewsService>(NicheNewsService);

    loggerWarnSpy = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'log').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  // ─────────────────────────────────────────────────────────────
  // getByBusinessId
  // ─────────────────────────────────────────────────────────────
  describe('getByBusinessId', () => {
    it('returns news records for the given businessId', async () => {
      const records = [makeNicheNewsRecord()];
      prisma.business.findUnique.mockResolvedValue({
        agencyId: 'agency-uuid-1',
      });
      prisma.nicheNews.findMany.mockResolvedValue(records);

      const result = await service.getByBusinessId(
        'biz-uuid-1',
        'agency-uuid-1',
      );

      expect(result).toEqual(records);
      expect(prisma.nicheNews.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { businessId: 'biz-uuid-1' },
          orderBy: { publishedAt: 'desc' },
          take: 20,
        }),
      );
    });

    it('throws NotFoundException when business does not exist', async () => {
      prisma.business.findUnique.mockResolvedValue(null);

      await expect(
        service.getByBusinessId('non-existent-uuid', 'agency-uuid-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when agencyId does not match', async () => {
      prisma.business.findUnique.mockResolvedValue({
        agencyId: 'other-agency',
      });

      await expect(
        service.getByBusinessId('biz-uuid-1', 'agency-uuid-1'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // fetchByBusinessId
  // ─────────────────────────────────────────────────────────────
  describe('fetchByBusinessId', () => {
    it('throws NotFoundException when business does not exist', async () => {
      prisma.business.findUnique.mockResolvedValue(null);

      await expect(
        service.fetchByBusinessId('non-existent', 'agency-uuid-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when agencyId does not match', async () => {
      prisma.business.findUnique.mockResolvedValue({
        agencyId: 'other-agency',
        industry: 'Health',
        language: 'en',
        name: 'Test',
        goals: [],
        advantages: [],
        brand: null,
        products: [],
        businessProfiles: [],
      });

      await expect(
        service.fetchByBusinessId('biz-uuid-1', 'agency-uuid-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when business has no industry set', async () => {
      prisma.business.findUnique.mockResolvedValue({
        agencyId: 'agency-uuid-1',
        industry: null,
        language: 'en',
        name: 'Test',
        goals: [],
        advantages: [],
        brand: null,
        products: [],
        businessProfiles: [],
      });

      await expect(
        service.fetchByBusinessId('biz-uuid-1', 'agency-uuid-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when industry has no category mapping', async () => {
      prisma.business.findUnique.mockResolvedValue({
        agencyId: 'agency-uuid-1',
        industry: 'UnknownIndustry',
        language: 'en',
        name: 'Test',
        goals: [],
        advantages: [],
        brand: null,
        products: [],
        businessProfiles: [],
      });

      await expect(
        service.fetchByBusinessId('biz-uuid-1', 'agency-uuid-1'),
      ).rejects.toThrow(NotFoundException);
    });

    it('fetches news and saves via saveNewsForBusiness', async () => {
      prisma.business.findUnique.mockResolvedValue({
        agencyId: 'agency-uuid-1',
        industry: 'Health',
        language: 'en',
        name: 'Test Biz',
        goals: [],
        advantages: [],
        brand: null,
        products: [],
        businessProfiles: [],
      });

      const items = [makeNewsItem()];
      const saved = [makeNicheNewsRecord()];

      jest.spyOn(service, 'fetchFromNewsdata').mockResolvedValue(items);
      jest.spyOn(service, 'saveNewsForBusiness').mockResolvedValue(saved);
      jest.spyOn(service, 'generateIdeasFromNews').mockResolvedValue();
      // fetchByBusinessId ends by delegating to getByBusinessId which reads findMany
      prisma.nicheNews.findMany.mockResolvedValue(saved);

      const result = await service.fetchByBusinessId(
        'biz-uuid-1',
        'agency-uuid-1',
      );

      expect(result).toEqual(saved);
      expect(service.fetchFromNewsdata).toHaveBeenCalledWith('health', 'en');
      expect(service.saveNewsForBusiness).toHaveBeenCalledWith(
        'biz-uuid-1',
        'Health',
        expect.any(Array),
      );
    });

    it('maps ua language to ua for fetchFromNewsdata', async () => {
      prisma.business.findUnique.mockResolvedValue({
        agencyId: 'agency-uuid-1',
        industry: 'Health',
        language: 'ua',
        name: 'Test Biz',
        goals: [],
        advantages: [],
        brand: null,
        products: [],
        businessProfiles: [],
      });

      jest.spyOn(service, 'fetchFromNewsdata').mockResolvedValue([]);
      jest.spyOn(service, 'saveNewsForBusiness').mockResolvedValue([]);
      jest.spyOn(service, 'generateIdeasFromNews').mockResolvedValue();

      await service.fetchByBusinessId('biz-uuid-1', 'agency-uuid-1');

      expect(service.fetchFromNewsdata).toHaveBeenCalledWith('health', 'ua');
    });

    it('passes filtered items from filterNewsByRelevance to saveNewsForBusiness', async () => {
      prisma.business.findUnique.mockResolvedValue({
        agencyId: 'agency-uuid-1',
        industry: 'Health',
        language: 'en',
        name: 'Test Biz',
        goals: ['grow'],
        advantages: ['fast'],
        brand: null,
        products: [],
        businessProfiles: [],
      });

      const allItems = [
        makeNewsItem({ url: 'https://example.com/a' }),
        makeNewsItem({ url: 'https://example.com/b' }),
      ];
      const filteredItems = [allItems[0]];

      jest.spyOn(service, 'fetchFromNewsdata').mockResolvedValue(allItems);
      jest
        .spyOn(service, 'filterNewsByRelevance')
        .mockResolvedValue(filteredItems);
      jest.spyOn(service, 'saveNewsForBusiness').mockResolvedValue([]);
      jest.spyOn(service, 'generateIdeasFromNews').mockResolvedValue();

      await service.fetchByBusinessId('biz-uuid-1', 'agency-uuid-1');

      expect(service.filterNewsByRelevance).toHaveBeenCalled();
      expect(service.saveNewsForBusiness).toHaveBeenCalledWith(
        'biz-uuid-1',
        'Health',
        filteredItems,
      );
    });

    it('calls generateIdeasFromNews after saveNewsForBusiness', async () => {
      prisma.business.findUnique.mockResolvedValue({
        agencyId: 'agency-uuid-1',
        industry: 'Health',
        language: 'en',
        name: 'Test Biz',
        goals: ['grow'],
        advantages: ['fast'],
        brand: null,
        products: [],
        businessProfiles: [],
      });

      const saved = [makeNicheNewsRecord()];
      jest
        .spyOn(service, 'fetchFromNewsdata')
        .mockResolvedValue([makeNewsItem()]);
      jest.spyOn(service, 'saveNewsForBusiness').mockResolvedValue(saved);
      const generateSpy = jest
        .spyOn(service, 'generateIdeasFromNews')
        .mockResolvedValue();

      await service.fetchByBusinessId('biz-uuid-1', 'agency-uuid-1');

      expect(generateSpy).toHaveBeenCalledWith(
        expect.objectContaining({ industry: 'Health' }),
        'biz-uuid-1',
        saved,
      );
    });

    it('passes products to filterContext with only name and type fields', async () => {
      prisma.business.findUnique.mockResolvedValue({
        agencyId: 'agency-uuid-1',
        industry: 'Health',
        language: 'en',
        name: 'Test Biz',
        goals: ['grow'],
        advantages: ['fast'],
        brand: null,
        products: [
          {
            name: 'Supplement A',
            description: 'Great supplement',
            type: 'Physical',
          },
          { name: 'App B', description: 'Mobile app', type: 'Digital' },
        ],
        businessProfiles: [],
      });

      jest.spyOn(service, 'fetchFromNewsdata').mockResolvedValue([]);
      const filterSpy = jest
        .spyOn(service, 'filterNewsByRelevance')
        .mockResolvedValue([]);
      jest.spyOn(service, 'saveNewsForBusiness').mockResolvedValue([]);
      jest.spyOn(service, 'generateIdeasFromNews').mockResolvedValue();

      await service.fetchByBusinessId('biz-uuid-1', 'agency-uuid-1');

      expect(filterSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          products: [
            { name: 'Supplement A', type: 'Physical' },
            { name: 'App B', type: 'Digital' },
          ],
        }),
        expect.any(Array),
      );
    });

    it('passes full product objects (with description) to ideasContext', async () => {
      prisma.business.findUnique.mockResolvedValue({
        agencyId: 'agency-uuid-1',
        industry: 'Health',
        language: 'en',
        name: 'Test Biz',
        goals: ['grow'],
        advantages: ['fast'],
        brand: 'Friendly and expert',
        products: [
          {
            name: 'Supplement A',
            description: 'Great supplement',
            type: 'Physical',
          },
        ],
        businessProfiles: [],
      });

      jest
        .spyOn(service, 'fetchFromNewsdata')
        .mockResolvedValue([makeNewsItem()]);
      jest
        .spyOn(service, 'filterNewsByRelevance')
        .mockResolvedValue([makeNewsItem()]);
      jest
        .spyOn(service, 'saveNewsForBusiness')
        .mockResolvedValue([makeNicheNewsRecord()]);
      const generateSpy = jest
        .spyOn(service, 'generateIdeasFromNews')
        .mockResolvedValue();

      await service.fetchByBusinessId('biz-uuid-1', 'agency-uuid-1');

      expect(generateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          brand: 'Friendly and expert',
          products: [
            {
              name: 'Supplement A',
              description: 'Great supplement',
              type: 'Physical',
            },
          ],
        }),
        'biz-uuid-1',
        expect.any(Array),
      );
    });

    it('deduplicates audiences from multiple active profiles by audience name', async () => {
      const sharedAudience = {
        targetAudience: {
          name: 'Fitness Enthusiast',
          pains: ['lack of energy'],
          desires: ['feel stronger'],
          interests: ['gym'],
        },
      };

      prisma.business.findUnique.mockResolvedValue({
        agencyId: 'agency-uuid-1',
        industry: 'Health',
        language: 'en',
        name: 'Test Biz',
        goals: ['grow'],
        advantages: ['fast'],
        brand: null,
        products: [],
        businessProfiles: [
          { audiences: [sharedAudience] },
          { audiences: [sharedAudience] },
        ],
      });

      jest
        .spyOn(service, 'fetchFromNewsdata')
        .mockResolvedValue([makeNewsItem()]);
      jest
        .spyOn(service, 'filterNewsByRelevance')
        .mockResolvedValue([makeNewsItem()]);
      jest
        .spyOn(service, 'saveNewsForBusiness')
        .mockResolvedValue([makeNicheNewsRecord()]);
      const generateSpy = jest
        .spyOn(service, 'generateIdeasFromNews')
        .mockResolvedValue();

      await service.fetchByBusinessId('biz-uuid-1', 'agency-uuid-1');

      expect(generateSpy).toHaveBeenCalledWith(
        expect.objectContaining({
          audiences: [expect.objectContaining({ name: 'Fitness Enthusiast' })],
        }),
        'biz-uuid-1',
        expect.any(Array),
      );
    });

    it('passes undefined brand to ideasContext when business.brand is null', async () => {
      prisma.business.findUnique.mockResolvedValue({
        agencyId: 'agency-uuid-1',
        industry: 'Health',
        language: 'en',
        name: 'Test Biz',
        goals: [],
        advantages: [],
        brand: null,
        products: [],
        businessProfiles: [],
      });

      jest
        .spyOn(service, 'fetchFromNewsdata')
        .mockResolvedValue([makeNewsItem()]);
      jest
        .spyOn(service, 'filterNewsByRelevance')
        .mockResolvedValue([makeNewsItem()]);
      jest
        .spyOn(service, 'saveNewsForBusiness')
        .mockResolvedValue([makeNicheNewsRecord()]);
      const generateSpy = jest
        .spyOn(service, 'generateIdeasFromNews')
        .mockResolvedValue();

      await service.fetchByBusinessId('biz-uuid-1', 'agency-uuid-1');

      const calledWith = generateSpy.mock.calls[0][0] as { brand?: string };
      expect(calledWith.brand).toBeUndefined();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // filterNewsByRelevance
  // ─────────────────────────────────────────────────────────────
  describe('filterNewsByRelevance', () => {
    const business = {
      name: 'Acme Health',
      industry: 'Health',
      goals: ['increase revenue'],
      advantages: ['fast delivery'],
    };

    it('returns only items at the relevant indexes returned by AI', async () => {
      const items = [
        makeNewsItem({ url: 'https://example.com/0' }),
        makeNewsItem({ url: 'https://example.com/1' }),
        makeNewsItem({ url: 'https://example.com/2' }),
      ];

      mockModel.invoke.mockResolvedValue({
        content: '{"relevantIndexes":[0,2]}',
      });
      aiBase.extractTextContent.mockReturnValue('{"relevantIndexes":[0,2]}');
      aiBase.safeParseJson.mockReturnValue({ relevantIndexes: [0, 2] });

      const result = await service.filterNewsByRelevance(business, items);

      expect(result).toHaveLength(2);
      expect(result[0].url).toBe('https://example.com/0');
      expect(result[1].url).toBe('https://example.com/2');
    });

    it('returns empty array immediately when items list is empty', async () => {
      const result = await service.filterNewsByRelevance(business, []);

      expect(result).toEqual([]);
      expect(aiBase.getModel).not.toHaveBeenCalled();
    });

    it('returns all items unchanged when AI model throws', async () => {
      const items = [
        makeNewsItem({ url: 'https://example.com/0' }),
        makeNewsItem({ url: 'https://example.com/1' }),
      ];

      mockModel.invoke.mockRejectedValue(new Error('OpenAI timeout'));

      const result = await service.filterNewsByRelevance(business, items);

      expect(result).toEqual(items);
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('OpenAI timeout'),
      );
    });

    it('returns empty array when AI returns empty relevantIndexes', async () => {
      const items = [
        makeNewsItem({ url: 'https://example.com/0' }),
        makeNewsItem({ url: 'https://example.com/1' }),
      ];

      mockModel.invoke.mockResolvedValue({ content: '{"relevantIndexes":[]}' });
      aiBase.extractTextContent.mockReturnValue('{"relevantIndexes":[]}');
      aiBase.safeParseJson.mockReturnValue({ relevantIndexes: [] });

      const result = await service.filterNewsByRelevance(business, items);

      expect(result).toEqual([]);
    });

    it('filters out out-of-bounds indexes from AI response', async () => {
      const items = [
        makeNewsItem({ url: 'https://example.com/0' }),
        makeNewsItem({ url: 'https://example.com/1' }),
      ];

      mockModel.invoke.mockResolvedValue({
        content: '{"relevantIndexes":[0,5,99]}',
      });
      aiBase.extractTextContent.mockReturnValue('{"relevantIndexes":[0,5,99]}');
      aiBase.safeParseJson.mockReturnValue({ relevantIndexes: [0, 5, 99] });

      const result = await service.filterNewsByRelevance(business, items);

      expect(result).toHaveLength(1);
      expect(result[0].url).toBe('https://example.com/0');
    });

    it('returns all items when safeParseJson throws (malformed AI output)', async () => {
      const items = [
        makeNewsItem(),
        makeNewsItem({ url: 'https://example.com/2' }),
      ];

      mockModel.invoke.mockResolvedValue({ content: 'not valid json at all' });
      aiBase.extractTextContent.mockReturnValue('not valid json at all');
      aiBase.safeParseJson.mockImplementation(() => {
        throw new SyntaxError('Unexpected token');
      });

      const result = await service.filterNewsByRelevance(business, items);

      expect(result).toEqual(items);
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Unexpected token'),
      );
    });

    it('returns all items when Zod schema validation fails', async () => {
      const items = [makeNewsItem()];

      mockModel.invoke.mockResolvedValue({ content: '{"wrong":"schema"}' });
      aiBase.extractTextContent.mockReturnValue('{"wrong":"schema"}');
      aiBase.safeParseJson.mockReturnValue({ wrong: 'schema' });

      const result = await service.filterNewsByRelevance(business, items);

      expect(result).toEqual(items);
      expect(loggerWarnSpy).toHaveBeenCalled();
    });

    it('calls getModel with AiModel.Fast', async () => {
      const items = [makeNewsItem()];

      mockModel.invoke.mockResolvedValue({
        content: '{"relevantIndexes":[0]}',
      });
      aiBase.extractTextContent.mockReturnValue('{"relevantIndexes":[0]}');
      aiBase.safeParseJson.mockReturnValue({ relevantIndexes: [0] });

      await service.filterNewsByRelevance(business, items);

      expect(aiBase.getModel).toHaveBeenCalledWith(AiModel.Fast);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // saveNewsForBusiness
  // ─────────────────────────────────────────────────────────────
  describe('saveNewsForBusiness', () => {
    it('happy path — upserts each item and returns saved records', async () => {
      const items = [
        makeNewsItem({ url: 'https://example.com/a1' }),
        makeNewsItem({
          url: 'https://example.com/a2',
          title: 'Second headline',
        }),
      ];
      const savedRecords = items.map((item, i) =>
        makeNicheNewsRecord({
          id: `news-${i}`,
          url: item.url,
          title: item.title,
        }),
      );

      prisma.$transaction.mockImplementation(
        async (callback: (tx: typeof prisma) => Promise<NicheNewsRecord[]>) => {
          const tx = {
            nicheNews: {
              deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
              upsert: jest
                .fn()
                .mockResolvedValueOnce(savedRecords[0])
                .mockResolvedValueOnce(savedRecords[1]),
            },
          };
          return callback(tx as unknown as typeof prisma);
        },
      );

      const result = await service.saveNewsForBusiness(
        'biz-uuid-1',
        'Health',
        items,
      );

      expect(result).toHaveLength(2);
      expect(result[0].url).toBe('https://example.com/a1');
      expect(result[1].url).toBe('https://example.com/a2');
    });

    it('deletes old news for the given businessId and industry before upserting', async () => {
      const deleteManyMock = jest.fn().mockResolvedValue({ count: 1 });
      const upsertMock = jest.fn().mockResolvedValue(makeNicheNewsRecord());

      prisma.$transaction.mockImplementation(
        async (callback: (tx: typeof prisma) => Promise<NicheNewsRecord[]>) => {
          const tx = {
            nicheNews: { deleteMany: deleteManyMock, upsert: upsertMock },
          };
          return callback(tx as unknown as typeof prisma);
        },
      );

      await service.saveNewsForBusiness('biz-uuid-1', 'Health', [
        makeNewsItem(),
      ]);

      expect(deleteManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            businessId: 'biz-uuid-1',
            industry: 'Health',
          }),
        }),
      );
    });

    it('upsert uses businessId_url composite as unique key', async () => {
      const item = makeNewsItem({ url: 'https://example.com/dupe' });
      const record = makeNicheNewsRecord({ url: item.url });
      const upsertMock = jest.fn().mockResolvedValue(record);

      prisma.$transaction.mockImplementation(
        async (callback: (tx: typeof prisma) => Promise<NicheNewsRecord[]>) => {
          const tx = {
            nicheNews: {
              deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
              upsert: upsertMock,
            },
          };
          return callback(tx as unknown as typeof prisma);
        },
      );

      await service.saveNewsForBusiness('biz-uuid-1', 'Health', [item]);

      expect(upsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: {
            businessId_url: { businessId: 'biz-uuid-1', url: item.url },
          },
          update: expect.objectContaining({ title: item.title }),
          create: expect.objectContaining({
            businessId: 'biz-uuid-1',
            industry: 'Health',
          }),
        }),
      );
    });

    it('skips a failing upsert and continues with remaining items', async () => {
      const items = [
        makeNewsItem({ url: 'https://example.com/fail' }),
        makeNewsItem({ url: 'https://example.com/ok', title: 'Good article' }),
      ];
      const goodRecord = makeNicheNewsRecord({
        url: items[1].url,
        title: items[1].title,
      });
      const upsertMock = jest
        .fn()
        .mockRejectedValueOnce(new Error('DB constraint'))
        .mockResolvedValueOnce(goodRecord);

      prisma.$transaction.mockImplementation(
        async (callback: (tx: typeof prisma) => Promise<NicheNewsRecord[]>) => {
          const tx = {
            nicheNews: {
              deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
              upsert: upsertMock,
            },
          };
          return callback(tx as unknown as typeof prisma);
        },
      );

      const result = await service.saveNewsForBusiness(
        'biz-uuid-1',
        'Health',
        items,
      );

      expect(result).toHaveLength(1);
      expect(result[0].url).toBe('https://example.com/ok');
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('DB constraint'),
      );
    });

    it('returns empty array when items list is empty', async () => {
      prisma.$transaction.mockImplementation(
        async (callback: (tx: typeof prisma) => Promise<NicheNewsRecord[]>) => {
          const tx = {
            nicheNews: {
              deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
              upsert: jest.fn(),
            },
          };
          return callback(tx as unknown as typeof prisma);
        },
      );

      const result = await service.saveNewsForBusiness(
        'biz-uuid-1',
        'Health',
        [],
      );

      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // generateIdeasFromNews
  // ─────────────────────────────────────────────────────────────
  describe('generateIdeasFromNews', () => {
    const business = {
      name: 'Acme Health',
      industry: 'Health',
      goals: ['increase revenue'],
      advantages: ['fast delivery'],
    };

    const makeValidIdeasResponse = () => ({
      ideas: [
        {
          newsIndex: 0,
          title: 'Idea title',
          description: 'Idea description',
          who: 'Person',
          what: 'Story',
          why: 'Inform',
          how: 'Storytelling',
          feeling: 'Trust',
        },
      ],
    });

    it('returns immediately without AI call when savedNews is empty', async () => {
      await service.generateIdeasFromNews(business, 'biz-uuid-1', []);

      expect(aiBase.getModel).not.toHaveBeenCalled();
    });

    it('creates IdeaAI records via $transaction array form', async () => {
      const news = [makeNicheNewsRecord({ id: 'news-1' })];
      const createdIdea = { id: 'idea-1' };

      mockModel.invoke.mockResolvedValue({ content: '{"ideas":[...]}' });
      aiBase.extractTextContent.mockReturnValue('{"ideas":[...]}');
      aiBase.safeParseJson.mockReturnValue(makeValidIdeasResponse());
      prisma.ideaAI.create.mockResolvedValue(createdIdea);

      prisma.$transaction.mockImplementation((input) => {
        if (typeof input === 'function') return input(prisma);
        return Promise.resolve(input);
      });

      await service.generateIdeasFromNews(business, 'biz-uuid-1', news);

      expect(prisma.ideaAI.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            businessId: 'biz-uuid-1',
            nicheNewsId: 'news-1',
          }),
        }),
      );
    });

    it('calls getModel with AiModel.Creative', async () => {
      const news = [makeNicheNewsRecord()];

      mockModel.invoke.mockResolvedValue({ content: '{}' });
      aiBase.extractTextContent.mockReturnValue('{}');
      aiBase.safeParseJson.mockReturnValue({ ideas: [] });

      await service.generateIdeasFromNews(business, 'biz-uuid-1', news);

      expect(aiBase.getModel).toHaveBeenCalledWith(AiModel.Creative);
    });

    it('filters out ideas with out-of-bounds newsIndex', async () => {
      const news = [makeNicheNewsRecord({ id: 'news-0' })];

      mockModel.invoke.mockResolvedValue({ content: '{}' });
      aiBase.extractTextContent.mockReturnValue('{}');
      aiBase.safeParseJson.mockReturnValue({
        ideas: [
          { ...makeValidIdeasResponse().ideas[0], newsIndex: 0 },
          { ...makeValidIdeasResponse().ideas[0], newsIndex: 99 },
        ],
      });
      prisma.ideaAI.create.mockResolvedValue({ id: 'idea-1' });
      prisma.$transaction.mockImplementation((input) => {
        if (typeof input === 'function') return input(prisma);
        return Promise.resolve(input);
      });

      await service.generateIdeasFromNews(business, 'biz-uuid-1', news);

      // Only idea at index 0 should be created; index 99 is filtered out
      expect(prisma.ideaAI.create).toHaveBeenCalledTimes(1);
    });

    it('does not throw when AI call fails (graceful degradation)', async () => {
      const news = [makeNicheNewsRecord()];

      mockModel.invoke.mockRejectedValue(new Error('AI timeout'));

      await expect(
        service.generateIdeasFromNews(business, 'biz-uuid-1', news),
      ).resolves.toBeUndefined();

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('AI timeout'),
      );
    });

    it('does not throw when safeParseJson returns malformed JSON', async () => {
      const news = [makeNicheNewsRecord()];

      mockModel.invoke.mockResolvedValue({ content: 'not json' });
      aiBase.extractTextContent.mockReturnValue('not json');
      aiBase.safeParseJson.mockImplementation(() => {
        throw new SyntaxError('Unexpected token');
      });

      await expect(
        service.generateIdeasFromNews(business, 'biz-uuid-1', news),
      ).resolves.toBeUndefined();

      expect(loggerWarnSpy).toHaveBeenCalled();
    });

    it('does not throw when Zod validation fails', async () => {
      const news = [makeNicheNewsRecord()];

      mockModel.invoke.mockResolvedValue({ content: '{"wrong":"schema"}' });
      aiBase.extractTextContent.mockReturnValue('{"wrong":"schema"}');
      aiBase.safeParseJson.mockReturnValue({ wrong: 'schema' });

      await expect(
        service.generateIdeasFromNews(business, 'biz-uuid-1', news),
      ).resolves.toBeUndefined();

      expect(loggerWarnSpy).toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // fetchFromNewsdata
  // ─────────────────────────────────────────────────────────────
  describe('fetchFromNewsdata', () => {
    const makeArticle = (
      overrides: Partial<{
        title: string | null;
        link: string | null;
        description: string | null;
        source_name: string | null;
        pubDate: string | null;
      }> = {},
    ) => ({
      title: 'Article title',
      link: 'https://news.example.com/1',
      description: 'Article summary',
      source_name: 'Example News',
      pubDate: '2026-09-22 10:00:00',
      ...overrides,
    });

    const makeNewsdataResponse = (
      articles: ReturnType<typeof makeArticle>[],
      nextPage: string | null = null,
    ) => ({
      status: 'success',
      totalResults: articles.length,
      results: articles,
      nextPage,
    });

    const mockFetch = (responses: object[]) => {
      let callIndex = 0;
      jest.spyOn(global, 'fetch').mockImplementation(() => {
        const body = responses[callIndex] ?? responses[responses.length - 1];
        callIndex++;
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve(body),
          text: () => Promise.resolve(JSON.stringify(body)),
        } as unknown as Response);
      });
    };

    beforeEach(() => {
      process.env.NEWSDATA_API_KEY = 'test-api-key';
    });

    afterEach(() => {
      delete process.env.NEWSDATA_API_KEY;
      jest.restoreAllMocks();
    });

    it('returns empty array when NEWSDATA_API_KEY is not set', async () => {
      delete process.env.NEWSDATA_API_KEY;

      const result = await service.fetchFromNewsdata('health', 'en');

      expect(result).toEqual([]);
    });

    it('fetches a single page and returns mapped items when nextPage is null', async () => {
      mockFetch([makeNewsdataResponse([makeArticle()], null)]);

      const result = await service.fetchFromNewsdata('health', 'en');

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Article title');
      expect(result[0].url).toBe('https://news.example.com/1');
      expect(result[0].summary).toBe('Article summary');
      expect(result[0].source).toBe('Example News');
    });

    it('fetches multiple pages when nextPage is present', async () => {
      const page1Article = makeArticle({
        link: 'https://news.example.com/page1',
      });
      const page2Article = makeArticle({
        link: 'https://news.example.com/page2',
      });

      mockFetch([
        makeNewsdataResponse([page1Article], 'cursor-page-2'),
        makeNewsdataResponse([page2Article], null),
      ]);

      const result = await service.fetchFromNewsdata('health', 'en');

      expect(result).toHaveLength(2);
      expect(result[0].url).toBe('https://news.example.com/page1');
      expect(result[1].url).toBe('https://news.example.com/page2');
    });

    it('passes nextPage cursor as page param on subsequent requests', async () => {
      const fetchSpy = jest
        .spyOn(global, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve(
              makeNewsdataResponse(
                [makeArticle({ link: 'https://news.example.com/a' })],
                'cursor-abc',
              ),
            ),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve(
              makeNewsdataResponse(
                [makeArticle({ link: 'https://news.example.com/b' })],
                null,
              ),
            ),
        } as unknown as Response);

      await service.fetchFromNewsdata('health', 'en');

      const secondCallUrl = String(fetchSpy.mock.calls[1][0]);
      expect(secondCallUrl).toContain('page=cursor-abc');
    });

    it('stops at maxPages limit even when nextPage is still present', async () => {
      const fetchSpy = jest.spyOn(global, 'fetch').mockResolvedValue({
        ok: true,
        json: () =>
          Promise.resolve(
            makeNewsdataResponse([makeArticle()], 'cursor-always-present'),
          ),
      } as unknown as Response);

      const result = await service.fetchFromNewsdata('health', 'en', 3);

      expect(fetchSpy).toHaveBeenCalledTimes(3);
      expect(result).toHaveLength(3);
    });

    it('stops and returns items from previous pages when an API error occurs on a subsequent page', async () => {
      jest
        .spyOn(global, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve(
              makeNewsdataResponse(
                [makeArticle({ link: 'https://news.example.com/good' })],
                'cursor-page-2',
              ),
            ),
        } as unknown as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 429,
          text: () => Promise.resolve('Rate limit exceeded'),
        } as unknown as Response);

      const result = await service.fetchFromNewsdata('health', 'en');

      expect(result).toHaveLength(1);
      expect(result[0].url).toBe('https://news.example.com/good');
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('429'),
      );
    });

    it('stops and returns items from previous pages when fetch throws a network error', async () => {
      jest
        .spyOn(global, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve(
              makeNewsdataResponse(
                [makeArticle({ link: 'https://news.example.com/good' })],
                'cursor-page-2',
              ),
            ),
        } as unknown as Response)
        .mockRejectedValueOnce(new Error('Network failure'));

      const result = await service.fetchFromNewsdata('health', 'en');

      expect(result).toHaveLength(1);
      expect(result[0].url).toBe('https://news.example.com/good');
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('Network failure'),
      );
    });

    it('stops when API returns non-success status in body', async () => {
      mockFetch([
        { status: 'error', totalResults: 0, results: null, nextPage: null },
      ]);

      const result = await service.fetchFromNewsdata('health', 'en');

      expect(result).toEqual([]);
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('error'),
      );
    });

    it('filters out articles missing title or link', async () => {
      mockFetch([
        makeNewsdataResponse(
          [
            makeArticle({ title: null }),
            makeArticle({ link: null }),
            makeArticle({
              title: 'Valid',
              link: 'https://news.example.com/valid',
            }),
          ],
          null,
        ),
      ]);

      const result = await service.fetchFromNewsdata('health', 'en');

      expect(result).toHaveLength(1);
      expect(result[0].url).toBe('https://news.example.com/valid');
    });

    it('uses current date for articles with null pubDate', async () => {
      const before = new Date();
      mockFetch([makeNewsdataResponse([makeArticle({ pubDate: null })], null)]);

      const result = await service.fetchFromNewsdata('health', 'en');

      const after = new Date();
      expect(result).toHaveLength(1);
      expect(result[0].publishedAt.getTime()).toBeGreaterThanOrEqual(
        before.getTime(),
      );
      expect(result[0].publishedAt.getTime()).toBeLessThanOrEqual(
        after.getTime(),
      );
    });

    it('returns empty array when results is null', async () => {
      mockFetch([
        { status: 'success', totalResults: 0, results: null, nextPage: null },
      ]);

      const result = await service.fetchFromNewsdata('health', 'en');

      expect(result).toEqual([]);
    });
  });

  // ─────────────────────────────────────────────────────────────
  // selectTopItems
  // ─────────────────────────────────────────────────────────────
  describe('selectTopItems', () => {
    it('returns items sorted by publishedAt descending', () => {
      const items: NewsItem[] = [
        makeNewsItem({
          url: 'u1',
          publishedAt: new Date('2026-09-20T00:00:00Z'),
        }),
        makeNewsItem({
          url: 'u2',
          publishedAt: new Date('2026-09-22T00:00:00Z'),
        }),
        makeNewsItem({
          url: 'u3',
          publishedAt: new Date('2026-09-21T00:00:00Z'),
        }),
      ];

      const result = service.selectTopItems(items, 3);

      expect(result[0].url).toBe('u2');
      expect(result[1].url).toBe('u3');
      expect(result[2].url).toBe('u1');
    });

    it('returns only top N items', () => {
      const items: NewsItem[] = Array.from({ length: 15 }, (_, i) =>
        makeNewsItem({
          url: `https://example.com/${i}`,
          publishedAt: new Date(Date.now() - i * 1000),
        }),
      );

      const result = service.selectTopItems(items, 10);

      expect(result).toHaveLength(10);
    });

    it('does not mutate the original array', () => {
      const items: NewsItem[] = [
        makeNewsItem({
          url: 'u1',
          publishedAt: new Date('2026-09-20T00:00:00Z'),
        }),
        makeNewsItem({
          url: 'u2',
          publishedAt: new Date('2026-09-22T00:00:00Z'),
        }),
      ];
      const original = [...items];

      service.selectTopItems(items, 2);

      expect(items[0].url).toBe(original[0].url);
    });
  });
});
