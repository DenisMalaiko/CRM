import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AiReplicateService } from './ai-replicate.service';
import { S3Service } from '../../core/s3/s3.service';

describe('AiReplicateService — generateAndSaveVideo (integration)', () => {
  let module: TestingModule;
  let service: AiReplicateService;

  let mockReplicate: { run: jest.Mock };
  let mockFetch: jest.Mock;
  let mockS3Service: jest.Mocked<Pick<S3Service, 'upload' | 'delete'>>;

  // Capture the original global fetch so we can restore it after each test
  const originalFetch = global.fetch;

  beforeAll(async () => {
    mockS3Service = {
      upload: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [
        AiReplicateService,
        { provide: S3Service, useValue: mockS3Service },
      ],
    }).compile();

    service = module.get<AiReplicateService>(AiReplicateService);

    // Replace the internal Replicate instance with a controllable mock.
    // The constructor stores it as `this.replicate`; we reach it via the
    // compiled service instance.
    mockReplicate = { run: jest.fn() };
    (service as any).replicate = mockReplicate;
  });

  afterAll(async () => {
    global.fetch = originalFetch;
    await module.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Default Replicate mock: returns an object with url() giving a video URL
    mockReplicate.run.mockResolvedValue({
      url: () => 'https://replicate-delivery.example.com/video.mp4',
    });

    // Default fetch mock: returns a successful response with a small buffer
    mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      arrayBuffer: async () => new ArrayBuffer(8),
    });
    global.fetch = mockFetch;

    mockS3Service.upload.mockResolvedValue(undefined as any);
  });

  // ─────────────────────────────────────────────
  // Happy path — text-to-video (no sourceUrl)
  // ─────────────────────────────────────────────
  describe('text-to-video (no sourceUrl)', () => {
    it('calls Replicate with the seedance-1-lite model', async () => {
      await service.generateAndSaveVideo({
        prompt: 'A sunrise over the mountains',
        businessId: 'biz-001',
      });

      expect(mockReplicate.run).toHaveBeenCalledWith(
        'bytedance/seedance-1-lite',
        expect.objectContaining({ input: expect.any(Object) }),
      );
    });

    it('does not include image in the Replicate input when sourceUrl is absent', async () => {
      await service.generateAndSaveVideo({
        prompt: 'A sunrise over the mountains',
        businessId: 'biz-001',
      });

      const { input } = mockReplicate.run.mock.calls[0][1];
      expect(input).not.toHaveProperty('image');
    });

    it('uploads the downloaded buffer to S3 with video/mp4 content type', async () => {
      await service.generateAndSaveVideo({
        prompt: 'product showcase',
        businessId: 'biz-002',
      });

      expect(mockS3Service.upload).toHaveBeenCalledWith(
        expect.stringMatching(/^ai-videos\/biz-002\/.+\.mp4$/),
        expect.any(Buffer),
        'video/mp4',
      );
    });

    it('returns an S3 key matching the ai-videos/ pattern', async () => {
      const key = await service.generateAndSaveVideo({
        prompt: 'promo clip',
        businessId: 'biz-003',
      });

      expect(key).toMatch(/^ai-videos\/biz-003\/.+\.mp4$/);
    });
  });

  // ─────────────────────────────────────────────
  // Happy path — image-to-video (with sourceUrl)
  // ─────────────────────────────────────────────
  describe('image-to-video (with sourceUrl)', () => {
    it('includes image param in the Replicate input when sourceUrl is provided', async () => {
      await service.generateAndSaveVideo({
        prompt: 'product in motion',
        businessId: 'biz-001',
        sourceUrl: 'https://example.com/product.jpg',
      });

      const { input } = mockReplicate.run.mock.calls[0][1];
      expect(input.image).toBe('https://example.com/product.jpg');
    });

    it('returns a valid S3 key for image-to-video generation', async () => {
      const key = await service.generateAndSaveVideo({
        prompt: 'animated product',
        businessId: 'biz-004',
        sourceUrl: 'https://example.com/photo.jpg',
      });

      expect(key).toMatch(/^ai-videos\/biz-004\/.+\.mp4$/);
    });
  });

  // ─────────────────────────────────────────────
  // Default parameters
  // ─────────────────────────────────────────────
  describe('default parameters', () => {
    it('sends fps=24, duration=5, resolution=720p, aspect_ratio=16:9 when not provided', async () => {
      await service.generateAndSaveVideo({
        prompt: 'default params test',
        businessId: 'biz-001',
      });

      const { input } = mockReplicate.run.mock.calls[0][1];
      expect(input.fps).toBe(24);
      expect(input.duration).toBe(5);
      expect(input.resolution).toBe('720p');
      expect(input.aspect_ratio).toBe('16:9');
    });

    it('forwards the provided prompt to Replicate input', async () => {
      await service.generateAndSaveVideo({
        prompt: 'cinematic drone shot',
        businessId: 'biz-001',
      });

      const { input } = mockReplicate.run.mock.calls[0][1];
      expect(input.prompt).toBe('cinematic drone shot');
    });
  });

  // ─────────────────────────────────────────────
  // Custom parameters
  // ─────────────────────────────────────────────
  describe('custom parameters', () => {
    it('uses the provided aspectRatio instead of the default 16:9', async () => {
      await service.generateAndSaveVideo({
        prompt: 'story reel',
        businessId: 'biz-001',
        aspectRatio: '9:16',
      });

      const { input } = mockReplicate.run.mock.calls[0][1];
      expect(input.aspect_ratio).toBe('9:16');
    });

    it('uses a custom duration when provided', async () => {
      await service.generateAndSaveVideo({
        prompt: 'short clip',
        businessId: 'biz-001',
        duration: 3,
      });

      const { input } = mockReplicate.run.mock.calls[0][1];
      expect(input.duration).toBe(3);
    });
  });

  // ─────────────────────────────────────────────
  // Error handling
  // ─────────────────────────────────────────────
  describe('error handling', () => {
    it('throws InternalServerErrorException when fetch returns a non-ok response', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 503,
      });

      await expect(
        service.generateAndSaveVideo({
          prompt: 'bad fetch test',
          businessId: 'biz-001',
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('includes the HTTP status in the error message when fetch fails', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(
        service.generateAndSaveVideo({
          prompt: 'not found video',
          businessId: 'biz-001',
        }),
      ).rejects.toThrow('404');
    });

    it('does not call S3 upload when fetch fails', async () => {
      mockFetch.mockResolvedValue({ ok: false, status: 500 });

      await expect(
        service.generateAndSaveVideo({
          prompt: 'fetch error',
          businessId: 'biz-001',
        }),
      ).rejects.toThrow(InternalServerErrorException);

      expect(mockS3Service.upload).not.toHaveBeenCalled();
    });

    it('propagates Replicate errors as-is', async () => {
      mockReplicate.run.mockRejectedValue(new Error('Replicate quota exceeded'));

      await expect(
        service.generateAndSaveVideo({
          prompt: 'quota test',
          businessId: 'biz-001',
        }),
      ).rejects.toThrow('Replicate quota exceeded');
    });
  });
});
