import { Injectable, Logger } from '@nestjs/common';
import { ApifyService  } from '../apify/apify.service';

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
  videoSearchDateFilter: 'ALL_TIME' | 'PAST_24_HOURS' | 'THIS_WEEK' | 'THIS_MONTH' | 'LAST_3_MONTHS' | 'LAST_6_MONTHS';
  videoSearchSorting: 'RELEVANCE' | 'LATEST' | 'MOST_LIKED';
};

@Injectable()
export class TiktokService {
  private readonly logger = new Logger(TiktokService.name);

  constructor(private readonly apify: ApifyService) {}

  async fetchHashtags(id: string, country, industry ) {
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
      resultsPerPage: 10,
    };

    if (industry) {
      settings.adsHashtagIndustry = industry;
    }

    const items: any = await this.apify.runActor(
      'clockworks~tiktok-trends-scraper',
      settings
    );

    return items
      .filter((i: any) => !i.error)
      .map((i: any) => this._hashtagsMapper(i, industry));
  }

  async fetchVideosByHashtags(hashtags: string[], country: string) {
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

    this.logger.log(`TikTok scraper returned ${items.length} items`);

    return items
      .filter(i => !i?.error && i?.id)
      .map(i => this.mapVideo(i));
  }

  private mapVideo(item: any) {
    const hashtags: string[] = Array.isArray(item?.hashtags)
      ? item.hashtags
        .map((h: any) => h?.name)
        .filter((n: unknown): n is string => typeof n === 'string' && n.length > 0)
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

      searchQuery: item?.input ?? null,  // actor сам кладе сюди хештег, по якому знайшов

      raw: item,

      publishedAt: item?.createTimeISO
        ? new Date(item.createTimeISO)
        : item?.createTime
          ? new Date(item.createTime * 1000)
          : new Date(),
    };
  }

  private toInt(v: unknown): number {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : 0;
  }

  private toIntOrNull(v: unknown): number | null {
    const n = Number(v);
    return Number.isFinite(n) ? Math.trunc(n) : null;
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
}
