import { Injectable, BadRequestException } from "@nestjs/common";
import { ApifyService } from "../apify/apify.service";
import { PlatformList } from "@prisma/client";
import { TCompetitorPostParams, TCompetitorAdsParams } from "../competitor/entities/competitor.entity";

@Injectable()
export class FacebookService {
  constructor(private readonly apify: ApifyService) {}

  async fetchAds(competitorId: string, pageUrl: string, body: TCompetitorAdsParams) {
    const items = await this.apify.runActor<any>(
      'curious_coder~facebook-ads-library-scraper',
      {
        "count": 20,
        "scrapeAdDetails": false,
        "scrapePageAds.activeStatus": body.activeStatus ?? "active",
        "scrapePageAds.countryCode": "ALL",
        "scrapePageAds.sortBy": body.sortBy ?? "impressions_desc",
        "scrapePageAds.period": body.period ?? "last24h",
        "urls": [
          {
            "url": pageUrl,
          }
        ],
      }
    );

    return items
      .filter(i => !i.error)
      .map(i => this._adsMapper(competitorId, i));
  }

  async fetchPosts(competitorId: string, pageUrl: string, body: TCompetitorPostParams) {
    const items = await this.apify.runActor<any>(
      'apify~facebook-posts-scraper',
      {
        "captionText": true,
        "resultsLimit": 50,
        "startUrls": [
          {
            "url": pageUrl
          }
        ],
        ...body
      }
    );

    console.log("GET COMPETITOR POSTS: ", items)

    return items
      .filter(i => !i.error)
      .map(i => this._postsMapper(competitorId, i));
  }

  private _postsMapper(competitorId: string, item: any) {
    return {
      externalId: item?.postId,
      platform: PlatformList.Facebook,
      competitorId,

      // content
      text: item?.text ?? null,
      url: item?.url ?? null,
      media: this._media(item) ?? [],

      // metrics
      likes: item?.likes ?? null,
      shares: item?.shares ?? null,
      views: item?.viewsCount ?? null,
      comments: item?.comments ?? null,

      // meta
      postedAt: item?.time ? new Date(item.time) : null,
    };
  }

  private _adsMapper(competitorId: string, item: any) {
    return {
      externalId: item?.ad_archive_id,
      platform: PlatformList.Facebook,
      competitorId,

      // content
      title: item?.snapshot?.title.includes("{{product.name}}") ? item?.snapshot?.cards[0].title : item?.snapshot?.title,
      body: item?.snapshot?.body?.text.includes("{{product.brand}}") ? item?.snapshot?.cards[0].body : item?.snapshot?.body?.text,
      caption: item?.snapshot?.caption,
      url: item?.ad_library_url,
      format: item?.snapshot?.display_format,
      ctaText: item?.snapshot?.cta_text,
      ctaType: item?.snapshot?.cta_type,
      videos: this._video(item),
      images: this._images(item),

      // meta
      start: this._toDate(item?.start_date),
      end: this._toDate(item?.end_date),
      active_days: this._active_days(item.start_date, item.end_date),
      isActive: item?.is_active,
    }
  }

  private _landing_domain(item) {
    try {
      return new URL(item?.snapshot?.link_url).hostname;
    } catch {
      return null;
    }
  }

  private _active_days(start?: number, end?: number): number | null {
    if (!start) return null;

    const startDate = new Date(start * 1000);
    const endDate = end
      ? new Date(end * 1000)
      : new Date(); // активна реклама

    const diffMs = endDate.getTime() - startDate.getTime();
    const dayMs = 1000 * 60 * 60 * 24;

    return Math.max(1, Math.ceil(diffMs / dayMs) + 1);
  }

  private _media(item) {
    if (!Array.isArray(item?.media)) return [];

    return item.media
      .filter((x) => x?.thumbnail)
      .map((x) => {
        return {
          thumbnail: x?.thumbnail,
          url: x?.videoDeliveryLegacyFields?.browser_native_hd_url
        };
      })
  }

  private _video(item) {
    if (!Array.isArray(item?.snapshot?.videos)) return [];

    return item?.snapshot?.videos?.map((x) => {
      return {
        thumbnail: x?.video_preview_image_url,
        url: x?.video_sd_url,
      };
    })
  }

  private _images(item) {
    if (!Array.isArray(item?.snapshot?.images)) {
      return item?.snapshot?.images?.map((x) => {
        return {
          thumbnail: x?.resized_image_url,
          url: x?.original_image_url,
        };
      })
    } else {
      return [
        {
          thumbnail: item?.snapshot?.cards[0]?.resized_image_url,
          url: item?.snapshot?.cards[0]?.original_image_url,
        }
      ]
    }
  }

  private _toDate(seconds?: number): Date | null {
    if (!seconds) return null;
    return new Date(seconds * 1000);
  }
}