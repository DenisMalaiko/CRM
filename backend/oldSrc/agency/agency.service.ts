import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import { Agency, AgencyResponse } from "./entities/agency.entity";
import { TiersToPrisma } from "../enums/Tiers";

@Injectable()
export class AgencyService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createAgency(body: Agency) {
    const agency: AgencyResponse = await this.prisma.agency.create({
      data: {
        name: body.name,
        tier: TiersToPrisma[body.tier]
      }
    });

    return {
      statusCode: 200,
      message: "Agency has been created!",
      data: agency,
    };
  }

  async getAgencyList() {
    const agencyList: AgencyResponse[] = await this.prisma.agency.findMany();

    return {
      statusCode: 200,
      message: "Agency list has been got!",
      data: agencyList,
    };
  }

  async getAgency(id: string) {
    const agency = await this.prisma.agency.findUnique({
      where: { id },
    });

    return {
      statusCode: 200,
      message: "Agency has been got!",
      data: agency,
    };
  }

  async getUsersByAgencyId(id: string) {
    const users = await this.prisma.user.findMany({
      where: { agencyId: id },
      select: { id: true, email: true, name: true }
    });

    return {
      statusCode: 200,
      message: "Users has been got!",
      data: users,
    };
  }
}