import { ConflictException, Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AiService } from "../ai/ai.service";
import { TProfile, TProfileCreate } from "./entities/profile.entity";
import { AIArtifactType, AIArtifactStatus } from "@prisma/client";
import { AiPost } from "../ai/entities/aiPost.entity";
import { AIArtifactBase } from "../aiArtifact/entities/aiArtifact.entity";

@Injectable()
export class ProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService
  ) {}

  async getProfiles(businessId: string): Promise<ApiResponse<TProfile[]>> {
    const profiles = await this.prisma.businessProfile.findMany({
      where: { businessId: businessId },
      include: {
        products: { include: { product: true } },
        audiences: { include: { targetAudience: true } },
        prompts: { include: { prompt: true } },
        business: true
      },
    });

    const mappedProfiles: TProfile[] = profiles.map(profile => ({
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

    return {
      statusCode: 200,
      message: "Profiles has been got!",
      data: mappedProfiles,
    };
  }

  async createProfile(body: TProfileCreate) {
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

    return {
      statusCode: 200,
      message: "Profile has been created!",
      data: profile,
    }
  }

  async updateProfile(id: string, body: TProfileCreate) {
    if (!id) {
      throw new NotFoundException('Product ID is required');
    }

    try {
      const {
        productsIds,
        audiencesIds,
        promptsIds,
        ...profileData
      } = body;

      const updated = await this.prisma.businessProfile.update({
        where: {id},
        data: {
          ...profileData,

          products: productsIds
            ? {
              deleteMany: {}, // ⬅️ КРИТИЧНО
              createMany: {
                data: productsIds.map(productId => ({ productId })),
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
                data: promptsIds.map(promptId => ({ promptId })),
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

      return {
        statusCode: 200,
        message: 'Profile has been updated!',
        data: updated,
      };
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      throw new InternalServerErrorException('Failed to update product');
    }
  }

  async deleteProfile(id: string) {
    return this.prisma.$transaction(async (tx) => {
      try {
        if (!id) throw new NotFoundException('Profile ID is required');

        const deleted = await tx.businessProfile.delete({
          where: { id },
        });

        return {
          statusCode: 200,
          message: 'Profile has been deleted!',
          data: deleted,
        };
      } catch (err: any) {

        if (err.code === 'P2025') {
          throw new NotFoundException(`Profile with ID ${id} not found`);
        }

        if (err instanceof ConflictException) {
          throw err;
        }

        throw new InternalServerErrorException('Failed to delete profile');
      }
    });
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

      return {
        statusCode: 200,
        message: 'Posts has been gotten!',
        data: createdArtifacts,
      };
    }
  }
}