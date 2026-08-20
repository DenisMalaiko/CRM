import { Injectable, BadRequestException } from "@nestjs/common";
import { ApifyService } from "../apify/apify.service";
import { PlatformList } from "@prisma/client";
import { TCompetitorPostParams, TCompetitorAdsParams } from "../competitor/entities/competitor.entity";

const DIRECT_MESSAGE_CTAS = new Set([
  'MESSAGE_PAGE', 'WHATSAPP_MESSAGE', 'WHATSAPP_LINK', 'INSTAGRAM_MESSAGE',
  'GET_IN_TOUCH', 'ASK_A_QUESTION', 'START_A_CHAT', 'CHAT_NOW',
  'CHAT_ON_WHATSAPP', 'OPEN_MESSENGER_EXT', 'INQUIRE_NOW', 'BUY_VIA_MESSAGE',
]);

const INSTAGRAM_PAGE_CTAS = new Set([
  'VIEW_INSTAGRAM_PROFILE', 'TRY_IN_CAMERA',
]);

const PRODUCT_CTAS = new Set([
  'BUY', 'BUY_NOW', 'BUY_TICKETS', 'ADD_TO_CART',
  'SELL_NOW', 'SWIPE_UP_PRODUCT', 'SWIPE_UP_SHOP', 'VIEW_PRODUCT',
]);

const META_PAGE_CTAS = new Set([
  'LIKE_PAGE', 'VISIT_PROFILE', 'JOIN_GROUP', 'FIND_YOUR_GROUPS',
  'JOIN_CHANNEL', 'VIEW_CHANNEL', 'PLAY_GAME_ON_FACEBOOK',
]);

@Injectable()
export class FacebookService {
  constructor(private readonly apify: ApifyService) {}

  async fetchDetails(pageUrl: string): Promise<{ followers: number; likes: number }> {
    const results = await this.apify.runActor<any>('apify/facebook-pages-scraper', {
      startUrls: [{ url: pageUrl }],
    });

    const page = results[0];
    return {
      followers: page?.followers ?? 0,
      likes: page?.likes ?? 0,
    };
  }

  async fetchPostsData(pageUrl: string): Promise<{ posts: number; postsImageCount: number; postsVideoCount: number; postsCarouselCount: number }> {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const items = await this.apify.runActor<any>('apify~facebook-posts-scraper', {
      captionText: false,
      onlyPostsNewerThan: ninetyDaysAgo.toISOString().split('T')[0],
      resultsLimit: 300,
      startUrls: [{ url: pageUrl }],
    });

    let postsImageCount = 0;
    let postsVideoCount = 0;
    let postsCarouselCount = 0;

    for (const item of items) {
      if (item.error) continue;
      const hasCarousel = Array.isArray(item.media) && item.media[0]?.mediaset_token;
      const hasVideo = Array.isArray(item.media) && item.media.some((m: any) => m?.__typename === 'Video');
      if (hasCarousel) {
        postsCarouselCount++;
      } else if (hasVideo) {
        postsVideoCount++;
      } else {
        postsImageCount++;
      }
    }

    return { posts: postsImageCount + postsVideoCount + postsCarouselCount, postsImageCount, postsVideoCount, postsCarouselCount };
  }

  async fetchAdsData(pageUrl: string): Promise<{ activeAds: number; adsVideoCount: number; adsImageCount: number; adsCarouselCount: number; adsDcoCount: number; adsCtaWebsite: number; adsCtaDirectMessage: number; adsCtaInstagramPage: number; adsCtaProduct: number; adsCtaMetaPage: number }> {
    const items = await this.apify.runActor<any>('curious_coder~facebook-ads-library-scraper', {
      count: 10,
      scrapeAdDetails: true,
      "scrapePageAds.activeStatus": "all",
      "scrapePageAds.countryCode": "ALL",
      "scrapePageAds.sortBy": "impressions_desc",
      urls: [{ url: pageUrl }],
    });

    let activeAds = 0;
    let adsVideoCount = 0;
    let adsImageCount = 0;
    let adsCarouselCount = 0;
    let adsDcoCount = 0;
    let adsCtaWebsite = 0;
    let adsCtaDirectMessage = 0;
    let adsCtaInstagramPage = 0;
    let adsCtaProduct = 0;
    let adsCtaMetaPage = 0;

    console.log('[ADS] total items from Apify:', items.length);
    for (const item of items) {
      if (item.error) { console.log('[ADS] skipping item with error:', item.error); continue; }
      if (item.is_active) activeAds++;

      const format = item.snapshot?.display_format;
      const ctaType = item.snapshot?.cta_type;
      console.log('[ADS] item:', { id: item.ad_archive_id, is_active: item.is_active, format, ctaType, title: item.snapshot?.title?.substring(0, 50) });

      if (format === 'VIDEO') adsVideoCount++;
      else if (format === 'IMAGE') adsImageCount++;
      else if (format === 'CAROUSEL') adsCarouselCount++;
      else if (format === 'DCO') adsDcoCount++;
      else console.log('[ADS] unknown format:', format);

      if (!ctaType) { console.log('[ADS] no ctaType, skipping CTA count'); continue; }

      if (DIRECT_MESSAGE_CTAS.has(ctaType)) adsCtaDirectMessage++;
      else if (INSTAGRAM_PAGE_CTAS.has(ctaType)) adsCtaInstagramPage++;
      else if (PRODUCT_CTAS.has(ctaType)) adsCtaProduct++;
      else if (META_PAGE_CTAS.has(ctaType)) adsCtaMetaPage++;
      else adsCtaWebsite++;
    }
    console.log('[ADS] results:', { activeAds, adsVideoCount, adsImageCount, adsCarouselCount, adsDcoCount, adsCtaWebsite, adsCtaDirectMessage, adsCtaInstagramPage, adsCtaProduct, adsCtaMetaPage });

    return { activeAds, adsVideoCount, adsImageCount, adsCarouselCount, adsDcoCount, adsCtaWebsite, adsCtaDirectMessage, adsCtaInstagramPage, adsCtaProduct, adsCtaMetaPage };
  }

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
