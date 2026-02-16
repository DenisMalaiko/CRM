import { Injectable, BadRequestException } from "@nestjs/common";
import { ApifyService } from "../apify/apify.service";
import { PlatformList } from "@prisma/client";
import { TCompetitorPostParams, TCompetitorAdsParams } from "../competitor/entities/competitor.entity";

@Injectable()
export class FacebookService {
  constructor(private readonly apify: ApifyService) {}

  async fetchAds(competitorId: string, pageUrl: string, body: TCompetitorAdsParams) {
    console.log("FETCH ADS PARAMS ", body);

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

    console.log("--------------")
    console.log("RESPONSE ", items);
    console.log("--------------")

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
      title: item?.snapshot?.title,
      body: item?.snapshot?.body?.text,
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



      /*// identity
      ads_id: item?.ad_archive_id,
      page_id: item?.page_id,
      page_name: item?.page_name,
      page_categories: item?.snapshot?.page_categories,

      // creative
      title: item?.snapshot?.title,
      body: item?.snapshot?.body?.text,
      caption: item?.snapshot?.caption,
      title_length: item?.snapshot?.title?.length,
      body_length: item?.snapshot?.body?.text?.length,
      likes_count: item?.snapshot?.page_like_count,

      // media
      display_format: item?.snapshot?.display_format,
      has_video: item?.snapshot?.videos?.length > 0,
      videos: this._video(item),
      has_image: item?.snapshot?.images?.length > 0,
      images: item?.snapshot?.images,

      // CTA & funnel
      cta_text: item?.snapshot?.cta_text,
      cta_type: item?.snapshot?.cta_type,
      link_url: item?.snapshot?.link_url,
      landing_domain: this._landing_domain(item),

      // time & performance proxy
      start_date: item?.start_date,
      end_date: item?.end_date,
      active_days: this._active_days(item),
      is_active: item?.is_active,

      // scaling
      ads_count: item?.ads_count,
      position: item?.position,

      // distribution
      publisher_platform: item?.publisher_platform,

      // brand context
      page_likes: item?.snapshot?.page_like_count,
      page_created_at: item?.pageInfo?.creation_date,

      // links
      url: item?.ad_library_url,

      contains_sensitive_content: item?.contains_sensitive_content,
      is_finserv: item?.regional_regulation_data?.finserv?.is_deemed_finserv,*/
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
    if (!Array.isArray(item?.snapshot?.images)) return [];

    return item?.snapshot?.images?.map((x) => {
      return {
        thumbnail: x?.resized_image_url,
        url: x?.original_image_url,
      };
    })
  }

  private _toDate(seconds?: number): Date | null {
    if (!seconds) return null;
    return new Date(seconds * 1000);
  }
}