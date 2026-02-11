import { Injectable } from '@nestjs/common';
import { PrismaService } from "../../core/prisma/prisma.service";
import { TAgency, TAgencyCreate, TAgencyUpdate } from "./entities/agency.entity";

@Injectable()
export class AgencyService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createAgency(body: TAgencyCreate): Promise<TAgency> {
    return await this.prisma.agency.create({
      data: {
        name: body.name,
        plan: body.plan
      }
    });
  }

  async getAgencyList() {
    return await this.prisma.agency.findMany();
  }

  async getAgency(id: string) {
    return await this.prisma.agency.findUnique({
      where: { id },
    });
  }

  async getUsersByAgencyId(id: string) {
     return await this.prisma.user.findMany({
      where: { agencyId: id },
      select: { id: true, email: true, name: true, role: true, status: true }
    });
  }
}