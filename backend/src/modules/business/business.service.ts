import { Injectable, InternalServerErrorException, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from "../../core/prisma/prisma.service";
import { InstagramService } from "../instagram/instagram.service";
import { FacebookService } from "../facebook/facebook.service";
import { TBusiness, TBusinessCreate, TBusinessUpdate, TFacebookReport, TInstagramReport } from "./entities/business.entity";

@Injectable()
export class BusinessService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly instagramService: InstagramService,
    private readonly facebookService: FacebookService,
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
        goals: true,
        createdAt: true
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
          goals: true,
          createdAt: true
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
          goals: true,
          createdAt: true
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
          goals: true,
          createdAt: true
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

  async upsertFacebookReport(
    businessId: string,
    data: { followers: number; posts: number; likes?: number; postsImageCount?: number; postsVideoCount?: number; postsCarouselCount?: number; activeAds?: number; activeAds30d?: number; adsVideoCount?: number; adsImageCount?: number; adsCarouselCount?: number; adsDcoCount?: number; adsCtaWebsite?: number; adsCtaDirectMessage?: number; adsCtaInstagramPage?: number; adsCtaProduct?: number; adsCtaMetaPage?: number; topPosts?: any; topPostTexts?: any; topAds?: any; topAdTexts?: any },
  ): Promise<TFacebookReport> {
    return await this.prisma.facebookReport.upsert({
      where: { businessId },
      update: { ...data, fetchedAt: new Date() },
      create: { businessId, ...data },
    });
  }

  async fetchFacebookReport(businessId: string): Promise<TFacebookReport> {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: { facebookLink: true },
    });

    if (!business?.facebookLink) {
      throw new BadRequestException('Business has no Facebook link configured');
    }

    const [details, postsData, adsData] = await Promise.all([
      this.facebookService.fetchDetails(business.facebookLink)
        .catch(() => ({ followers: 0, likes: 0, pageAdLibraryId: null })),
      this.facebookService.fetchPostsData(business.facebookLink)
        .catch(() => ({
          posts: 0,
          postsImageCount: 0,
          postsVideoCount: 0,
          postsCarouselCount: 0,
          topPosts: [],
          topPostTexts: [],
        })),
      this.facebookService.fetchAdsData(business.facebookLink)
        .catch(() => ({
          activeAds: 0,
          activeAds30d: 0,
          adsVideoCount: 0,
          adsImageCount: 0,
          adsCarouselCount: 0,
          adsDcoCount: 0,
          adsCtaWebsite: 0,
          adsCtaDirectMessage: 0,
          adsCtaInstagramPage: 0,
          adsCtaProduct: 0,
          adsCtaMetaPage: 0,
          topAdTexts: [],
          topAds: [],
        })),
    ]);

    const { pageAdLibraryId: _pageAdLibraryId, ...detailsData } = details;
    return this.upsertFacebookReport(businessId, { ...detailsData, ...postsData, ...adsData });
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

    const [details, contentCounts, reelsCount, storiesCounts] = await Promise.all([
      this.instagramService.fetchDetails(business.instagramLink),
      this.instagramService.fetchContentTypeCounts(business.instagramLink),
      this.instagramService.fetchReelsCount(business.instagramLink),
      this.instagramService.fetchStoriesTypeCounts(business.instagramLink),
    ]);

    return this.upsertInstagramReport(businessId, { ...details, ...contentCounts, reels: reelsCount, ...storiesCounts });
  }

  async upsertInstagramReport(
    businessId: string,
    data: { followers: number; posts: number; postsImageCount?: number; postsVideoCount?: number; postsCarouselCount?: number; reels?: number; stories?: number; storiesImageCount?: number; storiesVideoCount?: number },
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
