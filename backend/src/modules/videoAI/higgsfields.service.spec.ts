import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { S3Service } from '../../core/s3/s3.service';

const mockSubscribe = jest.fn();
jest.mock('@higgsfield/client/v2', () => ({
  createHiggsfieldClient: () => ({ subscribe: mockSubscribe }),
}));

import { HiggsfieldsService } from './higgsfields.service';

const mockFetch = jest.fn();
global.fetch = mockFetch;

function makeResponse(overrides: {
  request_id?: string;
  status?: string;
  videoUrl?: string | null;
} = {}) {
  const {
    request_id = 'req-001',
    status = 'completed',
    videoUrl = 'https://cdn.example.com/video.mp4',
  } = overrides;

  return {
    request_id,
    status,
    status_url: `https://platform.higgsfield.ai/status/${request_id}`,
    cancel_url: `https://platform.higgsfield.ai/cancel/${request_id}`,
    video: videoUrl ? { url: videoUrl } : undefined,
  };
}

describe('HiggsfieldsService (unit)', () => {
  let module: TestingModule;
  let service: HiggsfieldsService;
  let mockS3Service: jest.Mocked<Pick<S3Service, 'upload' | 'delete'>>;
  let mockConfigService: { get: jest.Mock; getOrThrow: jest.Mock };

  beforeAll(async () => {
    mockS3Service = {
      upload: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    mockConfigService = {
      get: jest.fn().mockReturnValue(undefined),
      getOrThrow: jest.fn().mockImplementation((key: string) => {
        const values = {
          HIGGSFIELD_API_KEY: 'test-key',
          HIGGSFIELD_API_KEY_SECRET: 'test-secret',
        };
        return values[key] ?? undefined;
      }),
    };

    module = await Test.createTestingModule({
      providers: [
        HiggsfieldsService,
        { provide: S3Service, useValue: mockS3Service },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<HiggsfieldsService>(HiggsfieldsService);
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateVideo', () => {
    it('returns result URL on successful generation', async () => {
      mockSubscribe.mockResolvedValueOnce(makeResponse());

      const result = await service.generateVideo({ prompt: 'sunset ocean' });

      expect(result).toBe('https://cdn.example.com/video.mp4');
      expect(mockSubscribe).toHaveBeenCalledWith(
        '/v1/image2video/dop',
        expect.objectContaining({
          input: expect.objectContaining({
            params: expect.objectContaining({
              model: 'dop-turbo',
              prompt: 'sunset ocean',
            }),
          }),
          withPolling: true,
        }),
      );
    });

    it('uses custom model from config', async () => {
      mockConfigService.get.mockReturnValueOnce('kling3_0');
      mockSubscribe.mockResolvedValueOnce(
        makeResponse({ videoUrl: 'https://cdn.example.com/v2.mp4' }),
      );

      await service.generateVideo({ prompt: 'test' });

      expect(mockSubscribe).toHaveBeenCalledWith(
        '/v1/image2video/dop',
        expect.objectContaining({
          input: expect.objectContaining({
            params: expect.objectContaining({ model: 'kling3_0' }),
          }),
        }),
      );
    });

    it('passes input_images when sourceUrl is provided', async () => {
      mockSubscribe.mockResolvedValueOnce(makeResponse());

      await service.generateVideo({
        prompt: 'test',
        sourceUrl: 'https://example.com/image.jpg',
      });

      expect(mockSubscribe).toHaveBeenCalledWith(
        '/v1/image2video/dop',
        expect.objectContaining({
          input: expect.objectContaining({
            params: expect.objectContaining({
              input_images: [
                { type: 'image_url', image_url: 'https://example.com/image.jpg' },
              ],
            }),
          }),
        }),
      );
    });

    it('throws InternalServerErrorException when generation fails', async () => {
      mockSubscribe.mockResolvedValueOnce(
        makeResponse({ status: 'failed', videoUrl: null }),
      );

      await expect(
        service.generateVideo({ prompt: 'bad prompt' }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('throws InternalServerErrorException when content is NSFW', async () => {
      mockSubscribe.mockResolvedValueOnce(
        makeResponse({ status: 'nsfw', videoUrl: null }),
      );

      await expect(
        service.generateVideo({ prompt: 'nsfw content' }),
      ).rejects.toThrow('content rejected by moderation');
    });

    it('throws InternalServerErrorException when SDK errors', async () => {
      mockSubscribe.mockRejectedValueOnce(new Error('Network error'));

      await expect(
        service.generateVideo({ prompt: 'test' }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('throws InternalServerErrorException when status is completed but video URL is missing', async () => {
      mockSubscribe.mockResolvedValueOnce(
        makeResponse({ status: 'completed', videoUrl: null }),
      );

      await expect(
        service.generateVideo({ prompt: 'test' }),
      ).rejects.toThrow('no result URL');
    });
  });

  describe('generateAndSaveVideo', () => {
    it('generates video and saves to S3', async () => {
      mockSubscribe.mockResolvedValueOnce(makeResponse());

      const fakeBuffer = Buffer.from('fake-video-data');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: jest.fn().mockResolvedValue(fakeBuffer.buffer),
      });

      const s3Key = await service.generateAndSaveVideo({
        prompt: 'product showcase',
        businessId: 'biz-001',
      });

      expect(s3Key).toMatch(/^ai-videos\/biz-001\/.+\.mp4$/);
      expect(mockS3Service.upload).toHaveBeenCalledWith(
        s3Key,
        expect.any(Buffer),
        'video/mp4',
      );
    });
  });

  describe('downloadAndSaveVideo', () => {
    it('downloads video and uploads to S3, returns S3 key', async () => {
      const fakeBuffer = Buffer.from('fake-video-data');
      mockFetch.mockResolvedValueOnce({
        ok: true,
        arrayBuffer: jest.fn().mockResolvedValue(fakeBuffer.buffer),
      });

      const s3Key = await service.downloadAndSaveVideo(
        'https://cdn.higgsfield.ai/video.mp4',
        'business-uuid-1',
      );

      expect(s3Key).toMatch(/^ai-videos\/business-uuid-1\/.+\.mp4$/);
      expect(mockS3Service.upload).toHaveBeenCalledWith(
        s3Key,
        expect.any(Buffer),
        'video/mp4',
      );
    });

    it('throws InternalServerErrorException when video download fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
      });

      await expect(
        service.downloadAndSaveVideo('https://cdn.higgsfield.ai/video.mp4', 'biz-1'),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
