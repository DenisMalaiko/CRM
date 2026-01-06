import { Injectable } from '@nestjs/common';
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
    const profile: any = await this.prisma.businessProfile.create({
      data: body
    });

    return {
      statusCode: 200,
      message: "Profile has been created!",
      data: profile,
    }
  }
}