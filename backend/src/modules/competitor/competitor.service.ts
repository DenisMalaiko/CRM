import { Injectable, InternalServerErrorException, NotFoundException, HttpException, BadRequestException } from '@nestjs/common';
import {PrismaService} from '../../core/prisma/prisma.service';
import {FacebookService} from "../facebook/facebook.service";
import { TCompetitor, TCompetitorCreate, TCompetitorUpdate, TCompetitorPostParams, TCompetitorAdsParams } from "./entities/competitor.entity";
import { PlatformList } from "@prisma/client";

@Injectable()
export class CompetitorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly facebookService: FacebookService,
  ) {}

  async getCompetitors(businessId: string): Promise<TCompetitor[]> {
    return await this.prisma.competitor.findMany({
      where: { businessId: businessId },
    });
  }

  async getCompetitor(id: string): Promise<TCompetitor | null> {
    const competitor =  await this.prisma.competitor.findUnique({
      where: { id }
    });

    if (!competitor) return null;

    return competitor;
  }

  async createCompetitor(body: TCompetitorCreate): Promise<TCompetitor> {
    return await this.prisma.competitor.create({
      data: body
    });
  }

  async updateCompetitor(id: string, body: TCompetitorUpdate): Promise<TCompetitor> {
    if (!id) throw new NotFoundException('Competitor ID is required');

    try {
      return await this.prisma.competitor.update({
        where: {id},
        data: {
          name: body.name,
          facebookLink: body.facebookLink,
          isActive: body.isActive,
        }
      });
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Competitor with ID ${id} not found`);
      }

      throw new InternalServerErrorException('Failed to update competitor');
    }
  }

  async deleteCompetitor(id: string): Promise<TCompetitor> {
    try {
      return await this.prisma.competitor.delete({ where: { id } });
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Competitor with ID ${id} not found`);
      }
      throw err;
    }
  }


  // Posts
  async fetchPosts(id: string, body: TCompetitorPostParams): Promise<any> {
    const competitor = await this.prisma.competitor.findUnique({
      where: { id }
    });

    if (!competitor?.facebookLink) return null;

    const posts = await this.facebookService.fetchPosts(
      competitor.id,
      competitor.facebookLink,
      body
    );

    console.log("POSTS ", posts);

    if(!posts) return [];

    return await this.savePosts(id, posts);
  }

  async getPosts(id: string): Promise<any[]> {
    return await this.prisma.competitorPost.findMany({
      where: { competitorId: id },
    });
  }

  async savePosts(competitorId: string, posts: any[]) {
    return Promise.all(
      posts.map(post =>
        this.prisma.competitorPost.upsert({
          where: {
            externalId_platform_competitorId: {
              externalId: post.externalId,
              platform: PlatformList.Facebook,
              competitorId: competitorId,
            },
          },
          create: {
            externalId: post.externalId,
            platform: PlatformList.Facebook,
            competitorId,

            text: post.text,
            url: post.url,
            media: post.media,

            likes: post.likes,
            shares: post.shares,
            views: post.views,

            postedAt: post.postedAt,
          },
          update: {
            likes: post.likes,
            shares: post.shares,
            views: post.views,
            fetchedAt: new Date(),
            postedAt: post.postedAt,
            media: post.media,
          },
        })
      )
    );
  }


  // Ads
  async fetchAds(id: string, body: TCompetitorAdsParams): Promise<any> {
    try {
      const competitor = await this.prisma.competitor.findUnique({
        where: { id }
      });

      if (!competitor?.facebookLink) return null;

      const ads: any = await this.facebookService.fetchAds(
        competitor.id,
        competitor.facebookLink,
        body
      );

      console.log("--------------")
      console.log("ADS ", ads);
      console.log("--------------")

      if(!ads) return [];

      return await this.saveAds(id, ads);
    } catch (err: any) {
      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException(
        err?.message ?? 'Failed to fetch ads'
      );
    }
  }

  async getAds(id: string): Promise<any> {
    console.log("--------------")
    console.log("GET ADS ", id)

    return await this.prisma.competitorAds.findMany({
      where: { competitorId: id },
    });
  }

  async saveAds(competitorId: string, ads: any[]) {
    console.log("--------------")
    console.log("SAVING ADS ", ads);

    return Promise.all(
      ads.map(ad =>
        this.prisma.competitorAds.upsert({
          where: {
            externalId_platform_competitorId: {
              externalId: ad.externalId,
              platform: PlatformList.Facebook,
              competitorId,
            },
          },
          create: {
            externalId: ad.externalId,
            platform: PlatformList.Facebook,
            competitorId,

            title: ad.title,
            body: ad.body,
            caption: ad.caption,
            url: ad.url,
            format: ad.format,
            ctaText: ad.ctaText,
            ctaType: ad.ctaType,
            videos: ad.videos,
            images: ad.images,

            start: ad.start,
            end: ad.end,
            active_days: ad.active_days,
            isActive: ad.isActive,
          },
          update: {
            start: ad.start,
            end: ad.end,
            active_days: ad.active_days,
            fetchedAt: new Date(),
            isActive: ad.isActive,
          },
        })
      )
    );
  }
}