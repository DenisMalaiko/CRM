import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import { Business } from "./entities/business.entity";
import { BusinessResponse } from "./entities/business.entity";
import { BusinessIndustryToPrisma } from "../enums/BusinessIndustry";
import { TiersToPrisma } from "../enums/Tiers";

@Injectable()
export class BusinessService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createBusiness(body: Business) {
    const business: BusinessResponse = await this.prisma.business.create({
      data: {
        name: body.name,
        industry: BusinessIndustryToPrisma[body.industry],
        tier: TiersToPrisma[body.tier]
      }
    });

    return {
      statusCode: 200,
      message: "Business has been created!",
      data: business,
    };
  }

  async getBusinessList() {
    const businessList: BusinessResponse[] = await this.prisma.business.findMany();

    return {
      statusCode: 200,
      message: "Business list has been got!",
      data: businessList,
    };
  }

  async getBusiness(id: string) {
    const business = await this.prisma.business.findUnique({
      where: { id },
    });

    return {
      statusCode: 200,
      message: "Business has been got!",
      data: business,
    };
  }

  async getUsersByBusinessId(id: string) {
    const users = await this.prisma.user.findMany({
      where: { businessId: id },
      select: { id: true, email: true, name: true }
    });

    return {
      statusCode: 200,
      message: "Users has been got!",
      data: users,
    };
  }
}