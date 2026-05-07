import { Injectable, InternalServerErrorException, NotFoundException, BadRequestException} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { S3Service } from 'src/core/s3/s3.service';
import { StorageUrlService } from "../../core/storage/storage-url.service";
import { AIArtifactBase, CreateAIArtifact } from "./entities/aiArtifact.entity";
import {
  AIArtifactStatus,
  AIArtifactType,
  AIArtifactImageChangeType
} from "@prisma/client";
import { AiService } from "../ai/ai.service";
import {AiPost} from "../ai/entities/aiPost.entity";

@Injectable()
export class AiArtifactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
    private readonly storageUrlService: StorageUrlService,
    private readonly aiService: AiService,
  ) {}

  async getAiArtifacts(businessId: string, type?: AIArtifactType): Promise<AIArtifactBase[]> {
    const artifacts = await this.prisma.aIArtifact.findMany({
      where: {
        businessId,
        ...(type && { type })
      },
      include: {
        products: { include: { product: true } },
      }
    });

    return artifacts.map((artifact) => {
      return {
        ...artifact,
        imageUrl: artifact.imageUrl ? this.storageUrlService.getPublicUrl(artifact.imageUrl) : null,
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

  async createArtifact(businessId: string, body: CreateAIArtifact) {
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
      this.prisma.targetAudience.findMany({ where: { id: { in: body.audiencesIds }}}),
      this.prisma.product.findMany({ where: { id: { in: body.productsIds }}}),
      this.prisma.idea.findMany({ where: { id: { in: body.ideasIds }}}),
      this.prisma.ideaAI.findMany({ where: { id: { in: body.ideasAiIds }}}),
      this.prisma.defaultPhoto.findMany({ where: { id: { in: body.defaultPhotosIds }}}),
      this.prisma.galleryPhoto.findMany({ where: { id: { in: body.photosIds }}})
    ]);

    const settings = {
      business,
      audiences,
      products,
      prompt: body.prompt,
      ideas,
      ideasAi
    }

    const galleryPhotosUrls = [...defaultPhotos, ...photos].map((photo) => ({
      type: photo.type,
      url: photo.url ? this.storageUrlService.getPublicUrl(photo.url) : '',
      description: photo.description ?? null,
    }));

    let generatedContent: AiPost[];
    if (body.type === AIArtifactType.Post) {
      generatedContent = await this.aiService.generatePostsBasedOnManuallySettings(
        settings,
        galleryPhotosUrls,
      );
    } else if (body.type === AIArtifactType.Story) {
      generatedContent = await this.aiService.generateStoriesBasedOnManuallySettings(
        settings,
        galleryPhotosUrls,
      );
    } else {
      throw new BadRequestException(`Unsupported artifact type: ${body.type}`);
    }

    const createdArtifacts = await this.prisma.$transaction(async (tx) => {
      const created: AIArtifactBase[] = [];

      for (const item of generatedContent) {
        const artifact = await tx.aIArtifact.create({
          data: {
            businessId,
            businessProfileId: null,
            type: body.type,
            outputJson: item,
            status: AIArtifactStatus.Draft,
            imageUrl: item.imageUrl,
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

    return createdArtifacts;

/*    if(body.type === AIArtifactType.Post) {
      const posts: AiPost[] = await this.aiService.generatePostsBasedOnManuallySettings(settings, galleryPhotosUrls)
      const createdArtifacts: AIArtifactBase[] = [];

      for (const post of posts) {
        const artifact: AIArtifactBase = await this.prisma.aIArtifact.create({
          data: {
            businessId: businessId,
            businessProfileId: null,
            type: AIArtifactType.Post,
            outputJson: post,
            status: AIArtifactStatus.Draft,
            imageUrl: post.imageUrl,
            imagePrompt: this.serializeImagePrompt(post.image_prompt),
            products: {
              create: products.map(p => ({
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
          }
        });

        createdArtifacts.push(artifact);
      }

      return createdArtifacts;
    }

    if(body.type === AIArtifactType.Story) {
      const stories: AiPost[] = await this.aiService.generateStoriesBasedOnManuallySettings(settings, galleryPhotosUrls)
      const createdArtifacts: AIArtifactBase[] = [];

      for (const story of stories) {
        const artifact: AIArtifactBase = await this.prisma.aIArtifact.create({
          data: {
            businessId: businessId,
            businessProfileId: null,
            type: AIArtifactType.Story,
            outputJson: story,
            status: AIArtifactStatus.Draft,
            imageUrl: story.imageUrl,
            imagePrompt: this.serializeImagePrompt(story.image_prompt),
            products: {
              create: products.map(p => ({
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
          }
        });

        createdArtifacts.push(artifact);
      }

      return createdArtifacts;
    }*/
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
        console.error(
          `Failed to delete S3 object during artifact deletion: ${urlsToDelete[index]}`,
          result.reason,
        );
      }
    });

    return { success: true };
  }

  async regenerateAiArtifact(id, body) {
    const artifact = await this.prisma.aIArtifact.findUnique({
      where: { id },
      select: {
        id: true,
        businessId: true,
        imageUrl: true,
        imagePrompt: true,
        type: true
      },
    });

    if (!artifact) {
      throw new NotFoundException(`AI artifact with id ${id} not found`);
    }

    const referenceImages = artifact.imageUrl ? [{
      url: this.storageUrlService.getPublicUrl(artifact.imageUrl),
      type: artifact.type,
      description: null,
    }] : [];

    const generatedImageUrl = await this.aiService.generateAiPhoto(
      artifact.businessId,
      body,
      referenceImages,
    );

    const updated = await this.prisma.$transaction(async (tx) => {
      const updatedArtifact = await tx.aIArtifact.update({
        where: { id },
        data: {
          imageUrl: generatedImageUrl,
          imagePrompt: body,
        },
      });

      await tx.aIArtifactImageHistory.create({
        data: {
          artifactId: updatedArtifact.id,
          businessId: updatedArtifact.businessId,
          imageUrl: generatedImageUrl,
          imagePrompt: body,
          changeType: AIArtifactImageChangeType.Update,
        },
      });

      return updatedArtifact;
    });

    return updated;
  }

  async revertAiArtifactOriginal(id: string) {
    const artifact = await this.prisma.aIArtifact.findUnique({
      where: { id },
      select: {
        id: true,
        businessId: true,
        imageUrl: true,
        imagePrompt: true,
      },
    });

    if (!artifact) {
      throw new NotFoundException(`AI artifact with id ${id} not found`);
    }

    const originalEntry = await this.prisma.aIArtifactImageHistory.findFirst({
      where: {
        artifactId: id,
        changeType: AIArtifactImageChangeType.Create,
      },
      orderBy: { changedAt: 'asc' },
    });

    if (!originalEntry) {
      throw new BadRequestException(
        `Original image entry for AI artifact with id ${id} not found`,
      );
    }

    if (artifact.imageUrl === originalEntry.imageUrl) {
      throw new BadRequestException('Image is already at the original version');
    }

    const intermediateEntries = await this.prisma.aIArtifactImageHistory.findMany({
      where: {
        artifactId: id,
        id: { not: originalEntry.id },
      },
      select: { imageUrl: true },
    });

    const urlsToDelete = Array.from(
      new Set(
        intermediateEntries
          .map((e) => e.imageUrl)
          .filter((url): url is string => Boolean(url) && url !== originalEntry.imageUrl),
      ),
    );

    const reverted = await this.prisma.$transaction(async (tx) => {
      await tx.aIArtifactImageHistory.deleteMany({
        where: {
          artifactId: id,
          id: { not: originalEntry.id },
        },
      });

      const updated = await tx.aIArtifact.update({
        where: { id },
        data: {
          imageUrl: originalEntry.imageUrl,
          imagePrompt: originalEntry.imagePrompt,
        },
      });

      return updated;
    });

    const results = await Promise.allSettled(
      urlsToDelete.map((url) => this.s3Service.delete(url)),
    );

    results.forEach((result, index) => {
      if (result.status === 'rejected') {
        console.error(
          `Failed to delete S3 object during revert: ${urlsToDelete[index]}`,
          result.reason,
        );
      }
    });

    return reverted;
  }

  async revertAiArtifactPrevious(id: string) {
    const artifact = await this.prisma.aIArtifact.findUnique({
      where: { id },
      select: {
        id: true,
        businessId: true,
        imageUrl: true,
        imagePrompt: true,
      },
    });

    if (!artifact) {
      throw new NotFoundException(`AI artifact with id ${id} not found`);
    }

    const lastTwoEntries = await this.prisma.aIArtifactImageHistory.findMany({
      where: { artifactId: id },
      orderBy: { changedAt: 'desc' },
      take: 2,
    });

    if (lastTwoEntries.length < 2) {
      throw new BadRequestException(
        'Cannot revert: no previous version available',
      );
    }

    const [currentEntry, previousEntry] = lastTwoEntries;

    if (artifact.imageUrl === previousEntry.imageUrl) {
      throw new BadRequestException('Image is already at the previous version');
    }

    const otherEntriesWithSameUrl = await this.prisma.aIArtifactImageHistory.count({
      where: {
        artifactId: id,
        imageUrl: artifact.imageUrl ?? '',
        id: { not: currentEntry.id },
      },
    });

    const shouldDeleteFromS3 = otherEntriesWithSameUrl === 0;
    const urlToDelete = artifact.imageUrl;

    const reverted = await this.prisma.$transaction(async (tx) => {
      await tx.aIArtifactImageHistory.delete({
        where: { id: currentEntry.id },
      });

      const updated = await tx.aIArtifact.update({
        where: { id },
        data: {
          imageUrl: previousEntry.imageUrl,
          imagePrompt: previousEntry.imagePrompt,
        },
      });

      return updated;
    });

    if (
      shouldDeleteFromS3 &&
      urlToDelete &&
      urlToDelete !== previousEntry.imageUrl
    ) {
      try {
        await this.s3Service.delete(urlToDelete);
      } catch (error) {
        console.error(
          `Failed to delete S3 object during revert: ${urlToDelete}`,
          error,
        );
      }
    }

    return reverted;
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
