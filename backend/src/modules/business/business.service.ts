import { Injectable, InternalServerErrorException, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from "../../core/prisma/prisma.service";
import { TBusiness, TBusinessCreate, TBusinessUpdate } from "./entities/business.entity";

@Injectable()
export class BusinessService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getBusinesses(agencyId: string): Promise<TBusiness[]> {
    return await this.prisma.business.findMany({
      where: { agencyId: agencyId },
      select: {
        id: true,
        agencyId: true,
        name: true,
        website: true,
        industry: true,
        status: true,
        brand: true,
        advantages: true,
        goals: true
      }
    });
  }

  async getBusiness(id: string) {
    try {
      return await this.prisma.business.findUnique({
        where: { id },
        select: {
          id: true,
          agencyId: true,
          name: true,
          website: true,
          industry: true,
          status: true,
          brand: true,
          advantages: true,
          goals: true
        }
      });
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Business with ID ${id} not found`);
      }

      throw new InternalServerErrorException('Failed to get business');
    }
  }

  async createBusiness(body: TBusinessCreate): Promise<TBusiness> {
    try {
      const existingBusiness = await this.prisma.business.findFirst({
        where: {
          agencyId: body.agencyId,
          name: body.name,
          website: body.website,
        },
        select: { id: true },
      });

      if (existingBusiness) {
        throw new ConflictException('Business already exists!');
      }

      return await this.prisma.business.create({
        data: body,
        select: {
          id: true,
          agencyId: true,
          name: true,
          website: true,
          industry: true,
          status: true,
          brand: true,
          advantages: true,
          goals: true
        },
      });
    } catch (err: any) {
      throw new InternalServerErrorException('Failed to create business');
    }
  }

  async updateBusiness(id: string, body: TBusinessUpdate): Promise<TBusiness> {
    if (!id) throw new NotFoundException('Business ID is required');

    try {
      return await this.prisma.business.update({
        where: { id },
        data: body,
        select: {
          id: true,
          agencyId: true,
          name: true,
          website: true,
          industry: true,
          status: true,
          brand: true,
          advantages: true,
          goals: true
        },
      });
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Business with ID ${id} not found`);
      }

      throw new InternalServerErrorException('Failed to update business');
    }
  }

  async deleteBusiness(id: string) {
    try {
      return await this.prisma.business.delete({ where: { id } });
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Business with ID ${id} not found`);
      }
      throw err;
    }
  }
}