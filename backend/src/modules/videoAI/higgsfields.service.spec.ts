import { Test, TestingModule } from '@nestjs/testing';
import { HiggsfieldsService } from './higgsfields.service';
import { S3Service } from '../../core/s3/s3.service';

const mockFetch = jest.fn();
global.fetch = mockFetch;

describe('HiggsfieldsService (unit)', () => {
  let module: TestingModule;
  let service: HiggsfieldsService;
  let mockS3Service: jest.Mocked<Pick<S3Service, 'upload' | 'delete'>>;

  beforeAll(async () => {
    mockS3Service = {
      upload: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    module = await Test.createTestingModule({
      providers: [
        HiggsfieldsService,
        { provide: S3Service, useValue: mockS3Service },
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

  describe('createVideoJob', () => {
    it('returns request_id on success without sourceUrl', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ request_id: 'abc-123' }),
      });

      const result = await service.createVideoJob({ prompt: 'A scenic mountain view' });

      expect(result).toBe('abc-123');
      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(options.method).toBe('POST');
      const body = JSON.parse(options.body);
      expect(body.prompt).toBe('A scenic mountain view');
      expect(body.source_url).toBeUndefined();
    });

    it('returns request_id on success with sourceUrl', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ request_id: 'xyz-456' }),
      });

      const result = await service.createVideoJob({
        prompt: 'Product showcase',
        sourceUrl: 'https://example.com/image.jpg',
      });

      expect(result).toBe('xyz-456');
      const body = JSON.parse(mockFetch.mock.calls[0][1].body);
      expect(body.source_url).toBe('https://example.com/image.jpg');
    });

    it('throws an error when API responds with non-ok status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 422,
        text: jest.fn().mockResolvedValue('Unprocessable Entity'),
      });

      await expect(
        service.createVideoJob({ prompt: 'bad request' }),
      ).rejects.toThrow('Higgsfield API error 422: Unprocessable Entity');
    });

    it('throws an error when API responds with 500', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        text: jest.fn().mockResolvedValue('Internal Server Error'),
      });

      await expect(
        service.createVideoJob({ prompt: 'test' }),
      ).rejects.toThrow('Higgsfield API error 500');
    });
  });

  describe('getJobStatus', () => {
    it('returns queued status without videoUrl when job is queued', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ status: 'queued' }),
      });

      const result = await service.getJobStatus('req-001');

      expect(result.status).toBe('queued');
      expect(result.videoUrl).toBeUndefined();
    });

    it('returns in_progress status without videoUrl', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ status: 'in_progress' }),
      });

      const result = await service.getJobStatus('req-002');

      expect(result.status).toBe('in_progress');
      expect(result.videoUrl).toBeUndefined();
    });

    it('returns completed status with videoUrl', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          status: 'completed',
          video: { url: 'https://cdn.higgsfield.ai/video.mp4' },
        }),
      });

      const result = await service.getJobStatus('req-003');

      expect(result.status).toBe('completed');
      expect(result.videoUrl).toBe('https://cdn.higgsfield.ai/video.mp4');
    });

    it('returns nsfw status without videoUrl', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ status: 'nsfw' }),
      });

      const result = await service.getJobStatus('req-004');

      expect(result.status).toBe('nsfw');
      expect(result.videoUrl).toBeUndefined();
    });

    it('returns failed status without videoUrl', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ status: 'failed' }),
      });

      const result = await service.getJobStatus('req-005');

      expect(result.status).toBe('failed');
      expect(result.videoUrl).toBeUndefined();
    });

    it('throws an error when status API responds with non-ok status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        text: jest.fn().mockResolvedValue('Not Found'),
      });

      await expect(service.getJobStatus('nonexistent-id')).rejects.toThrow(
        'Higgsfield status error 404: Not Found',
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
