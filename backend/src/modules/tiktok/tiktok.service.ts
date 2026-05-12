import { Injectable } from '@nestjs/common';
import { ApifyService  } from '../apify/apify.service';

type TikTokAdsSettings = {
  adsApprovedForBusinessUse: boolean;
  adsCountryCode: string;
  adsCreatorsCountryCode: string;
  adsNewOnBoard: boolean;
  adsRankType: 'popular' | 'last';  // якщо знаєш можливі значення
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

@Injectable()
export class TiktokService {
  constructor(private readonly apify: ApifyService) {}

  async fetchHashtags(id: string, country, industry ) {
    console.log("ID ", id, "country ", country);

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

    console.log("ITEMS ", items);

    const result = items
      .filter(i => !i.error)
      .map(i => this._hashtagsMapper(i, industry));

    console.log("RESULT ", result);

    return result;
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
