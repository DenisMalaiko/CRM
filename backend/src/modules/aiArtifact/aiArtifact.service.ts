import { Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { S3Service } from 'src/core/s3/s3.service';
import { StorageUrlService } from "../../core/storage/storage-url.service";
import { AIArtifactBase, CreateAIArtifact } from "./entities/aiArtifact.entity";
import {AIArtifactStatus, AIArtifactType} from "@prisma/client";
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

  async deleteAiArtifact(id: string) {
    const aIArtifact = await this.prisma.aIArtifact.findUnique({
      where: { id },
      select: { id: true, imageUrl: true },
    });

    if (!aIArtifact) {
      throw new Error('AI artifact not found');
    }

    if (aIArtifact.imageUrl) {
      await this.s3Service.delete(aIArtifact.imageUrl);
    }

    return await this.prisma.$transaction(async (tx) => {
      await tx.aIArtifact.delete({
        where: { id },
      });
    });
  }

  async createArtifact(businessId: string, body: CreateAIArtifact) {
    const [
      business,
      audiences,
      products,
      prompts,
      ideas,
      defaultPhotos,
      photos,
    ] = await Promise.all([
      this.prisma.business.findUnique({ where: { id: businessId }}),
      this.prisma.targetAudience.findMany({ where: { id: { in: body.audiencesIds }}}),
      this.prisma.product.findMany({ where: { id: { in: body.productsIds }}}),
      this.prisma.prompt.findMany({ where: { id: { in: body.promptsIds }}}),
      this.prisma.idea.findMany({ where: { id: { in: body.ideasIds }}}),
      this.prisma.defaultPhoto.findMany({ where: { id: { in: body.defaultPhotosIds }}}),
      this.prisma.galleryPhoto.findMany({ where: { id: { in: body.photosIds }}})
    ]);

    const settings = {
      business,
      audiences,
      products,
      prompts,
      ideas,
    }

    const galleryPhotosUrls = [...defaultPhotos, ...photos].map((photo) => {
      return {
        type: photo.type,
        url: photo.url ? this.storageUrlService.getPublicUrl(photo.url) : "",
        description: photo.description ?? null,
      };
    });

    if(body.type === AIArtifactType.Post) {
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
    }
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