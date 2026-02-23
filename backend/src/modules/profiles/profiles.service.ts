import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { GalleryPhotoType } from "@prisma/client";
import { PrismaService } from '../../core/prisma/prisma.service';
import { AiService } from "../ai/ai.service";
import { GalleryService } from "../gallery/gallery.service";
import { TProfile, TProfileCreate, TProfileUpdate } from "./entities/profile.entity";
import { AIArtifactStatus, AIArtifactType } from "@prisma/client";
import { AiPost } from "../ai/entities/aiPost.entity";
import { AIArtifactBase } from "../aiArtifact/entities/aiArtifact.entity";
import { StorageUrlService } from "../../core/storage/storage-url.service";

@Injectable()
export class ProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly aiService: AiService,
    private readonly galleryService: GalleryService,
    private readonly storageUrlService: StorageUrlService
  ) {}

  async getProfiles(businessId: string): Promise<TProfile[]> {
    const profiles = await this.prisma.businessProfile.findMany({
      where: { businessId: businessId },
      include: {
        products: { include: { product: true } },
        audiences: { include: { targetAudience: true } },
        prompts: { include: { prompt: true } },
        photos: { include: { galleryPhoto: true } },
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
      prompts: profile?.prompts.map(p => p.prompt),
      photos: profile?.photos.map(p => p.galleryPhoto),
    }));
  }

  async createProfile(body: TProfileCreate): Promise<TProfile> {
    const {
      productsIds,
      audiencesIds,
      promptsIds = [],
      photosIds = [],
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
        photos: {
          createMany: {
            data: photosIds.map(galleryPhotoId => ({
              galleryPhotoId,
            })),
          },
        },
      }
    });

    return profile;
  }

  async updateProfile(id: string, body: TProfileUpdate) {
    if (!id) throw new NotFoundException('Product ID is required');

    console.log("BODY ", body)

    try {
      const {
        productsIds,
        audiencesIds,
        promptsIds = [],
        photosIds = [],
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

          photos: photosIds
            ? {
              deleteMany: {},
              createMany: {
                data: photosIds.map(galleryPhotoId => ({galleryPhotoId})),
              },
            }
            : undefined,
        },

        include: {
          products: true,
          audiences: true,
          prompts: true,
          photos: true
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
        photos: { include: { galleryPhoto: true } },
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
        photos: profile?.photos.map(p => p.galleryPhoto),
      };

      const galleryPhotosUrls = mappedProfile.photos.map((photo) => {
        return photo.url ? this.storageUrlService.getPublicUrl(photo.url) : "";
      });

      const posts: AiPost[] = await this.aiService.generatePostsBasedOnBusinessProfile(mappedProfile, galleryPhotosUrls);

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

      return createdArtifacts;
    }
  }
}