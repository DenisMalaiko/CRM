import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  HttpException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { FacebookService } from '../facebook/facebook.service';
import { InstagramService } from '../instagram/instagram.service';
import { CompetitorMediaService } from './competitor-media.service';
import {
  TCompetitor,
  TCompetitorCreate,
  TCompetitorUpdate,
  TCompetitorPostParams,
  TCompetitorAdsParams,
} from './entities/competitor.entity';
import { PlatformList } from '@prisma/client';

@Injectable()
export class CompetitorService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly facebookService: FacebookService,
    private readonly instagramService: InstagramService,
    private readonly competitorMediaService: CompetitorMediaService,
  ) {}

  async getCompetitors(businessId: string) {
    return await this.prisma.competitor.findMany({
      where: { businessId: businessId },
      include: { instagramReport: true, facebookReport: true },
    });
  }

  async getCompetitor(id: string): Promise<TCompetitor | null> {
    const competitor = await this.prisma.competitor.findUnique({
      where: { id },
    });

    if (!competitor) return null;

    return competitor;
  }

  async createCompetitor(body: TCompetitorCreate): Promise<TCompetitor> {
    return await this.prisma.competitor.create({
      data: body,
    });
  }

  async updateCompetitor(
    id: string,
    body: TCompetitorUpdate,
  ): Promise<TCompetitor> {
    if (!id) throw new NotFoundException('Competitor ID is required');

    try {
      return await this.prisma.competitor.update({
        where: { id },
        data: {
          name: body.name,
          facebookLink: body.facebookLink,
          instagramLink: body.instagramLink,
          isActive: body.isActive,
        },
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
      await this.deleteCompetitorMedia(id);
      return await this.prisma.competitor.delete({ where: { id } });
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Competitor with ID ${id} not found`);
      }
      throw err;
    }
  }

  private async deleteCompetitorMedia(competitorId: string): Promise<void> {
    const [posts, reels, ads] = await Promise.all([
      this.prisma.competitorPost.findMany({
        where: { competitorId },
        select: { media: true },
      }),
      this.prisma.competitorReel.findMany({
        where: { competitorId },
        select: { media: true },
      }),
      this.prisma.competitorAds.findMany({
        where: { competitorId },
        select: { videos: true, images: true },
      }),
    ]);

    const s3Keys: string[] = [];

    for (const post of posts) {
      if (!Array.isArray(post.media)) continue;

      for (const item of post.media as any[]) {
        if (item.thumbnail) {
          const key = this.competitorMediaService.extractS3Key(item.thumbnail);
          if (key) s3Keys.push(key);
        }
        if (item.url) {
          const key = this.competitorMediaService.extractS3Key(item.url);
          if (key) s3Keys.push(key);
        }
      }
    }

    for (const reel of reels) {
      if (!Array.isArray(reel.media)) continue;

      for (const item of reel.media as any[]) {
        if (item.thumbnail) {
          const key = this.competitorMediaService.extractS3Key(item.thumbnail);
          if (key) s3Keys.push(key);
        }
        if (item.url) {
          const key = this.competitorMediaService.extractS3Key(item.url);
          if (key) s3Keys.push(key);
        }
      }
    }

    for (const ad of ads) {
      for (const mediaArray of [ad.videos, ad.images]) {
        if (!Array.isArray(mediaArray)) continue;

        for (const item of mediaArray as any[]) {
          if (item.thumbnail) {
            const key = this.competitorMediaService.extractS3Key(
              item.thumbnail,
            );
            if (key) s3Keys.push(key);
          }
          if (item.url) {
            const key = this.competitorMediaService.extractS3Key(item.url);
            if (key) s3Keys.push(key);
          }
        }
      }
    }

    await Promise.allSettled(
      s3Keys.map((key) => this.competitorMediaService.deleteMedia(key)),
    );
  }

  // Instagram Report
  async fetchCompetitorInstagramReport(id: string) {
    const competitor = await this.prisma.competitor.findUnique({
      where: { id },
    });

    if (!competitor?.instagramLink) {
      throw new BadRequestException('Competitor has no Instagram link configured');
    }

    const [details, reelsCount, storiesCounts] = await Promise.all([
      this.instagramService.fetchDetails(competitor.instagramLink),
      this.instagramService.fetchReelsCount(competitor.instagramLink),
      this.instagramService.fetchStoriesTypeCounts(competitor.instagramLink),
    ]);

    return this.prisma.competitorInstagramReport.upsert({
      where: { competitorId: id },
      update: {
        followers: details.followers,
        posts: details.posts,
        reels: reelsCount,
        stories: storiesCounts.stories,
        fetchedAt: new Date(),
      },
      create: {
        competitorId: id,
        followers: details.followers,
        posts: details.posts,
        reels: reelsCount,
        stories: storiesCounts.stories,
      },
    });
  }

  // Facebook Report
  async fetchCompetitorFacebookReport(id: string) {
    console.log('[FB-BE] fetchCompetitorFacebookReport called with id:', id);
    const competitor = await this.prisma.competitor.findUnique({
      where: { id },
    });
    console.log('[FB-BE] competitor found:', competitor?.name, 'facebookLink:', competitor?.facebookLink);

    if (!competitor?.facebookLink) {
      throw new BadRequestException('Competitor has no Facebook link configured');
    }

    const [details, postsData, adsData] = await Promise.all([
      this.facebookService.fetchDetails(competitor.facebookLink).catch(() => ({ followers: 0, likes: 0 })),
      this.facebookService.fetchPostsData(competitor.facebookLink).catch(() => ({ posts: 0, postsImageCount: 0, postsVideoCount: 0, postsCarouselCount: 0 })),
      this.facebookService.fetchAdsData(competitor.facebookLink).catch(() => ({ activeAds: 0, adsVideoCount: 0, adsImageCount: 0, adsCarouselCount: 0, adsCtaWebsite: 0, adsCtaDirectMessage: 0, adsCtaInstagramPage: 0, adsCtaProduct: 0, adsCtaMetaPage: 0 })),
    ]);
    console.log('[FB-BE] fetched data:', { followers: details.followers, posts: postsData.posts, ads: adsData.activeAds });

    return this.prisma.competitorFacebookReport.upsert({
      where: { competitorId: id },
      update: {
        followers: details.followers,
        posts: postsData.posts,
        ads: adsData.activeAds,
        fetchedAt: new Date(),
      },
      create: {
        competitorId: id,
        followers: details.followers,
        posts: postsData.posts,
        ads: adsData.activeAds,
      },
    });
  }

  // Posts
  async fetchPosts(id: string, body: TCompetitorPostParams): Promise<any> {
    const competitor = await this.prisma.competitor.findUnique({
      where: { id },
    });

    if (!competitor?.facebookLink) return null;

    const posts = await this.facebookService.fetchPosts(
      competitor.id,
      competitor.facebookLink,
      body,
    );

    if (!posts) return [];

    return await this.savePosts(id, posts);
  }

  async getPosts(id: string): Promise<any[]> {
    return await this.prisma.competitorPost.findMany({
      where: { competitorId: id, platform: PlatformList.Facebook },
    });
  }

  async savePosts(competitorId: string, posts: any[]) {
    return Promise.all(
      posts.map(async (post) => {
        const existing = await this.prisma.competitorPost.findUnique({
          where: {
            externalId_platform_competitorId: {
              externalId: post.externalId,
              platform: PlatformList.Facebook,
              competitorId,
            },
          },
          select: { media: true },
        });

        const media = existing?.media
          ? existing.media
          : await this.competitorMediaService.processMedia(
              competitorId,
              post.media,
            );

        return this.prisma.competitorPost.upsert({
          where: {
            externalId_platform_competitorId: {
              externalId: post.externalId,
              platform: PlatformList.Facebook,
              competitorId,
            },
          },
          create: {
            externalId: post.externalId,
            platform: PlatformList.Facebook,
            competitorId,

            text: post.text,
            url: post.url,
            media,

            likes: post.likes,
            shares: post.shares,
            views: post.views,
            comments: post.comments,

            postedAt: post.postedAt,
          },
          update: {
            likes: post.likes,
            shares: post.shares,
            views: post.views,
            comments: post.comments,

            fetchedAt: new Date(),
            postedAt: post.postedAt,
          },
        });
      }),
    );
  }

  // Instagram Posts
  async fetchInstagramPosts(
    id: string,
    body: TCompetitorPostParams,
  ): Promise<any> {
    const competitor = await this.prisma.competitor.findUnique({
      where: { id },
    });

    if (!competitor?.instagramLink) return null;

    const posts = await this.instagramService.fetchPosts(
      competitor.id,
      competitor.instagramLink,
      body,
    );

    if (!posts) return [];

    return await this.saveInstagramPosts(id, posts);
  }

  async getInstagramPosts(id: string): Promise<any[]> {
    return await this.prisma.competitorPost.findMany({
      where: { competitorId: id, platform: PlatformList.Instagram },
    });
  }

  async saveInstagramPosts(competitorId: string, posts: any[]) {
    return Promise.all(
      posts.map(async (post) => {
        const existing = await this.prisma.competitorPost.findUnique({
          where: {
            externalId_platform_competitorId: {
              externalId: post.externalId,
              platform: PlatformList.Instagram,
              competitorId,
            },
          },
          select: { media: true },
        });

        const media = existing?.media
          ? existing.media
          : await this.competitorMediaService.processMedia(
              competitorId,
              post.media,
            );

        console.log('-------------');
        console.log('Media ', media);
        console.log('-------------');

        return this.prisma.competitorPost.upsert({
          where: {
            externalId_platform_competitorId: {
              externalId: post.externalId,
              platform: PlatformList.Instagram,
              competitorId,
            },
          },
          create: {
            externalId: post.externalId,
            platform: PlatformList.Instagram,
            competitorId,

            text: post.text,
            url: post.url,
            media,

            likes: post.likes,
            shares: post.shares,
            views: post.views,
            comments: post.comments,

            postedAt: post.postedAt,
          },
          update: {
            likes: post.likes,
            shares: post.shares,
            views: post.views,
            comments: post.comments,

            fetchedAt: new Date(),
            postedAt: post.postedAt,
          },
        });
      }),
    );
  }

  // Instagram Reels
  async fetchInstagramReels(
    id: string,
    body: TCompetitorPostParams,
  ): Promise<any> {
    const competitor = await this.prisma.competitor.findUnique({
      where: { id },
    });

    if (!competitor?.instagramLink) return null;

    const reels = await this.instagramService.fetchReels(
      competitor.id,
      competitor.instagramLink,
      body,
    );

    if (!reels) return [];

    return await this.saveInstagramReels(id, reels);
  }

  async getInstagramReels(id: string): Promise<any[]> {
    return await this.prisma.competitorReel.findMany({
      where: { competitorId: id, platform: PlatformList.Instagram },
    });
  }

  async saveInstagramReels(competitorId: string, reels: any[]) {
    return Promise.all(
      reels.map(async (reel) => {
        const existing = await this.prisma.competitorReel.findUnique({
          where: {
            externalId_platform_competitorId: {
              externalId: reel.externalId,
              platform: PlatformList.Instagram,
              competitorId,
            },
          },
          select: { media: true },
        });

        const media = existing?.media
          ? existing.media
          : await this.competitorMediaService.processMedia(
              competitorId,
              reel.media,
            );

        return this.prisma.competitorReel.upsert({
          where: {
            externalId_platform_competitorId: {
              externalId: reel.externalId,
              platform: PlatformList.Instagram,
              competitorId,
            },
          },
          create: {
            externalId: reel.externalId,
            platform: PlatformList.Instagram,
            competitorId,

            text: reel.text,
            url: reel.url,
            media,

            likes: reel.likes,
            shares: reel.shares,
            views: reel.views,
            plays: reel.plays,
            comments: reel.comments,

            postedAt: reel.postedAt,
          },
          update: {
            likes: reel.likes,
            shares: reel.shares,
            views: reel.views,
            plays: reel.plays,
            comments: reel.comments,

            fetchedAt: new Date(),
            postedAt: reel.postedAt,
          },
        });
      }),
    );
  }

  // Ads
  async fetchAds(id: string, body: TCompetitorAdsParams): Promise<any> {
    try {
      const competitor = await this.prisma.competitor.findUnique({
        where: { id },
      });

      if (!competitor?.facebookLink) return null;

      const ads: any = await this.facebookService.fetchAds(
        competitor.id,
        competitor.facebookLink,
        body,
      );

      if (!ads) return [];

      return await this.saveAds(id, ads);
    } catch (err: any) {
      if (err instanceof HttpException) {
        throw err;
      }

      throw new InternalServerErrorException(
        err?.message ?? 'Failed to fetch ads',
      );
    }
  }

  async getAds(id: string): Promise<any> {
    return await this.prisma.competitorAds.findMany({
      where: { competitorId: id },
    });
  }

  async saveAds(competitorId: string, ads: any[]) {
    return Promise.all(
      ads.map((ad) =>
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
            title: ad.title,
            body: ad.body,
            videos: ad.videos,
            images: ad.images,

            start: ad.start,
            end: ad.end,
            active_days: ad.active_days,
            fetchedAt: new Date(),
            isActive: ad.isActive,
          },
        }),
      ),
    );
  }
}
