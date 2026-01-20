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

    console.log("SEARCH ", search)

    const params = new URLSearchParams({
      access_token: process.env.FACEBOOK_ACCESS_TOKEN!,
      ad_active_status: 'ACTIVE',
      ad_type: 'ALL',
      search_terms: search[0],
      ad_reached_countries: adReachedCountries,
      fields: 'id,page_name,ad_snapshot_url,ad_delivery_start_time,ad_delivery_stop_time,ad_creative_bodies,ad_creative_link_titles,ad_creative_link_descriptions,publisher_platforms',
      limit: String(limit),
    });

    // search_terms: search[0],

    const url = `${process.env.FACEBOOK_BASE_URL}/${process.env.FACEBOOK_GRAPH_VERSION}/ads_archive?${params.toString()}`;

    console.log("URL ", url)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText);
    }

    const data = await response.json();

    console.log('DATA:', data);

    return data;
  }
}