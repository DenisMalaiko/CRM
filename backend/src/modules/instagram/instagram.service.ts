import { Injectable } from "@nestjs/common";
import { ApifyService } from "../apify/apify.service";
import { PlatformList } from "@prisma/client";
import { TCompetitorPostParams } from "../competitor/entities/competitor.entity";

@Injectable()
export class InstagramService {
  constructor(private readonly apify: ApifyService) {}

  async fetchPosts(competitorId: string, pageUrl: string, body: TCompetitorPostParams) {
    const items = await this.apify.runActor<any>(
      'apify~instagram-scraper',
      {
        "addParentData": false,
        "directUrls": [pageUrl],
        "resultsLimit": 50,
        "resultsType": "posts",
        "searchLimit": 10,
        "searchType": "hashtag",
        ...body,
      }
    );

    return items
      .filter(i => !i.error)
      .map(i => this._postsMapper(competitorId, i));
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

  private _media(item: any) {
    if (item?.videoUrl) {
      return [{
        thumbnail: item?.displayUrl,
        url: item?.videoUrl,
      }];
    }

    if (item?.displayUrl) {
      return [{
        thumbnail: item?.displayUrl,
        url: null,
      }];
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
