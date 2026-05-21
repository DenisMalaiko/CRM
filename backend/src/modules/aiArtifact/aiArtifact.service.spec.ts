import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AIArtifactType, MediaType } from '@prisma/client';

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

  let mockAiService: jest.Mocked<Pick<AiService, 'generateVideoPrompt' | 'generateAiPhoto'>>;
  let mockAiReplicateService: jest.Mocked<
    Pick<AiReplicateService, 'startAiPhotoJobAsync' | 'pollAndSaveImage' | 'buildPostImagePrompt' | 'buildStoryImagePrompt' | 'generatePostImage' | 'generateStoryImage'>
  >;
  let mockHiggsfieldsService: jest.Mocked<
    Pick<
      HiggsfieldsService,
      'generateAndSaveVideo' | 'downloadAndSaveVideo'
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
      generateAiPhoto: jest
        .fn()
        .mockResolvedValue('ai-images/biz/regenerated.png'),
    };

    mockAiReplicateService = {
      startAiPhotoJobAsync: jest.fn().mockResolvedValue('replicate-job-001'),
      pollAndSaveImage: jest.fn().mockResolvedValue(null),
      buildPostImagePrompt: jest.fn().mockResolvedValue({ prompt: 'built-post-prompt', imageUrls: [] }),
      buildStoryImagePrompt: jest.fn().mockResolvedValue({ prompt: 'built-story-prompt', imageUrls: [] }),
      generatePostImage: jest.fn().mockResolvedValue('ai-images/biz/generated-post.png'),
      generateStoryImage: jest.fn().mockResolvedValue('ai-images/biz/generated-story.png'),
    };

    mockHiggsfieldsService = {
      generateAndSaveVideo: jest
        .fn()
        .mockResolvedValue('ai-videos/biz/saved-video.mp4'),
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
    mockAiService.generateAiPhoto.mockResolvedValue('ai-images/biz/regenerated.png');
    mockAiReplicateService.startAiPhotoJobAsync.mockResolvedValue('replicate-job-001');
    mockAiReplicateService.pollAndSaveImage.mockResolvedValue(null);
    mockAiReplicateService.buildPostImagePrompt.mockResolvedValue({ prompt: 'built-post-prompt', imageUrls: [] });
    mockAiReplicateService.buildStoryImagePrompt.mockResolvedValue({ prompt: 'built-story-prompt', imageUrls: [] });
    mockAiReplicateService.generatePostImage.mockResolvedValue('ai-images/biz/generated-post.png');
    mockAiReplicateService.generateStoryImage.mockResolvedValue('ai-images/biz/generated-story.png');
    mockHiggsfieldsService.generateAndSaveVideo.mockResolvedValue(
      'ai-videos/biz/saved-video.mp4',
    );
    mockStorageUrlService.getPublicUrl.mockImplementation(
      (key: string) => `https://cdn.example.com/${key}`,
    );
  });

  // Clean up media and history records between tests so each test starts fresh
  afterEach(async () => {
    await prisma.aIArtifactImageHistory.deleteMany({ where: { artifactId } });
    await prisma.aIArtifactMedia.deleteMany({ where: { artifactId } });
  });

  // ─────────────────────────────────────────────
  // deleteAiArtifactsBatch
  // ─────────────────────────────────────────────
  describe('deleteAiArtifactsBatch', () => {
    // Each test creates its own artifacts and cleans up after itself
    // to stay isolated from the shared seed artifact used elsewhere.

    it('deletes all specified artifacts and returns { success: true }', async () => {
      const a1 = await prisma.aIArtifact.create({
        data: { businessId, type: 'Post', outputJson: {}, status: 'Draft' },
      });
      const a2 = await prisma.aIArtifact.create({
        data: { businessId, type: 'Post', outputJson: {}, status: 'Draft' },
      });

      const result = await service.deleteAiArtifactsBatch([a1.id, a2.id]);

      expect(result).toEqual({ success: true });

      const remaining = await prisma.aIArtifact.findMany({
        where: { id: { in: [a1.id, a2.id] } },
      });
      expect(remaining).toHaveLength(0);
    });

    it('calls s3Service.delete for each imageUrl collected from artifacts, history, and media', async () => {
      const artifact = await prisma.aIArtifact.create({
        data: {
          businessId,
          type: 'Post',
          outputJson: {},
          status: 'Draft',
          imageUrl: 's3-keys/artifact-cover.png',
        },
      });

      await prisma.aIArtifactImageHistory.create({
        data: {
          artifactId: artifact.id,
          businessId,
          imageUrl: 's3-keys/history-image.png',
          changeType: 'Create',
        },
      });

      await prisma.aIArtifactMedia.create({
        data: {
          artifactId: artifact.id,
          businessId,
          type: 'Image',
          url: 's3-keys/media-image.png',
        },
      });

      mockS3Service.delete.mockResolvedValue(undefined);

      await service.deleteAiArtifactsBatch([artifact.id]);

      const deletedKeys = mockS3Service.delete.mock.calls.map(([key]) => key);
      expect(deletedKeys).toContain('s3-keys/artifact-cover.png');
      expect(deletedKeys).toContain('s3-keys/history-image.png');
      expect(deletedKeys).toContain('s3-keys/media-image.png');
    });

    it('deduplicates S3 keys so each URL is deleted only once', async () => {
      const sharedKey = 's3-keys/shared-image.png';

      const artifact = await prisma.aIArtifact.create({
        data: {
          businessId,
          type: 'Post',
          outputJson: {},
          status: 'Draft',
          imageUrl: sharedKey,
        },
      });

      // History entry has the same URL as the artifact imageUrl
      await prisma.aIArtifactImageHistory.create({
        data: {
          artifactId: artifact.id,
          businessId,
          imageUrl: sharedKey,
          changeType: 'Create',
        },
      });

      mockS3Service.delete.mockResolvedValue(undefined);

      await service.deleteAiArtifactsBatch([artifact.id]);

      const deleteCalls = mockS3Service.delete.mock.calls.filter(
        ([key]) => key === sharedKey,
      );
      expect(deleteCalls).toHaveLength(1);
    });

    it('throws NotFoundException when passed an empty array', async () => {
      await expect(service.deleteAiArtifactsBatch([])).rejects.toThrow(
        NotFoundException,
      );
      expect(mockS3Service.delete).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when IDs do not exist in the database', async () => {
      const nonExistentId = '00000000-0000-0000-0000-000000000099';

      await expect(service.deleteAiArtifactsBatch([nonExistentId])).rejects.toThrow(
        NotFoundException,
      );
      expect(mockS3Service.delete).not.toHaveBeenCalled();
    });

    it('does not delete artifacts outside the provided IDs (tenant isolation)', async () => {
      const target = await prisma.aIArtifact.create({
        data: { businessId, type: 'Post', outputJson: {}, status: 'Draft' },
      });
      const unrelated = await prisma.aIArtifact.create({
        data: { businessId, type: 'Post', outputJson: {}, status: 'Draft' },
      });

      await service.deleteAiArtifactsBatch([target.id]);

      const survivors = await prisma.aIArtifact.findMany({
        where: { id: unrelated.id },
      });
      expect(survivors).toHaveLength(1);

      // Clean up the unrelated artifact
      await prisma.aIArtifact.delete({ where: { id: unrelated.id } });
    });

    it('still returns { success: true } when S3 delete fails for some URLs', async () => {
      const artifact = await prisma.aIArtifact.create({
        data: {
          businessId,
          type: 'Post',
          outputJson: {},
          status: 'Draft',
          imageUrl: 's3-keys/failing-delete.png',
        },
      });

      mockS3Service.delete.mockRejectedValue(new Error('S3 NoSuchKey'));

      const result = await service.deleteAiArtifactsBatch([artifact.id]);

      expect(result).toEqual({ success: true });
    });

    it('cascades — removes related history and media records along with the artifact', async () => {
      const artifact = await prisma.aIArtifact.create({
        data: { businessId, type: 'Post', outputJson: {}, status: 'Draft' },
      });

      await prisma.aIArtifactImageHistory.create({
        data: {
          artifactId: artifact.id,
          businessId,
          imageUrl: 's3-keys/cascade-history.png',
          changeType: 'Create',
        },
      });

      await prisma.aIArtifactMedia.create({
        data: { artifactId: artifact.id, businessId, type: 'Image' },
      });

      await service.deleteAiArtifactsBatch([artifact.id]);

      const historyCount = await prisma.aIArtifactImageHistory.count({
        where: { artifactId: artifact.id },
      });
      const mediaCount = await prisma.aIArtifactMedia.count({
        where: { artifactId: artifact.id },
      });

      expect(historyCount).toBe(0);
      expect(mediaCount).toBe(0);
    });
  });

  // ─────────────────────────────────────────────
  // startGenerateImage
  // ─────────────────────────────────────────────
  describe('startGenerateImage', () => {
    it('creates an AIArtifactMedia record with type Image and url', async () => {
      mockAiReplicateService.generatePostImage.mockResolvedValue('ai-images/biz/test-image.png');

      await service.startGenerateImage(artifactId, businessId, { scene: 'bright product photo' }, []);

      const media = await prisma.aIArtifactMedia.findFirst({
        where: { artifactId, type: MediaType.Image },
      });

      expect(media).not.toBeNull();
      expect(media!.type).toBe(MediaType.Image);
      expect(media!.url).toBe('ai-images/biz/test-image.png');
      expect(media!.jobId).toBeNull();
    });

    it('calls generatePostImage for Post artifacts', async () => {
      const imagePrompt = { scene: 'sunset on the beach' };
      const photos = [{ url: 'https://example.com/photo.jpg', type: 'Image' as const, description: null }];
      await service.startGenerateImage(artifactId, businessId, imagePrompt, photos);

      expect(mockAiReplicateService.generatePostImage).toHaveBeenCalledWith(imagePrompt, businessId, photos);
    });

    it('returns the artifact with media array', async () => {
      const result = await service.startGenerateImage(
        artifactId,
        businessId,
        { scene: 'test prompt' },
        [],
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
          { scene: 'prompt' },
          [],
        ),
      ).rejects.toThrow(NotFoundException);
    });

    it('does not return artifact from another business (tenant isolation)', async () => {
      await expect(
        service.startGenerateImage(artifactId, 'other-business-uuid', { scene: 'prompt' }, []),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─────────────────────────────────────────────
  // startGenerateVideo
  // ─────────────────────────────────────────────
  describe('startGenerateVideo', () => {
    it('calls generateVideoPrompt then generateAndSaveVideo and saves video URL', async () => {
      mockHiggsfieldsService.generateAndSaveVideo.mockResolvedValue('ai-videos/biz/saved.mp4');

      await service.startGenerateVideo({
        artifactId,
        businessId,
        description: 'product launch',
      });

      expect(mockAiService.generateVideoPrompt).toHaveBeenCalledWith(
        'product launch',
        expect.objectContaining({ name: 'Test Business' }),
      );
      expect(mockHiggsfieldsService.generateAndSaveVideo).toHaveBeenCalledWith({
        prompt: 'Cinematic product showcase with soft lighting',
        businessId,
        sourceUrl: undefined,
      });

      const media = await prisma.aIArtifactMedia.findFirst({
        where: { artifactId, type: MediaType.Video },
      });
      expect(media).not.toBeNull();
      expect(media!.url).toBe('ai-videos/biz/saved.mp4');
    });

    it('passes sourceUrl to generateAndSaveVideo when provided', async () => {
      await service.startGenerateVideo({
        artifactId,
        businessId,
        description: 'showcase',
        sourceUrl: 'https://example.com/source.jpg',
      });

      expect(mockHiggsfieldsService.generateAndSaveVideo).toHaveBeenCalledWith(
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

      const result = await service.getAiArtifact(artifactId, businessId);

      const videoMedia = result.media.find((m) => m.type === MediaType.Video);
      expect(videoMedia).toBeDefined();
      expect(videoMedia!.jobId).toBeNull();

      const dbRecord = await prisma.aIArtifactMedia.findFirst({
        where: { artifactId, type: MediaType.Video },
      });
      expect(dbRecord!.jobId).toBeNull();
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

  // ─────────────────────────────────────────────
  // createArtifact — media generation branching
  // ─────────────────────────────────────────────
  describe('createArtifact', () => {
    // Shared generated content returned by the mocked AI service
    const generatedPost = {
      title: 'AI Generated Post',
      body: 'Post content',
      imageUrl: null,
      image_prompt: {
        scene: 'A bright product showcase',
        title: 'Product Title',
        subtitle: 'Product Subtitle',
        caption: 'Buy now',
      },
    };

    const baseForm = {
      type: AIArtifactType.Post,
      productsIds: [] as string[],
      audiencesIds: [] as string[],
      ideasIds: [] as string[],
      ideasAiIds: [] as string[],
      photosIds: [] as string[],
      defaultPhotosIds: [] as string[],
      prompt: 'Test prompt',
    };

    let startGenerateImageSpy: jest.SpyInstance;
    let startGenerateVideoSpy: jest.SpyInstance;

    beforeEach(() => {
      // Mock the AI content generation — keeps tests independent of OpenAI
      (mockAiService as any).generatePostsBasedOnManuallySettings = jest
        .fn()
        .mockResolvedValue([generatedPost]);

      // Spy on the internal methods so we can assert they were called correctly
      // without re-testing their full DB behaviour (already covered above)
      startGenerateImageSpy = jest
        .spyOn(service, 'startGenerateImage')
        .mockResolvedValue({ id: 'stub-artifact', media: [] } as any);

      startGenerateVideoSpy = jest
        .spyOn(service, 'startGenerateVideo')
        .mockResolvedValue({ id: 'stub-artifact', media: [] } as any);
    });

    afterEach(async () => {
      startGenerateImageSpy.mockRestore();
      startGenerateVideoSpy.mockRestore();
      // Remove any artifacts created during these tests (excluding the seed artifact)
      await prisma.aIArtifactMedia.deleteMany({ where: { businessId } });
      await prisma.aIArtifactImageHistory.deleteMany({ where: { businessId } });
      await prisma.aIArtifact.deleteMany({
        where: { businessId, id: { not: artifactId } },
      });
    });

    it('calls startGenerateImage for each artifact when mediaType is Image', async () => {
      const result = await service.createArtifact(businessId, {
        form: baseForm,
        mediaType: MediaType.Image,
      });

      expect(startGenerateImageSpy).toHaveBeenCalledTimes(1);
      expect(startGenerateVideoSpy).not.toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('passes artifact.id, businessId, image_prompt object, and photos to startGenerateImage', async () => {
      await service.createArtifact(businessId, {
        form: baseForm,
        mediaType: MediaType.Image,
      });

      const [calledArtifactId, calledBusinessId, calledImagePrompt, calledPhotos] =
        startGenerateImageSpy.mock.calls[0];

      expect(calledBusinessId).toBe(businessId);
      expect(typeof calledArtifactId).toBe('string');
      expect(calledArtifactId).not.toBe('');
      // image_prompt is passed as the original object
      expect(calledImagePrompt).toEqual(generatedPost.image_prompt);
      // photos array is passed through
      expect(Array.isArray(calledPhotos)).toBe(true);
    });

    it('calls startGenerateVideo for each artifact when mediaType is Video', async () => {
      const result = await service.createArtifact(businessId, {
        form: baseForm,
        mediaType: MediaType.Video,
      });

      expect(startGenerateVideoSpy).toHaveBeenCalledTimes(1);
      expect(startGenerateImageSpy).not.toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });

    it('passes artifact.id, businessId, and serialized imagePrompt as description to startGenerateVideo', async () => {
      await service.createArtifact(businessId, {
        form: baseForm,
        mediaType: MediaType.Video,
      });

      const [calledParams] = startGenerateVideoSpy.mock.calls[0];

      expect(calledParams.businessId).toBe(businessId);
      expect(typeof calledParams.artifactId).toBe('string');
      expect(calledParams.artifactId).not.toBe('');
      // description must be the serialized imagePrompt
      expect(calledParams.description).toContain('SCENE: A bright product showcase');
      expect(calledParams.description).toContain('TITLE: Product Title');
    });

    it('skips media generation and returns artifact as-is when mediaType is neither Image nor Video', async () => {
      const result = await service.createArtifact(businessId, {
        form: baseForm,
        mediaType: null as unknown as MediaType,
      });

      expect(startGenerateImageSpy).not.toHaveBeenCalled();
      expect(startGenerateVideoSpy).not.toHaveBeenCalled();
      expect(result).toHaveLength(1);
      // The artifact returned is the raw DB record (no media array from generation)
      expect(result[0]).toHaveProperty('id');
    });

    it('returns the value from startGenerateImage in the result array', async () => {
      const fakeUpdated = { id: 'fake-id', media: [{ type: MediaType.Image }] };
      startGenerateImageSpy.mockResolvedValue(fakeUpdated as any);

      const result = await service.createArtifact(businessId, {
        form: baseForm,
        mediaType: MediaType.Image,
      });

      expect(result[0]).toBe(fakeUpdated);
    });

    it('returns the value from startGenerateVideo in the result array', async () => {
      const fakeUpdated = { id: 'fake-id', media: [{ type: MediaType.Video }] };
      startGenerateVideoSpy.mockResolvedValue(fakeUpdated as any);

      const result = await service.createArtifact(businessId, {
        form: baseForm,
        mediaType: MediaType.Video,
      });

      expect(result[0]).toBe(fakeUpdated);
    });

    it('calls startGenerateImage once per generated artifact when AI returns multiple items', async () => {
      const secondPost = {
        ...generatedPost,
        title: 'Second Post',
        image_prompt: {
          scene: 'Night cityscape',
          title: 'Night Title',
          subtitle: 'Night Sub',
          caption: 'Explore more',
        },
      };

      (mockAiService as any).generatePostsBasedOnManuallySettings.mockResolvedValue([
        generatedPost,
        secondPost,
      ]);

      const result = await service.createArtifact(businessId, {
        form: baseForm,
        mediaType: MediaType.Image,
      });

      expect(startGenerateImageSpy).toHaveBeenCalledTimes(2);
      expect(result).toHaveLength(2);

      // First call uses first post's image_prompt object
      expect(startGenerateImageSpy.mock.calls[0][2]).toEqual(generatedPost.image_prompt);
      // Second call uses second post's image_prompt object
      expect(startGenerateImageSpy.mock.calls[1][2]).toEqual(secondPost.image_prompt);
    });
  });

  // ─────────────────────────────────────────────
  // regenerateAiArtifact
  // ─────────────────────────────────────────────
  describe('regenerateAiArtifact', () => {
    it('happy path — updates media url and creates history entry, returns artifact with media', async () => {
      const media = await prisma.aIArtifactMedia.create({
        data: { artifactId, businessId, type: MediaType.Image, url: 'ai-images/biz/original.png' },
      });

      await prisma.aIArtifactImageHistory.create({
        data: { artifactId, businessId, imageUrl: 'ai-images/biz/original.png', changeType: 'Create' },
      });

      mockAiService.generateAiPhoto.mockResolvedValue('ai-images/biz/new-generated.png');

      const result = await service.regenerateAiArtifact(artifactId, media.id, 'bright product photo');

      expect(mockAiService.generateAiPhoto).toHaveBeenCalledWith(
        businessId,
        'bright product photo',
        expect.arrayContaining([
          expect.objectContaining({ url: expect.stringContaining('original.png') }),
        ]),
      );

      expect(result).not.toBeNull();
      expect(result!.id).toBe(artifactId);
      expect(Array.isArray(result!.media)).toBe(true);

      const updatedMedia = await prisma.aIArtifactMedia.findUnique({ where: { id: media.id } });
      expect(updatedMedia!.url).toBe('ai-images/biz/new-generated.png');

      const historyCount = await prisma.aIArtifactImageHistory.count({ where: { artifactId } });
      expect(historyCount).toBe(2);
    });

    it('passes empty referenceImages when media url is null', async () => {
      const media = await prisma.aIArtifactMedia.create({
        data: { artifactId, businessId, type: MediaType.Image, url: null },
      });

      await service.regenerateAiArtifact(artifactId, media.id, 'clean product shot');

      expect(mockAiService.generateAiPhoto).toHaveBeenCalledWith(
        businessId,
        'clean product shot',
        [],
      );
    });

    it('throws NotFoundException when mediaId does not exist', async () => {
      const nonExistentMediaId = '00000000-0000-0000-0000-000000000099';

      await expect(
        service.regenerateAiArtifact(artifactId, nonExistentMediaId, 'prompt'),
      ).rejects.toThrow(NotFoundException);

      expect(mockAiService.generateAiPhoto).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when media belongs to a different artifact', async () => {
      const otherArtifact = await prisma.aIArtifact.create({
        data: { businessId, type: 'Post', outputJson: {}, status: 'Draft' },
      });

      const media = await prisma.aIArtifactMedia.create({
        data: { artifactId: otherArtifact.id, businessId, type: MediaType.Image },
      });

      await expect(
        service.regenerateAiArtifact(artifactId, media.id, 'prompt'),
      ).rejects.toThrow(NotFoundException);

      expect(mockAiService.generateAiPhoto).not.toHaveBeenCalled();

      await prisma.aIArtifactMedia.delete({ where: { id: media.id } });
      await prisma.aIArtifact.delete({ where: { id: otherArtifact.id } });
    });
  });

  // ─────────────────────────────────────────────
  // revertAiArtifactOriginal
  // ─────────────────────────────────────────────
  describe('revertAiArtifactOriginal', () => {
    it('happy path — reverts media url to original, deletes non-original history entries', async () => {
      const media = await prisma.aIArtifactMedia.create({
        data: { artifactId, businessId, type: MediaType.Image, url: 'ai-images/biz/update2.png' },
      });

      await prisma.aIArtifactImageHistory.create({
        data: { artifactId, businessId, imageUrl: 'ai-images/biz/original.png', changeType: 'Create' },
      });
      await prisma.aIArtifactImageHistory.create({
        data: { artifactId, businessId, imageUrl: 'ai-images/biz/update1.png', changeType: 'Update' },
      });
      await prisma.aIArtifactImageHistory.create({
        data: { artifactId, businessId, imageUrl: 'ai-images/biz/update2.png', changeType: 'Update' },
      });

      const result = await service.revertAiArtifactOriginal(artifactId, media.id);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(artifactId);

      const updatedMedia = await prisma.aIArtifactMedia.findUnique({ where: { id: media.id } });
      expect(updatedMedia!.url).toBe('ai-images/biz/original.png');

      const remainingHistory = await prisma.aIArtifactImageHistory.findMany({ where: { artifactId } });
      expect(remainingHistory).toHaveLength(1);
      expect(remainingHistory[0].changeType).toBe('Create');
    });

    it('calls s3Service.delete for intermediate S3 urls', async () => {
      const media = await prisma.aIArtifactMedia.create({
        data: { artifactId, businessId, type: MediaType.Image, url: 'ai-images/biz/update.png' },
      });

      await prisma.aIArtifactImageHistory.create({
        data: { artifactId, businessId, imageUrl: 'ai-images/biz/create.png', changeType: 'Create' },
      });
      await prisma.aIArtifactImageHistory.create({
        data: { artifactId, businessId, imageUrl: 'ai-images/biz/update.png', changeType: 'Update' },
      });

      mockS3Service.delete.mockResolvedValue(undefined);

      await service.revertAiArtifactOriginal(artifactId, media.id);

      const deletedKeys = mockS3Service.delete.mock.calls.map(([key]) => key);
      expect(deletedKeys).toContain('ai-images/biz/update.png');
      expect(deletedKeys).not.toContain('ai-images/biz/create.png');
    });

    it('throws NotFoundException when mediaId does not exist', async () => {
      const nonExistentMediaId = '00000000-0000-0000-0000-000000000099';

      await expect(
        service.revertAiArtifactOriginal(artifactId, nonExistentMediaId),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when media belongs to a different artifact', async () => {
      const otherArtifact = await prisma.aIArtifact.create({
        data: { businessId, type: 'Post', outputJson: {}, status: 'Draft' },
      });
      const media = await prisma.aIArtifactMedia.create({
        data: { artifactId: otherArtifact.id, businessId, type: MediaType.Image },
      });

      await expect(
        service.revertAiArtifactOriginal(artifactId, media.id),
      ).rejects.toThrow(NotFoundException);

      await prisma.aIArtifactMedia.delete({ where: { id: media.id } });
      await prisma.aIArtifact.delete({ where: { id: otherArtifact.id } });
    });

    it('throws BadRequestException when no Create history entry exists', async () => {
      const media = await prisma.aIArtifactMedia.create({
        data: { artifactId, businessId, type: MediaType.Image, url: 'ai-images/biz/some.png' },
      });

      // No history entries at all
      await expect(
        service.revertAiArtifactOriginal(artifactId, media.id),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when media url already matches the original', async () => {
      const originalUrl = 'ai-images/biz/original-already.png';
      const media = await prisma.aIArtifactMedia.create({
        data: { artifactId, businessId, type: MediaType.Image, url: originalUrl },
      });

      await prisma.aIArtifactImageHistory.create({
        data: { artifactId, businessId, imageUrl: originalUrl, changeType: 'Create' },
      });

      await expect(
        service.revertAiArtifactOriginal(artifactId, media.id),
      ).rejects.toThrow(BadRequestException);
    });
  });

  // ─────────────────────────────────────────────
  // revertAiArtifactPrevious
  // ─────────────────────────────────────────────
  describe('revertAiArtifactPrevious', () => {
    it('happy path — reverts media url to previous version and deletes current history entry', async () => {
      const media = await prisma.aIArtifactMedia.create({
        data: { artifactId, businessId, type: MediaType.Image, url: 'ai-images/biz/current.png' },
      });

      const older = await prisma.aIArtifactImageHistory.create({
        data: { artifactId, businessId, imageUrl: 'ai-images/biz/previous.png', changeType: 'Create' },
      });
      // Ensure newer entry has a strictly later changedAt by waiting a moment
      await new Promise((r) => setTimeout(r, 5));
      const newer = await prisma.aIArtifactImageHistory.create({
        data: { artifactId, businessId, imageUrl: 'ai-images/biz/current.png', changeType: 'Update' },
      });

      const result = await service.revertAiArtifactPrevious(artifactId, media.id);

      expect(result).not.toBeNull();
      expect(result!.id).toBe(artifactId);

      const updatedMedia = await prisma.aIArtifactMedia.findUnique({ where: { id: media.id } });
      expect(updatedMedia!.url).toBe('ai-images/biz/previous.png');

      const deletedEntry = await prisma.aIArtifactImageHistory.findUnique({ where: { id: newer.id } });
      expect(deletedEntry).toBeNull();

      const survivingEntry = await prisma.aIArtifactImageHistory.findUnique({ where: { id: older.id } });
      expect(survivingEntry).not.toBeNull();
    });

    it('calls s3Service.delete for the current url when it is not referenced by other history entries', async () => {
      const media = await prisma.aIArtifactMedia.create({
        data: { artifactId, businessId, type: MediaType.Image, url: 'ai-images/biz/unique-current.png' },
      });

      await prisma.aIArtifactImageHistory.create({
        data: { artifactId, businessId, imageUrl: 'ai-images/biz/prev-ref.png', changeType: 'Create' },
      });
      await new Promise((r) => setTimeout(r, 5));
      await prisma.aIArtifactImageHistory.create({
        data: { artifactId, businessId, imageUrl: 'ai-images/biz/unique-current.png', changeType: 'Update' },
      });

      mockS3Service.delete.mockResolvedValue(undefined);

      await service.revertAiArtifactPrevious(artifactId, media.id);

      const deletedKeys = mockS3Service.delete.mock.calls.map(([key]) => key);
      expect(deletedKeys).toContain('ai-images/biz/unique-current.png');
    });

    it('does not call s3Service.delete when the current url is referenced by another history entry', async () => {
      const sharedUrl = 'ai-images/biz/shared.png';
      const media = await prisma.aIArtifactMedia.create({
        data: { artifactId, businessId, type: MediaType.Image, url: sharedUrl },
      });

      // Create 3 history entries: the oldest also uses sharedUrl,
      // so when we revert from entry3→entry2, sharedUrl still has a reference (entry1)
      await prisma.aIArtifactImageHistory.create({
        data: { artifactId, businessId, imageUrl: sharedUrl, changeType: 'Create' },
      });
      await new Promise((r) => setTimeout(r, 5));
      await prisma.aIArtifactImageHistory.create({
        data: { artifactId, businessId, imageUrl: 'ai-images/biz/different.png', changeType: 'Update' },
      });
      await new Promise((r) => setTimeout(r, 5));
      await prisma.aIArtifactImageHistory.create({
        data: { artifactId, businessId, imageUrl: sharedUrl, changeType: 'Update' },
      });

      mockS3Service.delete.mockResolvedValue(undefined);

      await service.revertAiArtifactPrevious(artifactId, media.id);

      // sharedUrl is also in the Create entry, so S3 should NOT delete it
      expect(mockS3Service.delete).not.toHaveBeenCalled();
    });

    it('throws NotFoundException when mediaId does not exist', async () => {
      const nonExistentMediaId = '00000000-0000-0000-0000-000000000099';

      await expect(
        service.revertAiArtifactPrevious(artifactId, nonExistentMediaId),
      ).rejects.toThrow(NotFoundException);
    });

    it('throws NotFoundException when media belongs to a different artifact', async () => {
      const otherArtifact = await prisma.aIArtifact.create({
        data: { businessId, type: 'Post', outputJson: {}, status: 'Draft' },
      });
      const media = await prisma.aIArtifactMedia.create({
        data: { artifactId: otherArtifact.id, businessId, type: MediaType.Image },
      });

      await expect(
        service.revertAiArtifactPrevious(artifactId, media.id),
      ).rejects.toThrow(NotFoundException);

      await prisma.aIArtifactMedia.delete({ where: { id: media.id } });
      await prisma.aIArtifact.delete({ where: { id: otherArtifact.id } });
    });

    it('throws BadRequestException when there is only one history entry (no previous version)', async () => {
      const media = await prisma.aIArtifactMedia.create({
        data: { artifactId, businessId, type: MediaType.Image, url: 'ai-images/biz/only.png' },
      });

      await prisma.aIArtifactImageHistory.create({
        data: { artifactId, businessId, imageUrl: 'ai-images/biz/only.png', changeType: 'Create' },
      });

      await expect(
        service.revertAiArtifactPrevious(artifactId, media.id),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when there are no history entries at all', async () => {
      const media = await prisma.aIArtifactMedia.create({
        data: { artifactId, businessId, type: MediaType.Image, url: 'ai-images/biz/nohistory.png' },
      });

      await expect(
        service.revertAiArtifactPrevious(artifactId, media.id),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
