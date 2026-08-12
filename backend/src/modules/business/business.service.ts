import { Injectable, InternalServerErrorException, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from "../../core/prisma/prisma.service";
import { InstagramService } from "../instagram/instagram.service";
import { TBusiness, TBusinessCreate, TBusinessUpdate, TFacebookReport, TInstagramReport } from "./entities/business.entity";

@Injectable()
export class BusinessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly instagramService: InstagramService,
  ) {}

  async getBusinesses(agencyId: string): Promise<TBusiness[]> {
    return await this.prisma.business.findMany({
      where: { agencyId: agencyId },
      select: {
        id: true,
        agencyId: true,
        name: true,
        website: true,
        facebookLink: true,
        instagramLink: true,
        industry: true,
        status: true,
        language: true,
        country: true,
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
          facebookLink: true,
          instagramLink: true,
          industry: true,
          status: true,
          language: true,
          country: true,
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
          facebookLink: true,
          instagramLink: true,
          industry: true,
          status: true,
          language: true,
          country: true,
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
          facebookLink: true,
          instagramLink: true,
          industry: true,
          status: true,
          language: true,
          country: true,
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

  async getFacebookReport(businessId: string): Promise<TFacebookReport | null> {
    return await this.prisma.facebookReport.findUnique({
      where: { businessId },
    });
  }

  async upsertFacebookReport(businessId: string, data: { followers: number; posts: number }): Promise<TFacebookReport> {
    return await this.prisma.facebookReport.upsert({
      where: { businessId },
      update: { ...data, fetchedAt: new Date() },
      create: { businessId, ...data },
    });
  }

  async getInstagramReport(businessId: string): Promise<TInstagramReport | null> {
    return await this.prisma.instagramReport.findUnique({
      where: { businessId },
    });
  }

  async fetchInstagramReport(businessId: string): Promise<TInstagramReport> {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { instagramLink: true },
    });

    if (!business?.instagramLink) {
      throw new BadRequestException('Business has no Instagram link configured');
    }

    const [details, contentCounts, reelsCount] = await Promise.all([
      this.instagramService.fetchDetails(business.instagramLink),
      this.instagramService.fetchContentTypeCounts(business.instagramLink),
      this.instagramService.fetchReelsCount(business.instagramLink),
    ]);

    return this.upsertInstagramReport(businessId, { ...details, ...contentCounts, reels: reelsCount });
  }

  async upsertInstagramReport(
    businessId: string,
    data: { followers: number; posts: number; postsImageCount?: number; postsVideoCount?: number; postsCarouselCount?: number; reels?: number },
  ): Promise<TInstagramReport> {
    return await this.prisma.instagramReport.upsert({
      where: { businessId },
      update: { ...data, fetchedAt: new Date() },
      create: { businessId, ...data },
    });
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
