import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { InternalServerErrorException } from '@nestjs/common';
import { S3Service } from '../../core/s3/s3.service';

const mockExecFileAsync = jest.fn();
jest.mock('child_process', () => ({ execFile: jest.fn() }));
jest.mock('util', () => ({
  ...jest.requireActual('util'),
  promisify: () => mockExecFileAsync,
}));

import { HiggsfieldsService } from './higgsfields.service';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('HiggsfieldsService (unit)', () => {
  let module: TestingModule;
  let service: HiggsfieldsService;
  let mockS3Service: jest.Mocked<Pick<S3Service, 'upload' | 'delete'>>;
  let mockConfigService: { get: jest.Mock };

  beforeAll(async () => {
    mockS3Service = {
      upload: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    mockConfigService = {
      get: jest.fn().mockReturnValue(undefined),
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
    it('returns result_url on successful generation', async () => {
      const cliOutput = JSON.stringify([
        { id: 'job-001', status: 'completed', result_url: 'https://cdn.example.com/video.mp4' },
      ]);
      mockExecFileAsync.mockResolvedValueOnce({ stdout: cliOutput });

      const result = await service.generateVideo({ prompt: 'sunset ocean' });

      expect(result).toBe('https://cdn.example.com/video.mp4');
      expect(mockExecFileAsync).toHaveBeenCalledWith(
        'higgsfield',
        expect.arrayContaining(['generate', 'create', '--prompt', 'sunset ocean', '--wait', '--json']),
        expect.objectContaining({ timeout: 600000 }),
      );
    });

    it('uses custom model from config', async () => {
      mockConfigService.get.mockReturnValueOnce('kling3_0');
      const cliOutput = JSON.stringify([
        { id: 'job-002', status: 'completed', result_url: 'https://cdn.example.com/v2.mp4' },
      ]);
      mockExecFileAsync.mockResolvedValueOnce({ stdout: cliOutput });

      await service.generateVideo({ prompt: 'test' });

      expect(mockExecFileAsync).toHaveBeenCalledWith(
        'higgsfield',
        expect.arrayContaining(['kling3_0']),
        expect.any(Object),
      );
    });

    it('passes start-image when sourceUrl is provided', async () => {
      const cliOutput = JSON.stringify([
        { id: 'job-003', status: 'completed', result_url: 'https://cdn.example.com/v3.mp4' },
      ]);
      mockExecFileAsync.mockResolvedValueOnce({ stdout: cliOutput });

      await service.generateVideo({
        prompt: 'test',
        sourceUrl: 'https://example.com/image.jpg',
      });

      expect(mockExecFileAsync).toHaveBeenCalledWith(
        'higgsfield',
        expect.arrayContaining(['--start-image', 'https://example.com/image.jpg']),
        expect.any(Object),
      );
    });

    it('throws InternalServerErrorException when CLI returns failed status', async () => {
      const cliOutput = JSON.stringify([
        { id: 'job-004', status: 'failed', result_url: null },
      ]);
      mockExecFileAsync.mockResolvedValueOnce({ stdout: cliOutput });

      await expect(
        service.generateVideo({ prompt: 'bad prompt' }),
      ).rejects.toThrow(InternalServerErrorException);
    });

    it('throws InternalServerErrorException when CLI errors', async () => {
      mockExecFileAsync.mockRejectedValueOnce(new Error('CLI not found'));

      await expect(
        service.generateVideo({ prompt: 'test' }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('generateAndSaveVideo', () => {
    it('generates video and saves to S3', async () => {
      const cliOutput = JSON.stringify([
        { id: 'job-005', status: 'completed', result_url: 'https://cdn.example.com/video.mp4' },
      ]);
      mockExecFileAsync.mockResolvedValueOnce({ stdout: cliOutput });

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

    it('throws when video download fails', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
      });

      await expect(
        service.downloadAndSaveVideo('https://cdn.higgsfield.ai/video.mp4', 'biz-1'),
      ).rejects.toThrow('Failed to download video: 403');
    });
  });
});
