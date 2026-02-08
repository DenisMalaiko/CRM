import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from "../ai/ai.service";
import { TProfile, TProfileCreate, TProfileUpdate } from "./entities/profile.entity";
import { AIArtifactStatus, AIArtifactType } from "@prisma/client";
import { AiPost } from "../ai/entities/aiPost.entity";
import { AIArtifactBase } from "../aiArtifact/entities/aiArtifact.entity";

@Injectable()
export class ProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService
  ) {}

  async getProfiles(businessId: string): Promise<TProfile[]> {
    const profiles = await this.prisma.businessProfile.findMany({
      where: { businessId: businessId },
      include: {
        products: { include: { product: true } },
        audiences: { include: { targetAudience: true } },
        prompts: { include: { prompt: true } },
        business: true
      },
    });

    return profiles.map(profile => ({
      id: profile.id,
      businessId: profile.businessId,
      name: profile.name,
      profileFocus: profile.profileFocus,
      isActive: profile.isActive,
      createdAt: profile.createdAt,
      business: profile?.business,
      products: profile.products.map(p => p.product),
      audiences: profile.audiences.map(a => a.targetAudience),
      prompts: profile.prompts.map(p => p.prompt),
    }));
  }

  async createProfile(body: TProfileCreate): Promise<TProfile> {
    const {
      productsIds,
      audiencesIds,
      promptsIds,
      ...profileData
    } = body;

    const profile: any = await this.prisma.businessProfile.create({
      data: {
        ...profileData,
        products: {
          createMany: {
            data: productsIds.map(productId => ({
              productId,
            })),
          },
        },
        audiences: {
          createMany: {
            data: audiencesIds.map(targetAudienceId => ({
              targetAudienceId,
            })),
          },
        },
        prompts: {
          createMany: {
            data: promptsIds.map(promptId => ({
              promptId,
            })),
          },
        },
      }
    });

    return profile;
  }

  async updateProfile(id: string, body: TProfileUpdate) {
    if (!id) throw new NotFoundException('Product ID is required');

    try {
      const {
        productsIds,
        audiencesIds,
        promptsIds,
        ...profileData
      } = body;

      return await this.prisma.businessProfile.update({
        where: { id },
        data: {
          ...profileData,
          products: productsIds
            ? {
              deleteMany: {},
              createMany: {
                data: productsIds.map(productId => ({productId})),
              },
            }
            : undefined,
          audiences: audiencesIds
            ? {
              deleteMany: {},
              createMany: {
                data: audiencesIds.map(targetAudienceId => ({
                  targetAudienceId,
                })),
              },
            }
            : undefined,

          prompts: promptsIds
            ? {
              deleteMany: {},
              createMany: {
                data: promptsIds.map(promptId => ({promptId})),
              },
            }
            : undefined,
        },

        include: {
          products: true,
          audiences: true,
          prompts: true,
        },
      });
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      throw new InternalServerErrorException('Failed to update product');
    }
  }

  async deleteProfile(id: string) {
    try {
      return await this.prisma.businessProfile.delete({ where: { id } });
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Profile with ID ${id} not found`);
      }
      throw err;
    }
  }

  async generateProfilePosts(id) {
    const profile = await this.prisma.businessProfile.findUnique({
      where: { id },
      include: {
        products: { include: { product: true } },
        audiences: { include: { targetAudience: true } },
        prompts: { include: { prompt: true } },
        business: true
      },
    });

    if(profile) {
      const mappedProfile: TProfile = {
        id: profile.id,
        businessId: profile.businessId,
        name: profile.name,
        profileFocus: profile.profileFocus,
        isActive: profile.isActive,
        createdAt: profile.createdAt,
        business: profile?.business,
        products: profile.products.map(p => p.product),
        audiences: profile.audiences.map(a => a.targetAudience),
        prompts: profile.prompts.map(p => p.prompt),
      };

      const posts: AiPost[] = await this.aiService.generatePostsBasedOnBusinessProfile(mappedProfile);

      const createdArtifacts: AIArtifactBase[] = [];

      for (const post of posts) {
        const artifact: AIArtifactBase = await this.prisma.aIArtifact.create({
          data: {
            businessId: profile.businessId,
            businessProfileId: profile.id,
            type: AIArtifactType.Post,
            outputJson: post,
            status: AIArtifactStatus.Draft,
            imageUrl: post.imageUrl,
            imagePrompt: post.image_prompt,
            products: {
              create: profile.products.map(p => ({
                productId: p.product.id,
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

      console.log("SUCCESSFULLY GENERATED POSTS!")

      return createdArtifacts;
    }
  }
}