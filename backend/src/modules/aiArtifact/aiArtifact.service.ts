import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { S3Service } from 'src/core/s3/s3.service';
import { StorageUrlService } from "../../core/storage/storage-url.service";
import { AIArtifactBase, CreateAIArtifact } from "./entities/aiArtifact.entity";
import {
  AIArtifactStatus,
  AIArtifactType,
  AIArtifactImageChangeType,
  MediaType,
} from "@prisma/client";
import { AiService } from "../ai/ai.service";
import {AiPost} from "../ai/entities/aiPost.entity";
import { AiReplicateService, Photo } from "../ai/ai-replicate.service";

@Injectable()
export class AiArtifactService {
  private readonly logger = new Logger(AiArtifactService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
    private readonly storageUrlService: StorageUrlService,
    private readonly aiService: AiService,
    private readonly aiReplicateService: AiReplicateService,
  ) {}

  async getAiArtifacts(businessId: string, type?: AIArtifactType): Promise<AIArtifactBase[]> {
    const artifacts = await this.prisma.aIArtifact.findMany({
      where: {
        businessId,
        ...(type && { type })
      },
      include: {
        products: { include: { product: true } },
        media: { orderBy: { order: 'asc' } },
      }
    });

    return artifacts.map((artifact) => {
      return {
        ...artifact,
        imageUrl: artifact.imageUrl ? this.storageUrlService.getPublicUrl(artifact.imageUrl) : null,
        media: artifact.media.map((m) => ({
          ...m,
          url: m.url ? this.storageUrlService.getPublicUrl(m.url) : null,
        })),
      }
    })
  }

  async updateAiArtifact(id: string, body: any): Promise<AIArtifactBase> {
    if (!id) throw new NotFoundException('Artifact ID is required');

    try {
      return await this.prisma.aIArtifact.update({
        where: {id},
        data: {
          type: body.type,
          outputJson: body.outputJson,
          status: body.status,
        },
        include: {
          products: { include: { product: true } },
        }
      });
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Artifact with ID ${id} not found`);
      }

      throw new InternalServerErrorException('Failed to update artifact');
    }
  }

  async createArtifact(businessId: string, body: { form: CreateAIArtifact, mediaType: MediaType }) {
    const [
      business,
      audiences,
      products,
      ideas,
      ideasAi,
      defaultPhotos,
      photos,
    ] = await Promise.all([
      this.prisma.business.findUnique({ where: { id: businessId }}),
      this.prisma.targetAudience.findMany({ where: { id: { in: body.form.audiencesIds }}}),
      this.prisma.product.findMany({ where: { id: { in: body.form.productsIds }}}),
      this.prisma.idea.findMany({ where: { id: { in: body.form.ideasIds }}}),
      this.prisma.ideaAI.findMany({ where: { id: { in: body.form.ideasAiIds }}}),
      this.prisma.defaultPhoto.findMany({ where: { id: { in: body.form.defaultPhotosIds }}}),
      this.prisma.galleryPhoto.findMany({ where: { id: { in: body.form.photosIds }}})
    ]);

    const settings = {
      business,
      audiences,
      products,
      prompt: body.form.prompt,
      ideas,
      ideasAi
    }

    const galleryPhotosUrls = [...defaultPhotos, ...photos].map((photo) => ({
      type: photo.type,
      url: photo.url ? this.storageUrlService.getPublicUrl(photo.url) : '',
      description: photo.description ?? null,
    }));

    let generatedContent: AiPost[];
    if (body.form.type === AIArtifactType.Post) {
      generatedContent = await this.aiService.generatePostsBasedOnManuallySettings(
        settings,
        galleryPhotosUrls,
      );
    } else if (body.form.type === AIArtifactType.Story) {
      generatedContent = await this.aiService.generateStoriesBasedOnManuallySettings(
        settings,
        galleryPhotosUrls,
      );
    } else {
      throw new BadRequestException(`Unsupported artifact type: ${body.form.type}`);
    }

    const createdArtifacts = await this.prisma.$transaction(async (tx) => {
      const created: any[] = [];

      for (const item of generatedContent) {
        const artifact = await tx.aIArtifact.create({
          data: {
            businessId,
            businessProfileId: null,
            type: body.form.type,
            outputJson: item,
            status: AIArtifactStatus.Draft,
            imagePrompt: this.serializeImagePrompt(item.image_prompt),
            products: {
              create: products.map((p) => ({
                productId: p.id,
              })),
            },
          },
          include: {
            products: {
              include: {
                product: true,
              },
            },
          },
        });


        if (artifact.imageUrl) {
          await tx.aIArtifactImageHistory.create({
            data: {
              artifactId: artifact.id,
              businessId: artifact.businessId,
              imageUrl: artifact.imageUrl,
              imagePrompt: artifact.imagePrompt,
              changeType: AIArtifactImageChangeType.Create,
            },
          });
        }

        created.push(artifact);
      }

      return created;
    });

    const artifactsWithMedia = await Promise.all(
      createdArtifacts.map((artifact, index) => {
        const imagePrompt = generatedContent[index]?.image_prompt;
        if (!imagePrompt) return Promise.resolve(artifact);

        if (body.mediaType === MediaType.Image) {
          return this.startGenerateImage(artifact.id, businessId, imagePrompt, galleryPhotosUrls);
        }
        if (body.mediaType === MediaType.Video) {
          return this.startGenerateVideo({
            artifactId: artifact.id,
            businessId,
            description: body?.form?.prompt ?? '',
            galleryPhotosUrls,
            artifactType: body.form.type,
          });
        }
        return Promise.resolve(artifact);
      })
    );

    return artifactsWithMedia;
  }

  async deleteAiArtifact(id: string) {
    const aiArtifact = await this.prisma.aIArtifact.findUnique({
      where: { id },
      select: { id: true, imageUrl: true },
    });

    if (!aiArtifact) {
      throw new NotFoundException(`AI artifact with id ${id} not found`);
    }

    const historyEntries = await this.prisma.aIArtifactImageHistory.findMany({
      where: { artifactId: id },
      select: { imageUrl: true },
    });

    const urlsToDelete = Array.from(
      new Set(
        [aiArtifact.imageUrl, ...historyEntries.map((h) => h.imageUrl)]
          .filter((url): url is string => Boolean(url)),
      ),
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.aIArtifactImageHistory.deleteMany({
        where: { artifactId: id },
      });

      await tx.aIArtifact.delete({
        where: { id },
      });
    });

    const results = await Promise.allSettled(
      urlsToDelete.map((url) => this.s3Service.delete(url)),
    );

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(
          `Failed to delete S3 object during artifact deletion: ${urlsToDelete[index]}`,
          result.reason,
        );
      }
    });

    return { success: true };
  }

  async deleteAiArtifactsBatch(ids: string[]): Promise<{ success: boolean }> {
    const artifacts = await this.prisma.aIArtifact.findMany({
      where: { id: { in: ids } },
      select: { id: true, imageUrl: true },
    });

    if (artifacts.length === 0) {
      throw new NotFoundException('No artifacts found for the provided IDs');
    }

    const foundIds = artifacts.map((a) => a.id);

    const [historyEntries, mediaEntries] = await Promise.all([
      this.prisma.aIArtifactImageHistory.findMany({
        where: { artifactId: { in: foundIds } },
        select: { imageUrl: true },
      }),
      this.prisma.aIArtifactMedia.findMany({
        where: { artifactId: { in: foundIds } },
        select: { url: true },
      }),
    ]);

    const urlsToDelete = Array.from(
      new Set(
        [
          ...artifacts.map((a) => a.imageUrl),
          ...historyEntries.map((h) => h.imageUrl),
          ...mediaEntries.map((m) => m.url),
        ].filter((url): url is string => Boolean(url)),
      ),
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.aIArtifact.deleteMany({ where: { id: { in: foundIds } } });
    });

    const results = await Promise.allSettled(
      urlsToDelete.map((url) => this.s3Service.delete(url)),
    );

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(
          `Failed to delete S3 object during batch artifact deletion: ${urlsToDelete[index]}`,
          result.reason,
        );
      }
    });

    return { success: true };
  }

  async regenerateAiArtifact(artifactId: string, mediaId: string, prompt: string) {
    const media = await this.prisma.aIArtifactMedia.findUnique({ where: { id: mediaId } });
    if (!media || media.artifactId !== artifactId) {
      throw new NotFoundException(`Media with id ${mediaId} not found for artifact ${artifactId}`);
    }

    const artifact = await this.prisma.aIArtifact.findUnique({
      where: { id: artifactId },
      select: { id: true, businessId: true, type: true },
    });
    if (!artifact) {
      throw new NotFoundException(`AI artifact with id ${artifactId} not found`);
    }

    const referenceImages = media.url ? [{
      url: this.storageUrlService.getPublicUrl(media.url),
      type: artifact.type,
      description: null,
    }] : [];

    const generatedImageUrl = await this.aiService.generateAiPhoto(
      artifact.businessId,
      prompt,
      referenceImages,
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.aIArtifactMedia.update({
        where: { id: mediaId },
        data: { url: generatedImageUrl },
      });

      await tx.aIArtifactImageHistory.create({
        data: {
          artifactId,
          businessId: artifact.businessId,
          imageUrl: generatedImageUrl,
          imagePrompt: prompt,
          changeType: AIArtifactImageChangeType.Update,
        },
      });
    });

    return this.prisma.aIArtifact.findUnique({
      where: { id: artifactId },
      include: { media: { orderBy: { order: 'asc' } } },
    });
  }

  async revertAiArtifactOriginal(artifactId: string, mediaId: string) {
    const media = await this.prisma.aIArtifactMedia.findUnique({ where: { id: mediaId } });
    if (!media || media.artifactId !== artifactId) {
      throw new NotFoundException(`Media with id ${mediaId} not found for artifact ${artifactId}`);
    }

    const originalEntry = await this.prisma.aIArtifactImageHistory.findFirst({
      where: { artifactId, changeType: AIArtifactImageChangeType.Create },
      orderBy: { changedAt: 'asc' },
    });

    if (!originalEntry) {
      throw new BadRequestException(
        `Original image entry for AI artifact with id ${artifactId} not found`,
      );
    }

    if (media.url === originalEntry.imageUrl) {
      throw new BadRequestException('Image is already at the original version');
    }

    const intermediateEntries = await this.prisma.aIArtifactImageHistory.findMany({
      where: { artifactId, id: { not: originalEntry.id } },
      select: { imageUrl: true },
    });

    const urlsToDelete = Array.from(
      new Set(
        [media.url, ...intermediateEntries.map((e) => e.imageUrl)]
          .filter((url): url is string => Boolean(url) && url !== originalEntry.imageUrl),
      ),
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.aIArtifactImageHistory.deleteMany({
        where: { artifactId, id: { not: originalEntry.id } },
      });

      await tx.aIArtifactMedia.update({
        where: { id: mediaId },
        data: { url: originalEntry.imageUrl },
      });
    });

    const results = await Promise.allSettled(
      urlsToDelete.map((url) => this.s3Service.delete(url)),
    );

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        this.logger.error(
          `Failed to delete S3 object during revert: ${urlsToDelete[index]}`,
          result.reason,
        );
      }
    });

    return this.prisma.aIArtifact.findUnique({
      where: { id: artifactId },
      include: { media: { orderBy: { order: 'asc' } } },
    });
  }

  async revertAiArtifactPrevious(artifactId: string, mediaId: string) {
    const media = await this.prisma.aIArtifactMedia.findUnique({ where: { id: mediaId } });
    if (!media || media.artifactId !== artifactId) {
      throw new NotFoundException(`Media with id ${mediaId} not found for artifact ${artifactId}`);
    }

    const lastTwoEntries = await this.prisma.aIArtifactImageHistory.findMany({
      where: { artifactId },
      orderBy: { changedAt: 'desc' },
      take: 2,
    });

    if (lastTwoEntries.length < 2) {
      throw new BadRequestException('Cannot revert: no previous version available');
    }

    const [currentEntry, previousEntry] = lastTwoEntries;

    if (media.url === previousEntry.imageUrl) {
      throw new BadRequestException('Image is already at the previous version');
    }

    const otherEntriesWithSameUrl = await this.prisma.aIArtifactImageHistory.count({
      where: {
        artifactId,
        imageUrl: media.url ?? '',
        id: { not: currentEntry.id },
      },
    });

    const shouldDeleteFromS3 = otherEntriesWithSameUrl === 0;
    const urlToDelete = media.url;

    await this.prisma.$transaction(async (tx) => {
      await tx.aIArtifactImageHistory.delete({ where: { id: currentEntry.id } });

      await tx.aIArtifactMedia.update({
        where: { id: mediaId },
        data: { url: previousEntry.imageUrl },
      });
    });

    if (shouldDeleteFromS3 && urlToDelete && urlToDelete !== previousEntry.imageUrl) {
      try {
        await this.s3Service.delete(urlToDelete);
      } catch (error) {
        this.logger.error(
          `Failed to delete S3 object during revert: ${urlToDelete}`,
          error,
        );
      }
    }

    return this.prisma.aIArtifact.findUnique({
      where: { id: artifactId },
      include: { media: { orderBy: { order: 'asc' } } },
    });
  }

  async startGenerateImage(artifactId: string, businessId: string, imagePrompt: any, photos: Photo[]) {
    const artifact = await this.prisma.aIArtifact.findUnique({ where: { id: artifactId } });
    if (!artifact || artifact.businessId !== businessId) throw new NotFoundException(`Artifact ${artifactId} not found`);

    const isStory = artifact.type === AIArtifactType.Story;
    const s3Key = isStory
      ? await this.aiReplicateService.generateStoryImage(imagePrompt, businessId, photos)
      : await this.aiReplicateService.generatePostImage(imagePrompt, businessId, photos);

    await this.prisma.$transaction(async (tx) => {
      await tx.aIArtifactMedia.create({
        data: { artifactId, businessId, type: MediaType.Image, url: s3Key },
      });

      await tx.aIArtifactImageHistory.create({
        data: {
          artifactId,
          businessId,
          imageUrl: s3Key,
          imagePrompt: this.serializeImagePrompt(imagePrompt),
          changeType: AIArtifactImageChangeType.Create,
        },
      });
    });

    return await this.prisma.aIArtifact.findUnique({
      where: { id: artifactId },
      include: { media: { orderBy: { order: 'asc' } } },
    });
  }

  async startGenerateVideo(params: { artifactId: string; businessId: string; description: string; galleryPhotosUrls: any; artifactType: AIArtifactType; }) {
    const { artifactId, businessId, description, galleryPhotosUrls, artifactType } = params;

    const artifact = await this.prisma.aIArtifact.findUnique({ where: { id: artifactId } });
    if (!artifact || artifact.businessId !== businessId) throw new NotFoundException(`Artifact ${artifactId} not found`);

    const sourceUrl = galleryPhotosUrls[0]?.url;

    const media = await this.prisma.aIArtifactMedia.create({
      data: { artifactId, businessId, type: MediaType.Video, sourceUrl },
    });

    try {
      const aspectRatio = artifactType === AIArtifactType.Story ? '9:16' : '4:5';
      const s3Key = await this.aiReplicateService.generateAndSaveVideo({
        prompt: description,
        businessId,
        sourceUrl,
        aspectRatio,
      });
      await this.prisma.aIArtifactMedia.update({
        where: { id: media.id },
        data: { url: s3Key },
      });
    } catch (err) {
      await this.prisma.aIArtifactMedia.delete({ where: { id: media.id } });
      throw err;
    }

    return await this.prisma.aIArtifact.findUnique({
      where: { id: artifactId },
      include: { media: { orderBy: { order: 'asc' } } },
    });
  }

  async getAiArtifact(artifactId: string, businessId: string) {
    const artifact = await this.prisma.aIArtifact.findUnique({
      where: { id: artifactId },
      include: { media: { orderBy: { order: 'asc' } } },
    });
    if (!artifact || artifact.businessId !== businessId) throw new NotFoundException(`Artifact ${artifactId} not found`);

    const pendingMedia = artifact.media.filter((m) => !!m.jobId && !m.url);

    for (const mediaItem of pendingMedia) {
      const jobId = mediaItem.jobId as string;
      try {
        if (mediaItem.type === MediaType.Image) {
          const s3Key = await this.aiReplicateService.pollAndSaveImage(
            jobId,
            businessId,
          );
          if (s3Key) {
            await this.prisma.aIArtifactMedia.update({
              where: { id: mediaItem.id },
              data: { url: s3Key, jobId: null },
            });
            mediaItem.url = s3Key;
            mediaItem.jobId = null;
          }
        } else if (mediaItem.type === MediaType.Video) {
          await this.prisma.aIArtifactMedia.update({
            where: { id: mediaItem.id },
            data: { jobId: null },
          });
          mediaItem.jobId = null;
        }
      } catch {
        await this.prisma.aIArtifactMedia.update({
          where: { id: mediaItem.id },
          data: { jobId: null },
        });
        mediaItem.jobId = null;
      }
    }

    return {
      ...artifact,
      imageUrl: artifact.imageUrl
        ? this.storageUrlService.getPublicUrl(artifact.imageUrl)
        : null,
      media: artifact.media.map((m) => ({
        ...m,
        url: m.url ? this.storageUrlService.getPublicUrl(m.url) : null,
      })),
    };
  }

  private serializeImagePrompt(imagePrompt: {
    scene: string;
    title: string;
    subtitle: string;
    caption: string;
  }) {
    return `
      SCENE: ${imagePrompt.scene}
      TITLE: ${imagePrompt.title}
      SUBTITLE: ${imagePrompt.subtitle}
      CAPTION: ${imagePrompt.caption}
    `.trim();
  }
}
