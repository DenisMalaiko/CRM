import {Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import {PrismaService} from '../../core/prisma/prisma.service';
import {FacebookService} from "../facebook/facebook.service";
import {TCompetitor, TCompetitorCreate, TCompetitorUpdate, TCompetitorPostParams} from "./entities/competitor.entity";
import {PlatformList} from "@prisma/client";

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

  async generateReport(id: string): Promise<any> {
    const competitor = await this.prisma.competitor.findUnique({
      where: { id }
    });

    if (!competitor?.facebookLink) return null;

    const [posts] = await Promise.all([
      this.facebookService.fetchAds(competitor.facebookLink),
      //this.facebookService.fetchPosts(competitor.facebookLink),
    ]);

    //console.log("ADS ", ads);
    console.log("POSTS ", posts);

    return { posts };
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
            viewsCount: post.viewsCount,

            postedAt: post.postedAt,
          },
          update: {
            likes: post.likes,
            shares: post.shares,
            viewsCount: post.viewsCount,
            fetchedAt: new Date(),
            postedAt: post.postedAt,
          },
        })
      )
    );
  }



  // Ads
  async getAds(id: string): Promise<any> {
    const competitor = await this.prisma.competitor.findUnique({
      where: { id }
    });

    if (!competitor?.facebookLink) return null;

    const ads = await Promise.all([
      this.facebookService.fetchAds(competitor.facebookLink),
    ]);

    console.log("ADS ", ads);

    return ads;
  }
}