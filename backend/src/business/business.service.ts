import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import { Business } from "./entities/business.entity";
import { BusinessResponse } from "./entities/business.entity";
import { BusinessIndustryToPrisma } from "../enums/BusinessIndustry";

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
        tier: body.tier
      }
    });

    return {
      statusCode: 200,
      message: "Business has been created!",
      data: business,
    };
  }

  async getBusinessList() {
    const businessList = await this.prisma.business.findMany();

    return {
      statusCode: 200,
      message: "Business list has been got!",
      data: businessList,
    };
  }
}