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
import { ProfileFocus } from "@prisma/client"

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
        ideas: { include: { idea: true } },
        prompts: { include: { prompt: true } },
        photos: { include: { galleryPhoto: true } },
        defaultPhotos: { include: { defaultPhoto: true } },
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
      audiences: profile.audiences.map(a => a.targetAudience),
      products: profile?.products.map(p => p.product),
      ideas: profile?.ideas.map(p => p.idea),
      prompts: profile?.prompts.map(p => p.prompt),
      photos: profile?.photos.map(p => p.galleryPhoto),
      defaultPhotos: profile?.defaultPhotos.map(p => p.defaultPhoto),
    }));
  }

  async createProfile(body: TProfileCreate): Promise<TProfile> {
    const {
      audiencesIds = [],
      productsIds = [],
      ideasIds = [],
      promptsIds = [],
      photosIds = [],
      defaultPhotosIds = [],
      ...profileData
    } = body;

    const profile: any = await this.prisma.businessProfile.create({
      data: {
        ...profileData,
        audiences: {
          createMany: {
            data: audiencesIds.map(targetAudienceId => ({
              targetAudienceId,
            })),
          },
        },
        products: {
          createMany: {
            data: productsIds.map(productId => ({
              productId,
            })),
          },
        },
        ideas: {
          createMany: {
            data: ideasIds.map(ideaId => ({
              ideaId,
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
        defaultPhotos: {
          createMany: {
            data: defaultPhotosIds.map(defaultPhotoId => ({
              defaultPhotoId,
            })),
          },
        }
      }
    });

    return profile;
  }

  async updateProfile(id: string, body: TProfileUpdate) {
    if (!id) throw new NotFoundException('Product ID is required');

    try {
      const {
        audiencesIds = [],
        productsIds = [],
        ideasIds = [],
        promptsIds = [],
        photosIds = [],
        defaultPhotosIds = [],
        ...profileData
      } = body;

      return await this.prisma.businessProfile.update({
        where: { id },
        data: {
          ...profileData,
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

          products: productsIds
            ? {
              deleteMany: {},
              createMany: {
                data: productsIds.map(productId => ({productId})),
              },
            }
            : undefined,

          ideas: ideasIds
            ? {
              deleteMany: {},
              createMany: {
                data: ideasIds.map(ideaId => ({ideaId})),
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

          defaultPhotos: defaultPhotosIds
            ? {
              deleteMany: {},
              createMany: {
                data: defaultPhotosIds.map(defaultPhotoId => ({defaultPhotoId})),
              },
            }
            : undefined,
        },

        include: {
          products: true,
          audiences: true,
          prompts: true,
          photos: true,
          defaultPhotos: true,
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
        audiences: { include: { targetAudience: true } },
        products: { include: { product: true } },
        ideas: {
          include: {
            idea: {
              include: {
                competitorPost: true,
              },
            },
          },
        },
        prompts: { include: { prompt: true } },
        photos: { include: { galleryPhoto: true } },
        defaultPhotos: { include: { defaultPhoto: true } },
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
        audiences: profile.audiences.map(a => a.targetAudience),
        products: profile?.products.map(p => p.product),
        ideas: profile.ideas.map(p => ({
          ...p.idea,
          competitorText: p.idea.competitorPost?.text ?? null,
        })),
        prompts: profile.prompts.map(p => p.prompt),
        photos: profile?.photos.map(p => p.galleryPhoto),
        defaultPhotos: profile?.defaultPhotos.map(p => p.defaultPhoto),
      };
      const galleryPhotosUrls = [...mappedProfile.defaultPhotos, ...mappedProfile.photos].map((photo) => {
        return {
          type: photo.type,
          url: photo.url ? this.storageUrlService.getPublicUrl(photo.url) : "",
          description: photo.description ?? null,
        };
      });

      // Generate Posts
      if(profile.profileFocus === ProfileFocus.GeneratePosts) {
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
              imagePrompt: this.serializeImagePrompt(post.image_prompt),
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

      // Generate Stories
      if(profile.profileFocus === ProfileFocus.GenerateStories) {
        const stories: AiPost[] = await this.aiService.generateStoriesBasedOnBusinessProfile(mappedProfile, galleryPhotosUrls);

        const createdArtifacts: AIArtifactBase[] = [];

        for (const story of stories) {
          const artifact: AIArtifactBase = await this.prisma.aIArtifact.create({
            data: {
              businessId: profile.businessId,
              businessProfileId: profile.id,
              type: AIArtifactType.Story,
              outputJson: story,
              status: AIArtifactStatus.Draft,
              imageUrl: story.imageUrl,
              imagePrompt: story.image_prompt,
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