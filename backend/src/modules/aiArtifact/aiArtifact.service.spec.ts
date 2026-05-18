import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MediaType } from '@prisma/client';

import { AiArtifactService } from './aiArtifact.service';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { PrismaService } from '../../core/prisma/prisma.service';
import { S3Service } from '../../core/s3/s3.service';
import { StorageUrlService } from '../../core/storage/storage-url.service';
import { AiService } from '../ai/ai.service';
import { AiReplicateService } from '../ai/ai-replicate.service';
import { HiggsfieldsService } from '../videoAI/higgsfields.service';

describe('AiArtifactService (integration)', () => {
  let module: TestingModule;
  let service: AiArtifactService;
  let prisma: PrismaService;

  let mockAiService: jest.Mocked<Pick<AiService, 'generateVideoPrompt'>>;
  let mockAiReplicateService: jest.Mocked<
    Pick<AiReplicateService, 'startAiPhotoJobAsync' | 'pollAndSaveImage'>
  >;
  let mockHiggsfieldsService: jest.Mocked<
    Pick<
      HiggsfieldsService,
      'createVideoJob' | 'getJobStatus' | 'downloadAndSaveVideo'
    >
  >;
  let mockS3Service: jest.Mocked<Pick<S3Service, 'upload' | 'delete'>>;
  let mockStorageUrlService: jest.Mocked<Pick<StorageUrlService, 'getPublicUrl'>>;

  // IDs created during test setup — cleaned up in afterAll
  let businessId: string;
  let artifactId: string;

  beforeAll(async () => {
    mockAiService = {
      generateVideoPrompt: jest
        .fn()
        .mockResolvedValue('Cinematic product showcase with soft lighting'),
    };

    mockAiReplicateService = {
      startAiPhotoJobAsync: jest.fn().mockResolvedValue('replicate-job-001'),
      pollAndSaveImage: jest.fn().mockResolvedValue(null),
    };

    mockHiggsfieldsService = {
      createVideoJob: jest.fn().mockResolvedValue('higgsfield-req-001'),
      getJobStatus: jest
        .fn()
        .mockResolvedValue({ status: 'in_progress', videoUrl: undefined }),
      downloadAndSaveVideo: jest
        .fn()
        .mockResolvedValue('ai-videos/biz/saved-video.mp4'),
    };

    mockS3Service = {
      upload: jest.fn().mockResolvedValue(undefined),
      delete: jest.fn().mockResolvedValue(undefined),
    };

    mockStorageUrlService = {
      getPublicUrl: jest.fn((key: string) => `https://cdn.example.com/${key}`),
    };

    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        PrismaModule,
      ],
      providers: [
        AiArtifactService,
        { provide: S3Service, useValue: mockS3Service },
        { provide: StorageUrlService, useValue: mockStorageUrlService },
        { provide: AiService, useValue: mockAiService },
        { provide: AiReplicateService, useValue: mockAiReplicateService },
        { provide: HiggsfieldsService, useValue: mockHiggsfieldsService },
      ],
    }).compile();

    service = module.get<AiArtifactService>(AiArtifactService);
    prisma = module.get<PrismaService>(PrismaService);

    // Seed a minimal Business + AIArtifact for use in tests
    const agency = await prisma.agency.create({
      data: { name: 'Test Agency for AiArtifact', plan: 'Free' },
    });

    const business = await prisma.business.create({
      data: {
        agencyId: agency.id,
        name: 'Test Business',
        website: 'https://test.example.com',
        status: 'Active',
      },
    });
    businessId = business.id;

    const artifact = await prisma.aIArtifact.create({
      data: {
        businessId,
        type: 'Post',
        outputJson: { title: 'Test artifact' },
        status: 'Draft',
      },
    });
    artifactId = artifact.id;
  });

  afterAll(async () => {
    // Clean up in dependency order
    await prisma.aIArtifactMedia.deleteMany({ where: { businessId } });
    await prisma.aIArtifact.deleteMany({ where: { businessId } });
    const business = await prisma.business.findUnique({ where: { id: businessId }, select: { agencyId: true } });
    await prisma.business.delete({ where: { id: businessId } });
    if (business?.agencyId) {
      await prisma.agency.delete({ where: { id: business.agencyId } });
    }
    await module.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    // Re-apply default mock implementations after clearAllMocks
    mockAiService.generateVideoPrompt.mockResolvedValue(
      'Cinematic product showcase with soft lighting',
    );
    mockAiReplicateService.startAiPhotoJobAsync.mockResolvedValue('replicate-job-001');
    mockAiReplicateService.pollAndSaveImage.mockResolvedValue(null);
    mockHiggsfieldsService.createVideoJob.mockResolvedValue('higgsfield-req-001');
    mockHiggsfieldsService.getJobStatus.mockResolvedValue({
      status: 'in_progress',
      videoUrl: undefined,
    });
    mockHiggsfieldsService.downloadAndSaveVideo.mockResolvedValue(
      'ai-videos/biz/saved-video.mp4',
    );
    mockStorageUrlService.getPublicUrl.mockImplementation(
      (key: string) => `https://cdn.example.com/${key}`,
    );
  });

  // Clean up media records between tests so each test starts fresh
  afterEach(async () => {
    await prisma.aIArtifactMedia.deleteMany({ where: { artifactId } });
  });

  // ─────────────────────────────────────────────
  // startGenerateImage
  // ─────────────────────────────────────────────
  describe('startGenerateImage', () => {
    it('creates an AIArtifactMedia record with type Image and jobId', async () => {
      mockAiReplicateService.startAiPhotoJobAsync.mockResolvedValue(
        'replicate-job-img-001',
      );

      await service.startGenerateImage(artifactId, businessId, 'bright product photo');

      const media = await prisma.aIArtifactMedia.findFirst({
        where: { artifactId, type: MediaType.Image },
      });

      expect(media).not.toBeNull();
      expect(media!.type).toBe(MediaType.Image);
      expect(media!.jobId).toBe('replicate-job-img-001');
      expect(media!.url).toBeNull();
    });

    it('calls AiReplicateService.startAiPhotoJobAsync with the provided prompt', async () => {
      await service.startGenerateImage(artifactId, businessId, 'sunset on the beach');

      expect(mockAiReplicateService.startAiPhotoJobAsync).toHaveBeenCalledWith(
        'sunset on the beach',
        businessId,
      );
    });

    it('returns the artifact with media array', async () => {
      const result = await service.startGenerateImage(
        artifactId,
        businessId,
        'test prompt',
      );

      expect(result).toBeDefined();
      expect(result!.id).toBe(artifactId);
      expect(Array.isArray(result!.media)).toBe(true);
      expect(result!.media!.length).toBeGreaterThan(0);
    });

    it('throws NotFoundException when artifact does not exist', async () => {
      await expect(
        service.startGenerateImage(
          '00000000-0000-0000-0000-000000000000',
          businessId,
          'prompt',
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('does not return artifact from another business (tenant isolation)', async () => {
      await expect(
        service.startGenerateImage(artifactId, 'other-business-uuid', 'prompt'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─────────────────────────────────────────────
  // startGenerateVideo
  // ─────────────────────────────────────────────
  describe('startGenerateVideo', () => {
    it('calls generateVideoPrompt then createVideoJob and creates a Video media record', async () => {
      mockHiggsfieldsService.createVideoJob.mockResolvedValue('hf-req-video-001');

      await service.startGenerateVideo({
        artifactId,
        businessId,
        description: 'product launch',
      });

      expect(mockAiService.generateVideoPrompt).toHaveBeenCalledWith(
        'product launch',
        expect.objectContaining({ name: 'Test Business' }),
      );
      expect(mockHiggsfieldsService.createVideoJob).toHaveBeenCalledWith({
        prompt: 'Cinematic product showcase with soft lighting',
        sourceUrl: undefined,
      });

      const media = await prisma.aIArtifactMedia.findFirst({
        where: { artifactId, type: MediaType.Video },
      });
      expect(media).not.toBeNull();
      expect(media!.jobId).toBe('hf-req-video-001');
      expect(media!.url).toBeNull();
    });

    it('passes sourceUrl to createVideoJob when provided', async () => {
      await service.startGenerateVideo({
        artifactId,
        businessId,
        description: 'showcase',
        sourceUrl: 'https://example.com/source.jpg',
      });

      expect(mockHiggsfieldsService.createVideoJob).toHaveBeenCalledWith(
        expect.objectContaining({ sourceUrl: 'https://example.com/source.jpg' }),
      );

      const media = await prisma.aIArtifactMedia.findFirst({
        where: { artifactId, type: MediaType.Video },
      });
      expect(media!.sourceUrl).toBe('https://example.com/source.jpg');
    });

    it('returns the artifact with media array', async () => {
      const result = await service.startGenerateVideo({
        artifactId,
        businessId,
        description: 'test video desc',
      });

      expect(result).toBeDefined();
      expect(result!.id).toBe(artifactId);
      expect(Array.isArray(result!.media)).toBe(true);
    });

    it('throws NotFoundException when artifact does not exist', async () => {
      await expect(
        service.startGenerateVideo({
          artifactId: '00000000-0000-0000-0000-000000000000',
          businessId,
          description: 'test',
        }),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException for artifact from another business', async () => {
      await expect(
        service.startGenerateVideo({
          artifactId,
          businessId: '00000000-0000-0000-0000-000000000001',
          description: 'test',
        }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─────────────────────────────────────────────
  // getAiArtifact — polling scenarios
  // ─────────────────────────────────────────────
  describe('getAiArtifact', () => {
    it('throws NotFoundException when artifact does not exist', async () => {
      await expect(
        service.getAiArtifact('00000000-0000-0000-0000-000000000000', businessId),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException for artifact that belongs to a different business', async () => {
      await expect(
        service.getAiArtifact(artifactId, '00000000-0000-0000-0000-000000000002'),
      ).rejects.toThrow(NotFoundException);
    });

    it('polling — image still pending: returns media with null jobId not cleared (pollAndSaveImage returns null)', async () => {
      // Create a pending image media record
      await prisma.aIArtifactMedia.create({
        data: {
          artifactId,
          businessId,
          type: MediaType.Image,
          jobId: 'replicate-pending-job',
        },
      });

      mockAiReplicateService.pollAndSaveImage.mockResolvedValue(null);

      const result = await service.getAiArtifact(artifactId, businessId);

      const pendingMedia = result.media.find(
        (m) => m.type === MediaType.Image,
      );
      expect(pendingMedia).toBeDefined();
      // jobId is not cleared because image is still in progress (null returned)
      // The service only clears jobId when s3Key is returned
      expect(mockAiReplicateService.pollAndSaveImage).toHaveBeenCalledWith(
        'replicate-pending-job',
        businessId,
      );
    });

    it('polling — image completed: updates url and clears jobId', async () => {
      await prisma.aIArtifactMedia.create({
        data: {
          artifactId,
          businessId,
          type: MediaType.Image,
          jobId: 'replicate-done-job',
        },
      });

      mockAiReplicateService.pollAndSaveImage.mockResolvedValue(
        'ai-images/biz/result.png',
      );

      const result = await service.getAiArtifact(artifactId, businessId);

      const completedMedia = result.media.find((m) => m.type === MediaType.Image);
      expect(completedMedia).toBeDefined();
      // url is resolved through storageUrlService
      expect(completedMedia!.url).toBe(
        'https://cdn.example.com/ai-images/biz/result.png',
      );
      expect(completedMedia!.jobId).toBeNull();

      // Verify DB was updated
      const dbRecord = await prisma.aIArtifactMedia.findFirst({
        where: { artifactId, type: MediaType.Image },
      });
      expect(dbRecord!.url).toBe('ai-images/biz/result.png');
      expect(dbRecord!.jobId).toBeNull();
    });

    it('polling — video completed: downloads and saves to S3, clears jobId', async () => {
      await prisma.aIArtifactMedia.create({
        data: {
          artifactId,
          businessId,
          type: MediaType.Video,
          jobId: 'hf-req-completed',
        },
      });

      mockHiggsfieldsService.getJobStatus.mockResolvedValue({
        status: 'completed',
        videoUrl: 'https://cdn.higgsfield.ai/done.mp4',
      });
      mockHiggsfieldsService.downloadAndSaveVideo.mockResolvedValue(
        'ai-videos/biz/done.mp4',
      );

      const result = await service.getAiArtifact(artifactId, businessId);

      const videoMedia = result.media.find((m) => m.type === MediaType.Video);
      expect(videoMedia).toBeDefined();
      expect(videoMedia!.url).toBe('https://cdn.example.com/ai-videos/biz/done.mp4');
      expect(videoMedia!.jobId).toBeNull();

      expect(mockHiggsfieldsService.downloadAndSaveVideo).toHaveBeenCalledWith(
        'https://cdn.higgsfield.ai/done.mp4',
        businessId,
      );

      const dbRecord = await prisma.aIArtifactMedia.findFirst({
        where: { artifactId, type: MediaType.Video },
      });
      expect(dbRecord!.url).toBe('ai-videos/biz/done.mp4');
      expect(dbRecord!.jobId).toBeNull();
    });

    it('polling — video failed: clears jobId without throwing', async () => {
      await prisma.aIArtifactMedia.create({
        data: {
          artifactId,
          businessId,
          type: MediaType.Video,
          jobId: 'hf-req-failed',
        },
      });

      mockHiggsfieldsService.getJobStatus.mockResolvedValue({
        status: 'failed',
        videoUrl: undefined,
      });

      const result = await service.getAiArtifact(artifactId, businessId);

      const videoMedia = result.media.find((m) => m.type === MediaType.Video);
      expect(videoMedia).toBeDefined();
      expect(videoMedia!.jobId).toBeNull();
      expect(videoMedia!.url).toBeNull();

      expect(mockHiggsfieldsService.downloadAndSaveVideo).not.toHaveBeenCalled();
    });

    it('polling — video nsfw: clears jobId without throwing', async () => {
      await prisma.aIArtifactMedia.create({
        data: {
          artifactId,
          businessId,
          type: MediaType.Video,
          jobId: 'hf-req-nsfw',
        },
      });

      mockHiggsfieldsService.getJobStatus.mockResolvedValue({
        status: 'nsfw',
        videoUrl: undefined,
      });

      const result = await service.getAiArtifact(artifactId, businessId);

      const videoMedia = result.media.find((m) => m.type === MediaType.Video);
      expect(videoMedia!.jobId).toBeNull();
      expect(mockHiggsfieldsService.downloadAndSaveVideo).not.toHaveBeenCalled();
    });

    it('polling — when getJobStatus throws: clears jobId and does not propagate error', async () => {
      await prisma.aIArtifactMedia.create({
        data: {
          artifactId,
          businessId,
          type: MediaType.Video,
          jobId: 'hf-req-error',
        },
      });

      mockHiggsfieldsService.getJobStatus.mockRejectedValue(
        new Error('Higgsfield status error 503: Service Unavailable'),
      );

      // Should not throw — errors are caught per media item
      const result = await service.getAiArtifact(artifactId, businessId);

      const videoMedia = result.media.find((m) => m.type === MediaType.Video);
      expect(videoMedia!.jobId).toBeNull();
    });

    it('returns artifact with imageUrl resolved through storageUrlService', async () => {
      // Patch the artifact to have an imageUrl
      await prisma.aIArtifact.update({
        where: { id: artifactId },
        data: { imageUrl: 'ai-images/biz/cover.png' },
      });

      const result = await service.getAiArtifact(artifactId, businessId);

      expect(result.imageUrl).toBe(
        'https://cdn.example.com/ai-images/biz/cover.png',
      );

      // Clean up
      await prisma.aIArtifact.update({
        where: { id: artifactId },
        data: { imageUrl: null },
      });
    });
  });
});
