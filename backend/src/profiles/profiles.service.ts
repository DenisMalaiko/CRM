import {ConflictException, Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {TProfile, TProfileCreate} from "./entities/profile.entity";

@Injectable()
export class ProfilesService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getProfiles(businessId: string): Promise<ApiResponse<TProfile[]>> {
    const profiles: TProfile[] = await this.prisma.businessProfile.findMany({
      where: { businessId: businessId },
    });

    return {
      statusCode: 200,
      message: "Profiles has been got!",
      data: profiles,
    };
  }

  async createProfile(body: TProfileCreate) {
    /*const profile: any = await this.prisma.businessProfile.create({
      data: body
    });*/

    console.log("------")
    console.log("CREATE PROFILE: ")
    console.log(body)
    console.log("------")

    return {
      statusCode: 200,
      message: "Profile has been created!",
      data: [],
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
}