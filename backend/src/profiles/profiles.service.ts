import { ConflictException, Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IngestionService } from '../ingestion/ingestion.service';
import { TProfile, TProfileCreate } from "./entities/profile.entity";

@Injectable()
export class ProfilesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly ingestionService: IngestionService
  ) {}

  async getProfiles(businessId: string): Promise<ApiResponse<TProfile[]>> {
    const profiles = await this.prisma.businessProfile.findMany({
      where: { businessId: businessId },
      include: {
        products: { include: { product: true } },
        audiences: { include: { targetAudience: true } },
        platforms: { include: { platform: true } },
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
      platforms: profile.platforms.map(p => p.platform),
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
      platformsIds,
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
        platforms: {
          createMany: {
            data: platformsIds.map(platformId => ({
              platformId,
              priority: 0
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
      const updated = await this.prisma.businessProfile.update({
        where: {id},
        data: {
          name: body.name,
          isActive: body.isActive,
        }
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
        platforms: { include: { platform: true } },
        business: true
      },
    });

    if(profile) {
      const mappedProfiles: TProfile = {
        id: profile.id,
        businessId: profile.businessId,
        name: profile.name,
        profileFocus: profile.profileFocus,
        isActive: profile.isActive,
        createdAt: profile.createdAt,
        business: profile?.business,
        products: profile.products.map(p => p.product),
        audiences: profile.audiences.map(a => a.targetAudience),
        platforms: profile.platforms.map(p => p.platform),
      };

      this.ingestionService.ingestProfile(mappedProfiles);
    }
  }
}