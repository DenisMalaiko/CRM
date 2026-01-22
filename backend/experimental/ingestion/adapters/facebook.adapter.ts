import { Injectable } from "@nestjs/common";
import { PlatformIngestionAdapter } from "./platform.adapter";
import { IngestionContext } from "../ingestion.context";
import * as process from "node:process";

@Injectable()
export class FacebookAdsAdapter implements PlatformIngestionAdapter {

  readonly platformCode = "facebook";

  normalizeGeo(geo: string): string {
    return geo
      .replace(/"/g, '')   // прибрати лапки
      .trim()
      .toUpperCase();
  }

  async fetchTrends(context: any, search: string[]) {
    const limit = 10;
    const geo = context.audiences[0].geo;
    const adReachedCountries = this.normalizeGeo(geo);

    const allAds: any[] = [];

    for (const term of search) {
      console.log("TERM: ", term);

      const params = new URLSearchParams({
        access_token: process.env.FACEBOOK_ACCESS_TOKEN!,
        ad_active_status: 'ACTIVE',
        ad_type: 'FINANCIAL_PRODUCTS_AND_SERVICES_ADS',
        search_terms: term,
        search_type: 'KEYWORD_EXACT_PHRASE',
        ad_reached_countries: adReachedCountries,
        publisher_platforms: 'FACEBOOK',
        fields: [
          'id',
          'page_name',
          'ad_snapshot_url',
          'ad_delivery_start_time',
          'ad_delivery_stop_time',
          'ad_creative_bodies',
          'ad_creative_link_titles',
          'ad_creative_link_descriptions',
          'publisher_platforms',
        ].join(','),
        limit: String(limit),
      });

      const url = `${process.env.FACEBOOK_BASE_URL}/${process.env.FACEBOOK_GRAPH_VERSION}/ads_archive?${params.toString()}`;

      const response = await fetch(url);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Facebook API error for term "${term}"`, errorText);
        continue;
      }

      const data = await response.json();

      console.log("RESPONSE: ", data)

      if (data?.data?.length) {
        allAds.push(...data.data);
      }
    }

    return allAds;
  }
}