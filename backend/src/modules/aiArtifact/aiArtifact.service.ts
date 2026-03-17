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
    console.log("Create Artifact")
    console.log("---------------")

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

    console.log("BUSINESS ", business)
    console.log("AUDIENCES ", audiences)
    console.log("PRODUCTS ", products)
    console.log("PROMPTS ", prompts)
    console.log("IDEAS ", ideas)
    console.log("DEFAULT PHOTOS ", defaultPhotos)
    console.log("PHOTOS ", photos)
    console.log("---------------")

    const settings = {
      business,
      audiences,
      products,
      prompts,
      ideas,
    }

    console.log("SETTINGS ", settings)
    console.log("---------------")

    const galleryPhotosUrls = [...defaultPhotos, ...photos].map((photo) => {
      return {
        type: photo.type,
        url: photo.url ? this.storageUrlService.getPublicUrl(photo.url) : "",
        description: photo.description ?? null,
      };
    });

    console.log("PHOTOS ", galleryPhotosUrls)
    console.log("---------------")


    if(body.type === AIArtifactType.Post) {
      console.log("CREATE POST");
      console.log("---------------")

      const posts: AiPost[] = await this.aiService.generatePostsBasedOnManuallySettings(settings, galleryPhotosUrls)

      console.log("POSTS ", posts)
      console.log("---------------")

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
            imagePrompt: post.image_prompt,
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
      console.log("CREATE STORY");
      console.log("---------------")

      const stories: AiPost[] = await this.aiService.generateStoriesBasedOnManuallySettings(settings, galleryPhotosUrls)

      console.log("STORIES ", stories)
      console.log("---------------")

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
            imagePrompt: story.image_prompt,
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
}