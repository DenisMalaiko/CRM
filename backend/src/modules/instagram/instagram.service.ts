import { Injectable } from '@nestjs/common';
import { ApifyService } from '../apify/apify.service';
import { PlatformList } from '@prisma/client';
import { TCompetitorPostParams } from '../competitor/entities/competitor.entity';

@Injectable()
export class InstagramService {
  constructor(private readonly apify: ApifyService) {}

  async fetchPosts(
    competitorId: string,
    pageUrl: string,
    body: TCompetitorPostParams,
  ) {
    const items = await this.apify.runActor<any>('apify~instagram-scraper', {
      addParentData: false,
      directUrls: [pageUrl],
      resultsLimit: 200,
      resultsType: 'posts',
      searchLimit: 10,
      searchType: 'hashtag',
      ...body,
    });

    return items
      .filter((i) => !i.error)
      .map((i) => this._postsMapper(competitorId, i));
  }

  async fetchDetails(pageUrl: string): Promise<{ followers: number; posts: number }> {
    const items = await this.apify.runActor<any>('apify~instagram-scraper', {
      addParentData: false,
      directUrls: [pageUrl],
      resultsLimit: 1,
      resultsType: 'details',
      searchLimit: 10,
      searchType: 'hashtag',
    });

    const profile = items?.find((i: any) => !i.error && i.followersCount != null);
    if (!profile) {
      throw new Error('Failed to fetch Instagram profile details');
    }

    return {
      followers: profile.followersCount ?? 0,
      posts: profile.postsCount ?? 0,
    };
  }

  async fetchReels(
    competitorId: string,
    pageUrl: string,
    body: TCompetitorPostParams,
  ) {
    const items = await this.apify.runActor<any>('apify~instagram-scraper', {
      addParentData: false,
      directUrls: [pageUrl],
      resultsLimit: 50,
      resultsType: 'reels',
      searchLimit: 10,
      searchType: 'hashtag',
      ...body,
    });

    return items
      .filter((i) => !i.error)
      .map((i) => this._reelsMapper(competitorId, i));
  }

  async fetchContentTypeCounts(pageUrl: string): Promise<{ postsImageCount: number; postsVideoCount: number; postsCarouselCount: number }> {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const items = await this.apify.runActor<any>('apify~instagram-scraper', {
      addParentData: false,
      directUrls: [pageUrl],
      resultsLimit: 200,
      resultsType: 'posts',
      searchLimit: 10,
      searchType: 'hashtag',
      onlyPostsNewerThan: threeMonthsAgo.toISOString().split('T')[0],
    });

    let postsImageCount = 0;
    let postsVideoCount = 0;
    let postsCarouselCount = 0;

    for (const item of items) {
      if (item.error) continue;
      switch (item.type) {
        case 'Video': postsVideoCount++; break;
        case 'Sidecar': postsCarouselCount++; break;
        default: postsImageCount++; break;
      }
    }

    return { postsImageCount, postsVideoCount, postsCarouselCount };
  }

  async fetchReelsCount(pageUrl: string): Promise<number> {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const items = await this.apify.runActor<any>('apify~instagram-scraper', {
      addParentData: false,
      directUrls: [pageUrl],
      resultsLimit: 200,
      resultsType: 'reels',
      searchLimit: 10,
      searchType: 'hashtag',
      onlyPostsNewerThan: threeMonthsAgo.toISOString().split('T')[0],
    });

    return items.filter((i: any) => !i.error).length;
  }

  async fetchStoriesCount(pageUrl: string): Promise<number> {
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const items = await this.apify.runActor<any>('apify~instagram-scraper', {
      addParentData: false,
      directUrls: [pageUrl],
      resultsLimit: 200,
      resultsType: 'stories',
      searchLimit: 10,
      searchType: 'hashtag',
      onlyPostsNewerThan: threeMonthsAgo.toISOString().split('T')[0],
    });

    return items.filter((i: any) => !i.error).length;
  }

  private _postsMapper(competitorId: string, item: any) {
    return {
      externalId: item?.id ?? item?.shortCode,
      platform: PlatformList.Instagram,
      competitorId,

      // content
      text: item?.caption ?? null,
      url: item?.url ?? null,
      media: this._media(item) ?? [],

      // metrics
      likes: item?.likesCount ?? null,
      shares: null,
      views: null,
      comments: item?.commentsCount ?? null,

      // meta
      postedAt: item?.timestamp ? new Date(item.timestamp) : null,
    };
  }

  private _reelsMapper(competitorId: string, item: any) {
    const likesCount =
      item?.likesCount != null && item.likesCount >= 0 ? item.likesCount : null;

    return {
      externalId: item?.id ?? item?.shortCode,
      platform: PlatformList.Instagram,
      competitorId,

      text: item?.caption ?? null,
      url: item?.url ?? null,
      media: this._media(item) ?? [],

      likes: likesCount,
      shares: null,
      views: item?.videoViewCount ?? null,
      plays: item?.videoPlayCount ?? null,
      comments: item?.commentsCount ?? null,

      postedAt: item?.timestamp ? new Date(item.timestamp) : null,
    };
  }

  private _media(item: any) {
    if (item?.videoUrl) {
      return [
        {
          thumbnail: item?.displayUrl,
          url: item?.videoUrl,
        },
      ];
    }

    if (item?.displayUrl) {
      return [
        {
          thumbnail: item?.displayUrl,
          url: null,
        },
      ];
    }

    if (Array.isArray(item?.images)) {
      return item.images
        .filter((x: any) => x)
        .map((x: any) => ({
          thumbnail: x,
          url: null,
        }));
    }

    return [];
  }
}
