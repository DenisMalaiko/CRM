import { Injectable, BadRequestException } from '@nestjs/common';
import { ApifyService } from '../apify/apify.service';
import { PlatformList } from '@prisma/client';
import {
  TCompetitorPostParams,
  TCompetitorAdsParams,
} from '../competitor/entities/competitor.entity';

const DIRECT_MESSAGE_CTAS = new Set([
  'MESSAGE_PAGE',
  'WHATSAPP_MESSAGE',
  'WHATSAPP_LINK',
  'INSTAGRAM_MESSAGE',
  'GET_IN_TOUCH',
  'ASK_A_QUESTION',
  'START_A_CHAT',
  'CHAT_NOW',
  'CHAT_ON_WHATSAPP',
  'OPEN_MESSENGER_EXT',
  'INQUIRE_NOW',
  'BUY_VIA_MESSAGE',
]);

const INSTAGRAM_PAGE_CTAS = new Set([
  'VIEW_INSTAGRAM_PROFILE',
  'TRY_IN_CAMERA',
]);

const PRODUCT_CTAS = new Set([
  'BUY',
  'BUY_NOW',
  'BUY_TICKETS',
  'ADD_TO_CART',
  'SELL_NOW',
  'SWIPE_UP_PRODUCT',
  'SWIPE_UP_SHOP',
  'VIEW_PRODUCT',
]);

const META_PAGE_CTAS = new Set([
  'LIKE_PAGE',
  'VISIT_PROFILE',
  'JOIN_GROUP',
  'FIND_YOUR_GROUPS',
  'JOIN_CHANNEL',
  'VIEW_CHANNEL',
  'PLAY_GAME_ON_FACEBOOK',
]);

@Injectable()
export class FacebookService {
  constructor(private readonly apify: ApifyService) {}

  async fetchDetails(pageUrl: string): Promise<{
    followers: number;
    likes: number;
    pageAdLibraryId: string | null;
  }> {
    const results = await this.apify.runActor<any>(
      'apify/facebook-pages-scraper',
      {
        startUrls: [{ url: pageUrl }],
      },
    );

    const page = results[0];
    return {
      followers: page?.followers ?? 0,
      likes: page?.likes ?? 0,
      pageAdLibraryId: page?.pageAdLibrary?.id ?? null,
    };
  }

  async fetchPostsData(pageUrl: string): Promise<{
    posts: number;
    postsImageCount: number;
    postsVideoCount: number;
    postsCarouselCount: number;
    topPosts: Array<{ postId: string; format: string | null; url: string | null; image: string | null; video: string | null; reactions: number | null; comments: number | null; shares: number | null }>;
    topPostTexts: Array<{ text: string; collationCount: number; url: string | null }>;
  }> {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const items = await this.apify.runActor<any>(
      'apify~facebook-posts-scraper',
      {
        captionText: false,
        onlyPostsNewerThan: ninetyDaysAgo.toISOString().split('T')[0],
        resultsLimit: 10,
        startUrls: [{ url: pageUrl }],
      },
    );

    console.log('[POSTS] total items from Apify:', items.length);

    let postsImageCount = 0;
    let postsVideoCount = 0;
    let postsCarouselCount = 0;
    let skippedErrors = 0;

    for (const item of items) {
      if (item.error) {
        skippedErrors++;
        console.log(
          '[POSTS] skipping item with error:',
          item.error,
          'postId:',
          item.postId,
        );
        continue;
      }
      const hasCarousel =
        Array.isArray(item.media) && item.media[0]?.mediaset_token;
      const hasVideo =
        Array.isArray(item.media) &&
        item.media.some((m: any) => m?.__typename === 'Video');
      const category = hasCarousel ? 'carousel' : hasVideo ? 'video' : 'image';
      console.log('[POSTS] item:', {
        postId: item.postId,
        category,
        mediaCount: item.media?.length ?? 0,
      });
      if (hasCarousel) {
        postsCarouselCount++;
      } else if (hasVideo) {
        postsVideoCount++;
      } else {
        postsImageCount++;
      }
    }

    const total = postsImageCount + postsVideoCount + postsCarouselCount;

    const topPosts = items
      .filter((item) => !item.error)
      .map((item) => {
        const hasCarousel =
          Array.isArray(item.media) && item.media[0]?.mediaset_token;
        const hasVideo =
          Array.isArray(item.media) &&
          item.media.some((m: any) => m?.__typename === 'Video');
        const format = hasCarousel ? 'carousel' : hasVideo ? 'video' : 'image';

        const videoMedia = Array.isArray(item.media)
          ? item.media.find((m: any) => m?.__typename === 'Video')
          : null;
        const firstVisualMedia = Array.isArray(item.media)
          ? item.media.find((m: any) => m?.thumbnail || m?.image?.uri)
          : null;
        const image =
          firstVisualMedia?.thumbnail ??
          firstVisualMedia?.image?.uri ??
          null;
        const video =
          videoMedia?.videoDeliveryLegacyFields?.browser_native_sd_url ?? null;

        const likes = item.likes ?? 0;
        const comments = item.comments ?? 0;
        const shares = item.shares ?? 0;
        const engagement = likes + comments * 2 + shares * 3;

        return {
          postId: item.postId ?? '',
          format,
          url: item.topLevelUrl ?? item.url ?? null,
          image,
          video,
          reactions: likes,
          comments,
          shares,
          _engagement: engagement,
        };
      })
      .sort((a, b) => b._engagement - a._engagement)
      .slice(0, 10)
      .map(({ _engagement, ...rest }) => rest);

    const seenTexts = new Set<string>();
    const topPostTexts: Array<{ text: string; collationCount: number; url: string | null }> = [];
    const sortedByEngagement = [...items]
      .filter((item) => !item.error)
      .sort((a, b) => {
        const engA = (a.likes ?? 0) + (a.comments ?? 0) * 2 + (a.shares ?? 0) * 3;
        const engB = (b.likes ?? 0) + (b.comments ?? 0) * 2 + (b.shares ?? 0) * 3;
        return engB - engA;
      });
    for (const item of sortedByEngagement) {
      if (topPostTexts.length >= 6) break;
      const text = item.text;
      if (!text || text.trim().length === 0) continue;
      if (seenTexts.has(text)) continue;
      seenTexts.add(text);
      const engagement = (item.likes ?? 0) + (item.comments ?? 0) * 2 + (item.shares ?? 0) * 3;
      topPostTexts.push({
        text,
        collationCount: engagement,
        url: item.topLevelUrl ?? item.url ?? null,
      });
    }

    console.log('[POSTS] results:', {
      total,
      skippedErrors,
      postsImageCount,
      postsVideoCount,
      postsCarouselCount,
      topPostsCount: topPosts.length,
      topPostTextsCount: topPostTexts.length,
    });
    return {
      posts: total,
      postsImageCount,
      postsVideoCount,
      postsCarouselCount,
      topPosts,
      topPostTexts,
    };
  }

  async fetchAdsData(pageUrl: string): Promise<{
    activeAds: number;
    activeAds30d: number;
    adsVideoCount: number;
    adsImageCount: number;
    adsCarouselCount: number;
    adsDcoCount: number;
    adsCtaWebsite: number;
    adsCtaDirectMessage: number;
    adsCtaInstagramPage: number;
    adsCtaProduct: number;
    adsCtaMetaPage: number;
    topAdTexts: Array<{ text: string; collationCount: number; url: string | null }>;
    topAds: Array<{ title: string | null; adId: string; format: string | null; url: string | null; image: string | null; video: string | null; activeDays: number | null }>;
  }> {
    const items = await this.apify.runActor<any>(
      'curious_coder~facebook-ads-library-scraper',
      {
        count: 10,
        scrapeAdDetails: true,
        'scrapePageAds.activeStatus': 'active',
        'scrapePageAds.countryCode': 'ALL',
        'scrapePageAds.sortBy': 'impressions_desc',
        urls: [{ url: pageUrl }],
      },
    );

    const activeCollations = new Set<string>();
    const activeCollations30d = new Set<string>();
    const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 24 * 60 * 60;
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
      if (item.error) {
        console.log('[ADS] skipping item with error:', item.error);
        continue;
      }
      const collationKey = item.collation_id ?? item.ad_archive_id;
      const nowTs = Math.floor(Date.now() / 1000);
      const todayStart = nowTs - (nowTs % 86400);
      const endTs = item.end_date ?? nowTs;
      if (item.is_active) {
        activeCollations.add(collationKey);
      }
      const startTs = item.start_date ?? 0;
      if (startTs >= thirtyDaysAgo) {
        activeCollations30d.add(collationKey);
      }

      const format = item.snapshot?.display_format;
      const ctaType = item.snapshot?.cta_type;
      const startFormatted = item.start_date
        ? new Date(item.start_date * 1000).toISOString().split('T')[0]
        : 'N/A';
      const endFormatted = item.end_date
        ? new Date(item.end_date * 1000).toISOString().split('T')[0]
        : 'N/A';
      const thirtyDaysAgoFormatted = new Date(thirtyDaysAgo * 1000)
        .toISOString()
        .split('T')[0];
      const passesActive = item.is_active && endTs >= todayStart;
      const passes30d = passesActive && endTs >= thirtyDaysAgo;
      const nowFormatted = new Date(nowTs * 1000).toISOString().split('T')[0];
      console.log('[ADS] item:', {
        id: item.ad_archive_id,
        collation_id: item.collation_id,
        collation_count: item.collation_count,
        is_active: item.is_active,
        format,
        ctaType,
        start: startFormatted,
        end: endFormatted,
        now: nowFormatted,
        thirtyDaysAgo: thirtyDaysAgoFormatted,
        passesActive,
        passes30d,
        title: item.snapshot?.title?.substring(0, 50),
      });

      if (format === 'VIDEO') adsVideoCount++;
      else if (format === 'IMAGE') adsImageCount++;
      else if (format === 'CAROUSEL') adsCarouselCount++;
      else if (format === 'DCO') adsDcoCount++;
      else console.log('[ADS] unknown format:', format);

      if (!ctaType) {
        console.log('[ADS] no ctaType, skipping CTA count');
        continue;
      }

      if (DIRECT_MESSAGE_CTAS.has(ctaType)) adsCtaDirectMessage++;
      else if (INSTAGRAM_PAGE_CTAS.has(ctaType)) adsCtaInstagramPage++;
      else if (PRODUCT_CTAS.has(ctaType)) adsCtaProduct++;
      else if (META_PAGE_CTAS.has(ctaType)) adsCtaMetaPage++;
      else adsCtaWebsite++;
    }
    const activeAds = activeCollations.size;
    const activeAds30d = activeCollations30d.size;
    console.log('[ADS] ===== ACTIVE COLLATIONS LIST =====');
    let idx = 1;
    for (const key of activeCollations) {
      const sample = items.find(
        (i) => (i.collation_id ?? i.ad_archive_id) === key,
      );
      console.log(
        `[ADS] #${idx++}: collation_key=${key}, collation_id=${sample?.collation_id}, ad_archive_id=${sample?.ad_archive_id}, collation_count=${sample?.collation_count}, title="${sample?.snapshot?.title?.substring(0, 60)}"`,
      );
    }
    console.log('[ADS] ===================================');
    console.log('[ADS] results:', {
      activeAds,
      activeAds30d,
      adsVideoCount,
      adsImageCount,
      adsCarouselCount,
      adsDcoCount,
      adsCtaWebsite,
      adsCtaDirectMessage,
      adsCtaInstagramPage,
      adsCtaProduct,
      adsCtaMetaPage,
    });

    const seenTexts = new Set<string>();
    const topAdTexts: Array<{ text: string; collationCount: number; url: string | null }> = [];
    for (const item of items) {
      if (topAdTexts.length >= 6) break;
      if (item.error) continue;

      const bodyText = item.snapshot?.body?.text;
      const cardText = item.snapshot?.cards?.[0]?.body;
      const text =
        bodyText && !bodyText.includes('{{product.brand}}')
          ? bodyText
          : cardText;

      if (!text || text.trim().length === 0 || text.trim() === ' ') continue;
      if (seenTexts.has(text)) continue;

      seenTexts.add(text);
      topAdTexts.push({
        text,
        collationCount: item.collation_count ?? 1,
        url: item.ad_library_url ?? null,
      });
    }

    const topAds = items
      .filter((item) => !item.error)
      .map((item) => {
        const firstImage =
          item.snapshot?.images?.[0]?.resized_image_url ??
          item.snapshot?.cards?.[0]?.resized_image_url ??
          item.snapshot?.videos?.[0]?.video_preview_image_url ??
          item.snapshot?.cards?.[0]?.video_preview_image_url ??
          null;
        const firstVideo =
          item.snapshot?.videos?.[0]?.video_sd_url ??
          item.snapshot?.cards?.[0]?.video_sd_url ??
          null;
        return {
          title: item.snapshot?.title ?? null,
          adId: item.ad_archive_id ?? '',
          format: item.snapshot?.display_format ?? null,
          url: item.ad_library_url ?? null,
          image: firstImage,
          video: firstVideo,
          activeDays: this._active_days(item.start_date, item.end_date),
        };
      })
      .sort((a, b) => (b.activeDays ?? 0) - (a.activeDays ?? 0))
      .slice(0, 10);

    return {
      activeAds,
      activeAds30d,
      adsVideoCount,
      adsImageCount,
      adsCarouselCount,
      adsDcoCount,
      adsCtaWebsite,
      adsCtaDirectMessage,
      adsCtaInstagramPage,
      adsCtaProduct,
      adsCtaMetaPage,
      topAdTexts,
      topAds,
    };
  }

  async fetchAds(
    competitorId: string,
    pageUrl: string,
    body: TCompetitorAdsParams,
  ) {
    const items = await this.apify.runActor<any>(
      'curious_coder~facebook-ads-library-scraper',
      {
        count: 20,
        scrapeAdDetails: false,
        'scrapePageAds.activeStatus': body.activeStatus ?? 'active',
        'scrapePageAds.countryCode': 'ALL',
        'scrapePageAds.sortBy': body.sortBy ?? 'impressions_desc',
        'scrapePageAds.period': body.period ?? 'last24h',
        urls: [
          {
            url: pageUrl,
          },
        ],
      },
    );

    const validItems = items.filter((i) => !i.error);

    return validItems.map((i) => this._adsMapper(competitorId, i));
  }

  async fetchPosts(
    competitorId: string,
    pageUrl: string,
    body: TCompetitorPostParams,
  ) {
    const items = await this.apify.runActor<any>(
      'apify~facebook-posts-scraper',
      {
        captionText: true,
        resultsLimit: 50,
        startUrls: [
          {
            url: pageUrl,
          },
        ],
        ...body,
      },
    );

    return items
      .filter((i) => !i.error)
      .map((i) => this._postsMapper(competitorId, i));
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
      title: item?.snapshot?.title.includes('{{product.name}}')
        ? item?.snapshot?.cards[0].title
        : item?.snapshot?.title,
      body: item?.snapshot?.body?.text.includes('{{product.brand}}')
        ? item?.snapshot?.cards[0].body
        : item?.snapshot?.body?.text,
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
    };
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
    const endDate = end ? new Date(end * 1000) : new Date(); // активна реклама

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
          url: x?.videoDeliveryLegacyFields?.browser_native_hd_url,
        };
      });
  }

  private _video(item) {
    if (!Array.isArray(item?.snapshot?.videos)) return [];

    return item?.snapshot?.videos?.map((x) => {
      return {
        thumbnail: x?.video_preview_image_url,
        url: x?.video_sd_url,
      };
    });
  }

  private _images(item) {
    if (!Array.isArray(item?.snapshot?.images)) {
      return item?.snapshot?.images?.map((x) => {
        return {
          thumbnail: x?.resized_image_url,
          url: x?.original_image_url,
        };
      });
    } else {
      return [
        {
          thumbnail: item?.snapshot?.cards[0]?.resized_image_url,
          url: item?.snapshot?.cards[0]?.original_image_url,
        },
      ];
    }
  }

  private _toDate(seconds?: number): Date | null {
    if (!seconds) return null;
    return new Date(seconds * 1000);
  }
}
