import { Injectable } from "@nestjs/common";
import { PlatformIngestionAdapter } from "./platform.adapter";
import { IngestionContext } from "../ingestion.context";
import * as process from "node:process";

@Injectable()
export class FacebookAdsAdapter implements PlatformIngestionAdapter {

  readonly platformCode = "facebook";

  async fetchTrends(context: any, search: string[]) {
    console.log("START FACEBOOK TRANDS")
    const limit = 10;

    const params = new URLSearchParams({
      access_token: process.env.FACEBOOK_ACCESS_TOKEN!,
      ad_active_status: 'ALL',
      ad_type: 'ALL',
      ad_reached_countries: context.audiences[0].geo.length === 1 ? context.audiences[0].geo : JSON.stringify(context.audiences[0].geo),
      search_terms: search[0],
      fields: [
        'id',
        'page_name',
        'ad_creative_body',
        'ad_snapshot_url',
      ].join(','),
      limit: String(limit),
    });

    const url = `${process.env.FACEBOOK_BASE_URL}/${process.env.FACEBOOK_GRAPH_VERSION}/ads_archive?${params.toString()}`;

    console.log("URL ", url)

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    })

    console.log("RESPONSE ", response)
    return [];
  }
}