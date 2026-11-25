import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { FalImageService } from './fal-image.service';
import { S3Service } from '../../../core/s3/s3.service';
import { FAL_MODEL_CHAIN, FAL_PREVIEW_MODEL } from './fal-models.config';
import { FalGenerateInput } from './fal.types';

const baseInput: FalGenerateInput = {
  prompt: 'A product on a white background',
  text: 'Buy Now',
  referenceUrls: ['https://example.com/ref1.jpg'],
  aspectRatio: '4:5',
};

const makeValidFalResponse = (count = 1) => ({
  data: {
    images: Array.from({ length: count }, (_, i) => ({
      url: `https://cdn.fal.ai/image${i}.png`,
      width: 896,
      height: 1120,
    })),
  },
  requestId: `req-${Math.random().toString(36).slice(2)}`,
});

describe('FalImageService (integration)', () => {
  let module: TestingModule;
  let service: FalImageService;
  let mockFalClient: { subscribe: jest.Mock };
  let mockS3Service: jest.Mocked<Pick<S3Service, 'upload'>>;
  let mockFetch: jest.Mock;

  const originalFetch = global.fetch;

  beforeAll(async () => {
    mockS3Service = {
      upload: jest.fn().mockResolvedValue(undefined),
    };

    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [
        FalImageService,
        { provide: S3Service, useValue: mockS3Service },
      ],
    }).compile();

    service = module.get<FalImageService>(FalImageService);

    mockFalClient = { subscribe: jest.fn() };
    (service as any).fal = mockFalClient;
  });

  afterAll(async () => {
    global.fetch = originalFetch;
    await module.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    mockFalClient.subscribe.mockResolvedValue(makeValidFalResponse());

    mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      arrayBuffer: async () => new ArrayBuffer(16),
    });
    global.fetch = mockFetch;

    mockS3Service.upload.mockResolvedValue(undefined as any);
  });

  // ─────────────────────────────────────────────
  // generateForPost — happy path
  // ─────────────────────────────────────────────
  describe('generateForPost', () => {
    it('returns a result with imageUrls, modelId, requestId, and latencyMs', async () => {
      const result = await service.generateForPost(baseInput, 'biz-001');

      expect(Array.isArray(result.imageUrls)).toBe(true);
      expect(typeof result.modelId).toBe('string');
      expect(typeof result.requestId).toBe('string');
      expect(typeof result.latencyMs).toBe('number');
    });

    it('uploads images to S3 under ai-images/<businessId>/', async () => {
      await service.generateForPost(baseInput, 'biz-001');

      expect(mockS3Service.upload).toHaveBeenCalledWith(
        expect.stringMatching(/^ai-images\/biz-001\/.+\.png$/),
        expect.any(Buffer),
        'image/png',
      );
    });

    it('returns S3 keys that match the ai-images/<businessId>/ pattern', async () => {
      const result = await service.generateForPost(baseInput, 'biz-002');

      result.imageUrls.forEach((key) => {
        expect(key).toMatch(/^ai-images\/biz-002\/.+\.png$/);
      });
    });

    it('uses the first model in the chain (Sunburst) on success', async () => {
      const result = await service.generateForPost(baseInput, 'biz-001');

      expect(result.modelId).toBe(FAL_MODEL_CHAIN[0].id);
    });

    it('passes the adapted payload to fal.subscribe', async () => {
      await service.generateForPost(baseInput, 'biz-001');

      expect(mockFalClient.subscribe).toHaveBeenCalledWith(
        FAL_MODEL_CHAIN[0].id,
        expect.objectContaining({ input: expect.any(Object) }),
      );
    });
  });

  // ─────────────────────────────────────────────
  // generateForPost — fallback logic
  // ─────────────────────────────────────────────
  describe('generateForPost — fallback', () => {
    it('falls back to the second model when the first fails', async () => {
      mockFalClient.subscribe
        .mockRejectedValueOnce(new Error('Model unavailable'))
        .mockResolvedValue(makeValidFalResponse());

      const result = await service.generateForPost(baseInput, 'biz-001');

      expect(result.modelId).toBe(FAL_MODEL_CHAIN[1].id);
    });

    it('falls back through the full chain and uses the last model when all previous fail', async () => {
      const lastModelIndex = FAL_MODEL_CHAIN.length - 1;

      mockFalClient.subscribe
        .mockRejectedValueOnce(new Error('fail 0'))
        .mockRejectedValueOnce(new Error('fail 1'))
        .mockRejectedValueOnce(new Error('fail 2'))
        .mockRejectedValueOnce(new Error('fail 3'))
        .mockResolvedValue(makeValidFalResponse());

      const result = await service.generateForPost(baseInput, 'biz-001');

      expect(result.modelId).toBe(FAL_MODEL_CHAIN[lastModelIndex].id);
    });

    it('throws InternalServerErrorException when all models in the chain fail', async () => {
      mockFalClient.subscribe.mockRejectedValue(new Error('permanent failure'));

      await expect(
        service.generateForPost(baseInput, 'biz-001'),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('error message mentions "All fal.ai models failed" when chain is exhausted', async () => {
      mockFalClient.subscribe.mockRejectedValue(new Error('unavailable'));

      await expect(
        service.generateForPost(baseInput, 'biz-001'),
      ).rejects.toThrow('All fal.ai models failed');
    });
  });

  // ─────────────────────────────────────────────
  // generatePreview — happy path
  // ─────────────────────────────────────────────
  describe('generatePreview', () => {
    it('uses the preview model (Flare)', async () => {
      mockFalClient.subscribe.mockResolvedValue(makeValidFalResponse(2));

      const result = await service.generatePreview(baseInput, 'biz-001');

      expect(result.modelId).toBe(FAL_PREVIEW_MODEL.id);
      expect(mockFalClient.subscribe).toHaveBeenCalledWith(
        FAL_PREVIEW_MODEL.id,
        expect.any(Object),
      );
    });

    it('returns imageUrls under ai-images/<businessId>/', async () => {
      mockFalClient.subscribe.mockResolvedValue(makeValidFalResponse(2));

      const result = await service.generatePreview(baseInput, 'biz-003');

      result.imageUrls.forEach((key) => {
        expect(key).toMatch(/^ai-images\/biz-003\/.+\.png$/);
      });
    });

    it('defaults variants to 2 when not provided', async () => {
      mockFalClient.subscribe.mockResolvedValue(makeValidFalResponse(2));
      const inputWithoutVariants: FalGenerateInput = { ...baseInput };
      delete inputWithoutVariants.variants;

      await service.generatePreview(inputWithoutVariants, 'biz-001');

      const callArgs = mockFalClient.subscribe.mock.calls[0][1];
      expect(callArgs.input.num_images).toBe(2);
    });

    it('clamps variants to minimum of 2', async () => {
      mockFalClient.subscribe.mockResolvedValue(makeValidFalResponse(2));
      const input: FalGenerateInput = { ...baseInput, variants: 1 };

      await service.generatePreview(input, 'biz-001');

      const callArgs = mockFalClient.subscribe.mock.calls[0][1];
      expect(callArgs.input.num_images).toBe(2);
    });

    it('clamps variants to maximum of 3', async () => {
      mockFalClient.subscribe.mockResolvedValue(makeValidFalResponse(3));
      const input: FalGenerateInput = { ...baseInput, variants: 10 };

      await service.generatePreview(input, 'biz-001');

      const callArgs = mockFalClient.subscribe.mock.calls[0][1];
      expect(callArgs.input.num_images).toBe(3);
    });

    it('returns the correct number of S3 keys matching the number of images', async () => {
      mockFalClient.subscribe.mockResolvedValue(makeValidFalResponse(3));
      const input: FalGenerateInput = { ...baseInput, variants: 3 };

      const result = await service.generatePreview(input, 'biz-001');

      expect(result.imageUrls).toHaveLength(3);
    });
  });

  // ─────────────────────────────────────────────
  // downloadAndUploadToS3 — error handling
  // ─────────────────────────────────────────────
  describe('downloadAndUploadToS3 error handling', () => {
    it('throws InternalServerErrorException when image download returns non-ok response', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 503 });

      await expect(
        service.generateForPost(baseInput, 'biz-001'),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('includes the HTTP status in the error message on download failure', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 404 });

      await expect(
        service.generateForPost(baseInput, 'biz-001'),
      ).rejects.toThrow('404');
    });

    it('does not call S3 upload when image download fails', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });

      await expect(
        service.generateForPost(baseInput, 'biz-001'),
      ).rejects.toThrow();

      expect(mockS3Service.upload).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────
  // Zod validation of fal.ai response
  // ─────────────────────────────────────────────
  describe('Zod validation of fal.ai response', () => {
    it('throws when fal response has no images field', async () => {
      mockFalClient.subscribe.mockResolvedValue({
        data: { unexpected: true },
        requestId: 'req-bad',
      });

      await expect(
        service.generateForPost(baseInput, 'biz-001'),
      ).rejects.toThrow();
    });

    it('throws when fal response images array is empty', async () => {
      mockFalClient.subscribe.mockResolvedValue({
        data: { images: [] },
        requestId: 'req-empty',
      });

      await expect(
        service.generateForPost(baseInput, 'biz-001'),
      ).rejects.toThrow();
    });

    it('throws when an image object is missing url', async () => {
      mockFalClient.subscribe.mockResolvedValue({
        data: { images: [{ width: 896, height: 1120 }] },
        requestId: 'req-no-url',
      });

      await expect(
        service.generateForPost(baseInput, 'biz-001'),
      ).rejects.toThrow();
    });
  });

  // ─────────────────────────────────────────────
  // Tenant isolation
  // ─────────────────────────────────────────────
  describe('tenant isolation', () => {
    it('S3 key contains the businessId passed to generateForPost', async () => {
      await service.generateForPost(baseInput, 'business-abc-123');

      expect(mockS3Service.upload).toHaveBeenCalledWith(
        expect.stringContaining('business-abc-123'),
        expect.any(Buffer),
        'image/png',
      );
    });

    it('S3 key contains the businessId passed to generatePreview', async () => {
      mockFalClient.subscribe.mockResolvedValue(makeValidFalResponse(2));

      await service.generatePreview(baseInput, 'business-xyz-456');

      expect(mockS3Service.upload).toHaveBeenCalledWith(
        expect.stringContaining('business-xyz-456'),
        expect.any(Buffer),
        'image/png',
      );
    });
  });
});
