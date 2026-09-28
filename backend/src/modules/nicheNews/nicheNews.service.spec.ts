import { Test, TestingModule } from '@nestjs/testing';
import { Logger, NotFoundException } from '@nestjs/common';
import { NicheNewsService, NewsItem } from './nicheNews.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { AiBaseService, AiModel } from '../ai/services/ai-base.service';
import { type NicheNews } from '@prisma/client';

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

describe('NicheNewsService', () => {
  let service: NicheNewsService;
  let prisma: {
    business: { findUnique: jest.Mock };
    nicheNews: {
      findMany: jest.Mock;
      deleteMany: jest.Mock;
      upsert: jest.Mock;
    };
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
      $transaction: jest.fn(),
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
    it('returns news records for the business agency and industry', async () => {
      const records = [makeNicheNewsRecord()];
      prisma.business.findUnique.mockResolvedValue({
        agencyId: 'agency-uuid-1',
        industry: 'Health',
      });
      prisma.nicheNews.findMany.mockResolvedValue(records);

      const result = await service.getByBusinessId('biz-uuid-1');

      expect(result).toEqual(records);
      expect(prisma.nicheNews.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { agencyId: 'agency-uuid-1', industry: 'Health' },
          orderBy: { publishedAt: 'desc' },
          take: 20,
        }),
      );
    });

    it('throws NotFoundException when business does not exist', async () => {
      prisma.business.findUnique.mockResolvedValue(null);

      await expect(
        service.getByBusinessId('non-existent-uuid'),
      ).rejects.toThrow(NotFoundException);
    });

    it('queries without industry filter when business has no industry set', async () => {
      prisma.business.findUnique.mockResolvedValue({
        agencyId: 'agency-uuid-1',
        industry: null,
      });
      prisma.nicheNews.findMany.mockResolvedValue([]);

      await service.getByBusinessId('biz-uuid-1');

      expect(prisma.nicheNews.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { agencyId: 'agency-uuid-1', industry: undefined },
        }),
      );
    });
  });

  // ─────────────────────────────────────────────────────────────
  // fetchByBusinessId
  // ─────────────────────────────────────────────────────────────
  describe('fetchByBusinessId', () => {
    it('throws NotFoundException when business does not exist', async () => {
      prisma.business.findUnique.mockResolvedValue(null);

      await expect(service.fetchByBusinessId('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException when business has no industry set', async () => {
      prisma.business.findUnique.mockResolvedValue({
        agencyId: 'agency-uuid-1',
        industry: null,
        language: 'en',
      });

      await expect(service.fetchByBusinessId('biz-uuid-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('throws NotFoundException when industry has no category mapping', async () => {
      prisma.business.findUnique.mockResolvedValue({
        agencyId: 'agency-uuid-1',
        industry: 'UnknownIndustry',
        language: 'en',
      });

      await expect(service.fetchByBusinessId('biz-uuid-1')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('fetches news and saves via saveNewsForIndustry', async () => {
      prisma.business.findUnique.mockResolvedValue({
        agencyId: 'agency-uuid-1',
        industry: 'Health',
        language: 'en',
      });

      const items = [makeNewsItem()];
      const saved = [makeNicheNewsRecord()];

      jest.spyOn(service, 'fetchFromNewsdata').mockResolvedValue(items);
      jest.spyOn(service, 'saveNewsForIndustry').mockResolvedValue(saved);

      const result = await service.fetchByBusinessId('biz-uuid-1');

      expect(result).toEqual(saved);
      expect(service.fetchFromNewsdata).toHaveBeenCalledWith('health', 'en');
      expect(service.saveNewsForIndustry).toHaveBeenCalledWith(
        'agency-uuid-1',
        'Health',
        expect.any(Array),
      );
    });

    it('maps ua language to ua for fetchFromNewsdata', async () => {
      prisma.business.findUnique.mockResolvedValue({
        agencyId: 'agency-uuid-1',
        industry: 'Health',
        language: 'ua',
      });

      jest.spyOn(service, 'fetchFromNewsdata').mockResolvedValue([]);
      jest.spyOn(service, 'saveNewsForIndustry').mockResolvedValue([]);

      await service.fetchByBusinessId('biz-uuid-1');

      expect(service.fetchFromNewsdata).toHaveBeenCalledWith('health', 'ua');
    });

    it('passes filtered items from filterNewsByRelevance to saveNewsForIndustry', async () => {
      prisma.business.findUnique.mockResolvedValue({
        agencyId: 'agency-uuid-1',
        industry: 'Health',
        language: 'en',
        name: 'Test Biz',
        goals: ['grow'],
        advantages: ['fast'],
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
      jest.spyOn(service, 'saveNewsForIndustry').mockResolvedValue([]);

      await service.fetchByBusinessId('biz-uuid-1');

      expect(service.filterNewsByRelevance).toHaveBeenCalled();
      expect(service.saveNewsForIndustry).toHaveBeenCalledWith(
        'agency-uuid-1',
        'Health',
        filteredItems,
      );
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

      // AI returns index 5 and 99 which are both out of bounds for a 2-item array
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
  // saveNewsForIndustry
  // ─────────────────────────────────────────────────────────────
  describe('saveNewsForIndustry', () => {
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

      // Simulate transaction calling the callback with a transaction proxy
      prisma.$transaction.mockImplementation(
        async (callback: (tx: typeof prisma) => Promise<NicheNews[]>) => {
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

      const result = await service.saveNewsForIndustry(
        'agency-uuid-1',
        'Health',
        items,
      );

      expect(result).toHaveLength(2);
      expect(result[0].url).toBe('https://example.com/a1');
      expect(result[1].url).toBe('https://example.com/a2');
    });

    it('deletes today news for the given agencyId and industry before upserting', async () => {
      const deleteManyMock = jest.fn().mockResolvedValue({ count: 1 });
      const upsertMock = jest.fn().mockResolvedValue(makeNicheNewsRecord());

      prisma.$transaction.mockImplementation(
        async (callback: (tx: typeof prisma) => Promise<NicheNews[]>) => {
          const tx = {
            nicheNews: { deleteMany: deleteManyMock, upsert: upsertMock },
          };
          return callback(tx as unknown as typeof prisma);
        },
      );

      await service.saveNewsForIndustry('agency-uuid-1', 'Health', [
        makeNewsItem(),
      ]);

      expect(deleteManyMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            agencyId: 'agency-uuid-1',
            industry: 'Health',
          }),
        }),
      );
    });

    it('upsert uses url as unique key — update fields do not include agencyId', async () => {
      const item = makeNewsItem({ url: 'https://example.com/dupe' });
      const record = makeNicheNewsRecord({ url: item.url });
      const upsertMock = jest.fn().mockResolvedValue(record);

      prisma.$transaction.mockImplementation(
        async (callback: (tx: typeof prisma) => Promise<NicheNews[]>) => {
          const tx = {
            nicheNews: {
              deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
              upsert: upsertMock,
            },
          };
          return callback(tx as unknown as typeof prisma);
        },
      );

      await service.saveNewsForIndustry('agency-uuid-1', 'Health', [item]);

      expect(upsertMock).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { url: item.url },
          update: expect.objectContaining({ title: item.title }),
          create: expect.objectContaining({
            agencyId: 'agency-uuid-1',
            industry: 'Health',
          }),
        }),
      );
      // update block must NOT re-set agencyId (avoid multi-tenant leak on conflict)
      const updateArg = upsertMock.mock.calls[0][0].update;
      expect(updateArg).not.toHaveProperty('agencyId');
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
        async (callback: (tx: typeof prisma) => Promise<NicheNews[]>) => {
          const tx = {
            nicheNews: {
              deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
              upsert: upsertMock,
            },
          };
          return callback(tx as unknown as typeof prisma);
        },
      );

      const result = await service.saveNewsForIndustry(
        'agency-uuid-1',
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
        async (callback: (tx: typeof prisma) => Promise<NicheNews[]>) => {
          const tx = {
            nicheNews: {
              deleteMany: jest.fn().mockResolvedValue({ count: 0 }),
              upsert: jest.fn(),
            },
          };
          return callback(tx as unknown as typeof prisma);
        },
      );

      const result = await service.saveNewsForIndustry(
        'agency-uuid-1',
        'Health',
        [],
      );

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
