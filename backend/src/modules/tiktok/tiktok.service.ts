import { Injectable } from '@nestjs/common';
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

    console.log("--------------------");
    console.log("FETCH VIDEOS BY HASHTAGS");
    console.log("HASH TAGS ", hashtags);
    console.log("COUNTRY ", country);

    const settings: TikTokScraperSettings = {
      commentsPerPost: 0,
      excludePinnedPosts: false,
      hashtags: hashtags,
      maxFollowersPerProfile: 0,
      maxFollowingPerProfile: 0,
      maxProfilesPerQuery: 3,
      maxRepliesPerComment: 0,
      profileSorting: 'latest',
      proxyCountryCode: country,
      resultsPerPage: 3,
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
    }

    const items: any = await this.apify.runActor(
      'clockworks~tiktok-scraper',
      settings
    );

    console.log("RESULT ITEMS ", items);

    return items
      .filter((i: any) => !i.error)
      .map((i: any) => this._videosMapper(i));
  }

  private _videosMapper(item: any) {
    return {
      id: item?.id,
      text: item?.text,
      url: item?.webVideoUrl,
      coverUrl: item?.videoMeta?.coverUrl,
      author: {
        name: item?.authorMeta?.name,
        nickname: item?.authorMeta?.nickName,
        avatarUrl: item?.authorMeta?.avatar,
      },
      stats: {
        plays: item?.playCount,
        likes: item?.diggCount,
        comments: item?.commentCount,
        shares: item?.shareCount,
      },
      createdAt: item?.createTimeISO ?? null,
    };
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
