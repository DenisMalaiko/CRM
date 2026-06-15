import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { ApifyService } from '../apify/apify.service';
import { type TiktokVideo, Tag, TagSource, TagType } from '@prisma/client';

type TikTokAdsSettings = {
  adsApprovedForBusinessUse: boolean;
  adsCountryCode: string;
  adsCreatorsCountryCode: string;
  adsNewOnBoard: boolean;
  adsRankType: 'popular' | 'last';
  adsScrapeCreators: boolean;
  adsScrapeHashtags: boolean;
  adsScrapeSounds: boolean;
  adsScrapeVideos: boolean;
  adsSortCreatorsBy: 'follower' | string;
  adsSortVideosBy: 'vv' | string;
  adsSoundsCountryCode: string;
  adsTimeRange: string;
  adsVideosCountryCode: string;
  resultsPerPage: number;
  adsHashtagIndustry?: string;
};

type TikTokScraperSettings = {
  commentsPerPost: number;
  excludePinnedPosts: boolean;
  hashtags: string[];
  maxFollowersPerProfile: number;
  maxFollowingPerProfile: number;
  maxProfilesPerQuery: number;
  maxRepliesPerComment: number;
  profileSorting: 'latest' | 'popular';
  proxyCountryCode: string;
  resultsPerPage: number;
  scrapeRelatedVideos: boolean;
  searchQueries: string[];
  searchSection: '/video' | '/user' | '/tag';
  shouldDownloadAvatars: boolean;
  shouldDownloadCovers: boolean;
  shouldDownloadMusicCovers: boolean;
  shouldDownloadSlideshowImages: boolean;
  shouldDownloadVideos: boolean;
  videoSearchDateFilter:
    | 'ALL_TIME'
    | 'PAST_24_HOURS'
    | 'THIS_WEEK'
    | 'THIS_MONTH'
    | 'LAST_3_MONTHS'
    | 'LAST_6_MONTHS';
  videoSearchSorting: 'RELEVANCE' | 'LATEST' | 'MOST_LIKED';
};

type TikTokHashtag = {
  name: string;
  countryCode: string;
  industry: string;
  rank: number;
  url: string;
};

@Injectable()
export class TiktokService {
  private readonly logger = new Logger(TiktokService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly apify: ApifyService,
  ) {}

  // FETCH TIK TOK VIDEOS
  async fetchTikTokVideosByBusinessId(
    businessId: string,
  ): Promise<TiktokVideo[] | null> {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId },
      select: {
        id: true,
        name: true,
        industry: true,
        language: true,
        country: true,
      },
    });

    if (!business) return null;

    const tags: Tag[] | null = await this.fetchTikTokHashtags(business);
    console.log("----------------------");
    console.log("HASHTAGS: ", tags);
    console.log("----------------------");

    if (!tags || tags.length === 0) {
      this.logger.warn(`No hashtags fetched for business ${business.id}, country=${business.country}, industry=${business.industry}`);
      return [];
    }

    const hashtagValues = tags.map((tag) => tag.value);
    if (hashtagValues.length === 0) return [];

    const videos = await this.fetchTikTokVideos(business, hashtagValues);
    if (videos.length === 0) {
      this.logger.warn(`No videos fetched for business ${business.id} despite ${hashtagValues.length} hashtags`);
      return [];
    }

    return this._upsertVideos(videos, businessId);
  }


  // FETCH HASHTAGS
  private async fetchTikTokHashtags({ country, industry, }): Promise<Tag[] | null> {
    const hashtags = await this._fetchHashtags(country, industry);
    return Promise.all(hashtags.map((h: any) => this._upsertHashtag(h)));
  }

  private async _fetchHashtags(country: string, industry: string) {
    const settings: TikTokAdsSettings = {
      adsApprovedForBusinessUse: false,
      adsCountryCode: country,
      adsCreatorsCountryCode: 'US',
      adsNewOnBoard: false,
      adsRankType: 'popular',
      adsScrapeCreators: false,
      adsScrapeHashtags: true,
      adsScrapeSounds: false,
      adsScrapeVideos: false,
      adsSortCreatorsBy: 'follower',
      adsSortVideosBy: 'vv',
      adsSoundsCountryCode: country,
      adsTimeRange: '7',
      adsVideosCountryCode: 'US',
      resultsPerPage: 2,
    };

    if (industry) {
      settings.adsHashtagIndustry = industry;
    }

    const items: any = await this.apify.runActor(
      'clockworks~tiktok-trends-scraper',
      settings,
    );

    if (items.length === 0) {
      this.logger.warn(`TikTok trends scraper returned 0 hashtags for country=${country}, industry=${industry}`);
    } else {
      this.logger.log(`TikTok scraper returned ${items.length} hashtags`);
    }

    return items
      .filter((i: any) => !i.error)
      .map((i: any) => this._hashtagsMapper(i, industry));
  }

  private _hashtagsMapper(item: any, industry?: string) {
    return {
      name: item?.name,
      type: item?.type,
      url: item?.url,
      rank: item?.rank,
      countryCode: item?.countryCode,
      industry: industry ?? '',
    };
  }

  private async _upsertHashtag(h: TikTokHashtag): Promise<Tag> {
    const normalizedValue = h.name.toLowerCase();

    const tag: Tag = await this.prisma.tag.upsert({
      where: {
        type_normalizedValue: { type: TagType.Hashtag, normalizedValue },
      },
      create: {
        type: TagType.Hashtag,
        value: h.name,
        normalizedValue,
        source: TagSource.Trend,
        countries: h.countryCode ? [h.countryCode] : [],
        industries: h.industry ? [h.industry] : [],
        metrics: { rank: h.rank, url: h.url },
      },
      update: {
        metrics: { rank: h.rank, url: h.url },
      },
    });

    const needsUpdate =
      (h.countryCode && !tag.countries.includes(h.countryCode)) ||
      (h.industry && !tag.industries.includes(h.industry));

    if (!needsUpdate) return tag;

    return this.prisma.tag.update({
      where: { id: tag.id },
      data: {
        countries: {
          set: Array.from(
            new Set([...tag.countries, h.countryCode].filter(Boolean)),
          ),
        },
        industries: {
          set: Array.from(
            new Set([...tag.industries, h.industry].filter(Boolean)),
          ),
        },
      },
    });
  }



  // FETCH VIDEOS
  private async fetchTikTokVideos({ country }, hashtags: string[]): Promise<any[]> {
    const settings: TikTokScraperSettings = {
      commentsPerPost: 0,
      excludePinnedPosts: false,
      hashtags,
      maxFollowersPerProfile: 0,
      maxFollowingPerProfile: 0,
      maxProfilesPerQuery: 1,
      maxRepliesPerComment: 0,
      profileSorting: 'latest',
      proxyCountryCode: country,
      resultsPerPage: 1,
      scrapeRelatedVideos: false,
      searchQueries: hashtags,
      searchSection: '/video',
      shouldDownloadAvatars: true,
      shouldDownloadCovers: true,
      shouldDownloadMusicCovers: true,
      shouldDownloadSlideshowImages: true,
      shouldDownloadVideos: true,
      videoSearchDateFilter: 'PAST_24_HOURS',
      videoSearchSorting: 'LATEST',
    };

    const items = await this.apify.runActor<any>(
      'clockworks~tiktok-scraper',
      settings,
    );

    if (items.length === 0) {
      this.logger.warn(`TikTok scraper returned 0 videos for hashtags: [${hashtags.join(', ')}]`);
    } else {
      this.logger.log(`TikTok scraper returned ${items.length} videos`);
    }

    return items
      .filter((i) => !i?.error && i?.id)
      .map((i) => this._videosMapper(i));
  }

  private _videosMapper(item: any) {
    const hashtags: string[] = Array.isArray(item?.hashtags)
      ? item.hashtags
          .map((h: any) => h?.name)
          .filter(
            (n: unknown): n is string => typeof n === 'string' && n.length > 0,
          )
          .map((n: string) => n.toLowerCase().trim())
      : [];

    return {
      externalId: String(item.id),
      platform: 'Tiktok' as const,

      text: item?.text ?? null,
      textLanguage: item?.textLanguage ?? null,
      url: item?.webVideoUrl ?? '',
      coverUrl: item?.videoMeta?.coverUrl ?? null,

      authorExternalId: item?.authorMeta?.id ?? null,
      authorName: item?.authorMeta?.name ?? null,
      authorNickname: item?.authorMeta?.nickName ?? null,
      authorAvatarUrl: item?.authorMeta?.avatar ?? null,
      authorVerified: Boolean(item?.authorMeta?.verified),
      authorFollowers: this.toIntOrNull(item?.authorMeta?.fans),

      musicName: item?.musicMeta?.musicName ?? null,
      musicAuthor: item?.musicMeta?.musicAuthor ?? null,
      musicOriginal: Boolean(item?.musicMeta?.musicOriginal),

      durationSec: this.toIntOrNull(item?.videoMeta?.duration),

      playCount: this.toInt(item?.playCount),
      likeCount: this.toInt(item?.diggCount),
      commentCount: this.toInt(item?.commentCount),
      shareCount: this.toInt(item?.shareCount),
      collectCount: this.toInt(item?.collectCount),

      hashtags,

      isAd: Boolean(item?.isAd),
      isSponsored: Boolean(item?.isSponsored),
      isSlideshow: Boolean(item?.isSlideshow),

      searchQuery: item?.input ?? null, // actor сам кладе сюди хештег, по якому знайшов

      raw: item,

      publishedAt: item?.createTimeISO
        ? new Date(item.createTimeISO)
        : item?.createTime
          ? new Date(item.createTime * 1000)
          : new Date(),
    };
  }

  private async _upsertVideos(videos: ReturnType<typeof this._videosMapper>[], businessId: string): Promise<TiktokVideo[]> {
    return Promise.all(
      videos.map((v) =>
        this.prisma.tiktokVideo.upsert({
          where: {
            externalId_platform: {
              externalId: v.externalId,
              platform: v.platform,
            },
          },
          create: {
            ...v,
            businessId,
          },
          update: {
            playCount:    v.playCount,
            likeCount:    v.likeCount,
            commentCount: v.commentCount,
            shareCount:   v.shareCount,
            collectCount: v.collectCount,
            raw:          v.raw,
            fetchedAt:    new Date(),
          },
        }),
      ),
    );
  }


  // UTILS
  private toInt(v: unknown): number {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : 0;
  }

  private toIntOrNull(v: unknown): number | null {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : null;
  }
}
