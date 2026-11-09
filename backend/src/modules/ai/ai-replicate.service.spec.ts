import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GalleryPhotoType } from '@prisma/client';

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
    it('calls Replicate with the seedance-2.0-fast model', async () => {
      await service.generateAndSaveVideo({
        prompt: 'A sunrise over the mountains',
        businessId: 'biz-001',
      });

      expect(mockReplicate.run).toHaveBeenCalledWith(
        'bytedance/seedance-2.0-fast',
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
    it('includes sourceUrl in reference_images when sourceUrl is provided', async () => {
      await service.generateAndSaveVideo({
        prompt: 'product in motion',
        businessId: 'biz-001',
        sourceUrl: 'https://example.com/product.jpg',
      });

      const { input } = mockReplicate.run.mock.calls[0][1];
      expect(input.reference_images).toContain(
        'https://example.com/product.jpg',
      );
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
    it('sends duration=7, seed=99, resolution=720p, aspect_ratio=16:9 when not provided', async () => {
      await service.generateAndSaveVideo({
        prompt: 'default params test',
        businessId: 'biz-001',
      });

      const { input } = mockReplicate.run.mock.calls[0][1];
      expect(input.duration).toBe(7);
      expect(input.seed).toBe(99);
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
      mockReplicate.run.mockRejectedValue(
        new Error('Replicate quota exceeded'),
      );

      await expect(
        service.generateAndSaveVideo({
          prompt: 'quota test',
          businessId: 'biz-001',
        }),
      ).rejects.toThrow('Replicate quota exceeded');
    });
  });
});

// ─────────────────────────────────────────────
// buildPostImagePrompt / buildStoryImagePrompt — manualPromptOverride
// ─────────────────────────────────────────────
describe('AiReplicateService — manualPromptOverride (integration)', () => {
  let module: TestingModule;
  let service: AiReplicateService;
  let mockOpenAIClient: { responses: { create: jest.Mock } };
  let mockS3Service: jest.Mocked<Pick<S3Service, 'upload' | 'delete'>>;

  const noPhotos: never[] = [];

  const decorationPhoto = {
    url: 'https://example.com/deco.jpg',
    type: GalleryPhotoType.Decoration,
    description: 'brand logo',
  };

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

    mockOpenAIClient = {
      responses: {
        create: jest.fn(),
      },
    };
    (service as any).client = mockOpenAIClient;
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();

    // Default: design-system analysis returns no visible text
    mockOpenAIClient.responses.create.mockResolvedValue({
      output_text: JSON.stringify({
        posts: [
          {
            postDesignSystem: {
              typography: { textBlocks: [{ textContent: 'Not visible' }] },
            },
          },
        ],
        stories: [
          {
            storyDesignSystem: {
              typography: { textBlocks: [{ textContent: 'Not visible' }] },
            },
          },
        ],
      }),
    });
  });

  // ─────────────────────────────────────────────
  // buildPostImagePrompt — manualOverride: true
  // ─────────────────────────────────────────────
  describe('buildPostImagePrompt', () => {
    it('returns a prompt containing the userPrompt when manualOverride is true', async () => {
      const prompt = {
        userPrompt: 'bright background with product',
        scene: 'product scene',
      };

      const result = await service.buildPostImagePrompt(prompt, noPhotos, {
        manualOverride: true,
      });

      expect(result.prompt).toContain('bright background with product');
    });

    it('override prompt contains professional context', async () => {
      const prompt = { userPrompt: 'minimal white studio', scene: 'studio' };

      const result = await service.buildPostImagePrompt(prompt, noPhotos, {
        manualOverride: true,
      });

      // postImageProfessionalContext() contains this phrase
      expect(result.prompt).toContain('commercial photographer');
    });

    it('override prompt contains CRITICAL RENDERING RULE section', async () => {
      const prompt = { userPrompt: 'outdoor scene', scene: 'outdoor' };

      const result = await service.buildPostImagePrompt(prompt, noPhotos, {
        manualOverride: true,
      });

      expect(result.prompt).toContain('CRITICAL RENDERING RULE');
    });

    it('override prompt contains IMAGE QUALITY section', async () => {
      const prompt = { userPrompt: 'product close-up', scene: 'product' };

      const result = await service.buildPostImagePrompt(prompt, noPhotos, {
        manualOverride: true,
      });

      expect(result.prompt).toContain('IMAGE QUALITY');
    });

    it('override prompt does NOT contain TEMPLATE REPLICATION MODE', async () => {
      const prompt = { userPrompt: 'some scene', scene: 'scene description' };

      const result = await service.buildPostImagePrompt(prompt, noPhotos, {
        manualOverride: true,
      });

      expect(result.prompt).not.toContain('TEMPLATE REPLICATION MODE');
    });

    it('override prompt does NOT contain POST IDEA section', async () => {
      const prompt = { userPrompt: 'some scene', scene: 'scene description' };

      const result = await service.buildPostImagePrompt(prompt, noPhotos, {
        manualOverride: true,
      });

      expect(result.prompt).not.toContain('POST IDEA');
    });

    it('returns all photo urls as imageUrls in the result', async () => {
      const prompt = { userPrompt: 'test', scene: 'test scene' };
      const photos = [
        {
          url: 'https://example.com/a.jpg',
          type: GalleryPhotoType.Post,
          description: null,
        },
        {
          url: 'https://example.com/b.jpg',
          type: GalleryPhotoType.Image,
          description: null,
        },
      ];

      const result = await service.buildPostImagePrompt(prompt, photos, {
        manualOverride: true,
      });

      expect(result.imageUrls).toEqual([
        'https://example.com/a.jpg',
        'https://example.com/b.jpg',
      ]);
    });

    it('falls through to standard pipeline when manualOverride is true but userPrompt is empty', async () => {
      const prompt = { userPrompt: '', scene: 'scene description' };

      const result = await service.buildPostImagePrompt(prompt, noPhotos, {
        manualOverride: true,
      });

      expect(result.prompt).toContain('TEMPLATE REPLICATION MODE');
    });

    it('falls through to standard pipeline when manualOverride is false', async () => {
      const prompt = { userPrompt: 'some instruction', scene: 'scene' };

      const result = await service.buildPostImagePrompt(prompt, noPhotos, {
        manualOverride: false,
      });

      expect(result.prompt).toContain('TEMPLATE REPLICATION MODE');
      expect(result.prompt).not.toContain('SCENE AND COMPOSITION');
    });

    it('falls through to standard pipeline when options are omitted', async () => {
      const prompt = { userPrompt: 'some instruction', scene: 'scene' };

      const result = await service.buildPostImagePrompt(prompt, noPhotos);

      expect(result.prompt).toContain('TEMPLATE REPLICATION MODE');
    });

    it('includes REFERENCE DESIGN SYSTEM in override prompt when reference images are present', async () => {
      const prompt = { userPrompt: 'product shot', scene: 'product' };

      const result = await service.buildPostImagePrompt(
        prompt,
        [decorationPhoto],
        { manualOverride: true },
      );

      expect(result.prompt).toContain('REFERENCE DESIGN SYSTEM');
    });

    it('does NOT include REFERENCE DESIGN SYSTEM in override prompt when no reference images', async () => {
      const prompt = { userPrompt: 'product shot', scene: 'product' };

      const result = await service.buildPostImagePrompt(prompt, noPhotos, {
        manualOverride: true,
      });

      expect(result.prompt).not.toContain('REFERENCE DESIGN SYSTEM');
    });
  });

  // ─────────────────────────────────────────────
  // buildStoryImagePrompt — manualOverride: true
  // ─────────────────────────────────────────────
  describe('buildStoryImagePrompt', () => {
    it('returns a prompt containing the userPrompt when manualOverride is true', async () => {
      const prompt = {
        userPrompt: 'bold typography on dark background',
        scene: 'story scene',
      };

      const result = await service.buildStoryImagePrompt(prompt, noPhotos, {
        manualOverride: true,
      });

      expect(result.prompt).toContain('bold typography on dark background');
    });

    it('override prompt contains professional context', async () => {
      const prompt = {
        userPrompt: 'minimalist lifestyle story',
        scene: 'lifestyle',
      };

      const result = await service.buildStoryImagePrompt(prompt, noPhotos, {
        manualOverride: true,
      });

      expect(result.prompt).toContain('commercial photographer');
    });

    it('override prompt contains CRITICAL RENDERING RULE section', async () => {
      const prompt = { userPrompt: 'neon lights scene', scene: 'neon' };

      const result = await service.buildStoryImagePrompt(prompt, noPhotos, {
        manualOverride: true,
      });

      expect(result.prompt).toContain('CRITICAL RENDERING RULE');
    });

    it('falls through to standard pipeline when manualOverride is true but userPrompt is empty', async () => {
      const prompt = { userPrompt: '', scene: 'story scene' };

      const result = await service.buildStoryImagePrompt(prompt, noPhotos, {
        manualOverride: true,
      });

      expect(result.prompt).toContain('TEMPLATE REPLICATION MODE');
    });

    it('falls through to standard pipeline when manualOverride is false', async () => {
      const prompt = { userPrompt: 'bold story', scene: 'story' };

      const result = await service.buildStoryImagePrompt(prompt, noPhotos, {
        manualOverride: false,
      });

      expect(result.prompt).toContain('TEMPLATE REPLICATION MODE');
      expect(result.prompt).not.toContain('SCENE AND COMPOSITION');
    });

    it('returns all photo urls as imageUrls in the result', async () => {
      const prompt = { userPrompt: 'story test', scene: 'scene' };
      const photos = [
        {
          url: 'https://example.com/story1.jpg',
          type: GalleryPhotoType.Story,
          description: null,
        },
      ];

      const result = await service.buildStoryImagePrompt(prompt, photos, {
        manualOverride: true,
      });

      expect(result.imageUrls).toEqual(['https://example.com/story1.jpg']);
    });
  });
});
