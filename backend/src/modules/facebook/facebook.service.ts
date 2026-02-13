import {Injectable} from "@nestjs/common";
import {ApifyService} from "../apify/apify.service";

@Injectable()
export class FacebookService {
  constructor(private readonly apify: ApifyService) {}

  async fetchAds(pageUrl: string) {
    console.log("FETCH ADS ", pageUrl);

    const items = await this.apify.runActor<any>(
      'curious_coder~facebook-ads-library-scraper',
      {
        "count": 10,
        "scrapeAdDetails": false,
        "scrapePageAds.activeStatus": "all",
        "scrapePageAds.countryCode": "ALL",
        "scrapePageAds.sortBy": "impressions_desc",
        "urls": [
          {
            "url": pageUrl,
          }
        ],
        "scrapePageAds.period": ""
      }
    );

    return items
      .filter(i => !i.error)
      .map(i => this._adsMapper(i));
  }

  async fetchPosts(pageUrl: string) {
    console.log("FETCH POSTS ", pageUrl);

    const items = await this.apify.runActor<any>(
      'apify~facebook-posts-scraper',
      {
        "captionText": true,
        "resultsLimit": 5,
        "onlyPostsNewerThan": "2025-09-23T10:02:01",
        "startUrls": [
          {
            "url": pageUrl
          }
        ]
      }
    );

    return items
      .map(i => this._postsMapper(i));
  }

  private _postsMapper(item) {

    return {
      // identity
      id: item?.postId,
      page_name: item?.pageName,

      // creative
      text: item?.text,
      likes: item?.likes,
      shares: item?.shares,
      topReactionsCount: item?.topReactionsCount,
      isVideo: item?.isVideo,
      viewsCount: item?.viewsCount,
      media: this._media(item),

      // time & performance proxy
      time: item?.time,

      // links
      url: item?.url,

      collaborators: item?.collaborators,
    };
  }

  private _adsMapper(item) {
    return {
      // identity
      id: item?.ad_archive_id,
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
      is_finserv: item?.regional_regulation_data?.finserv?.is_deemed_finserv,
    }
  }

  private _landing_domain(item) {
    try {
      return new URL(item?.snapshot?.link_url).hostname;
    } catch {
      return null;
    }
  }

  private _active_days(item) {
    return item?.start_date && item?.end_date ? Math.ceil((item.end_date - item.start_date) / 86400) : null;
  }

  private _media(item) {
    return item.media.map((x) => {
      return {
        thumbnail: x?.thumbnail,
        url: x?.videoDeliveryLegacyFields?.browser_native_hd_url
      };
    })
  }

  private _video(item) {
    return item?.snapshot?.videos?.map((x) => {
      return {
        thumbnail: x?.video_preview_image_url,
        url: x?.video_sd_url,
      };
    })
  }
}