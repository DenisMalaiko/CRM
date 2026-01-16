import { Injectable } from "@nestjs/common";
import { PlatformIngestionAdapter } from "./platform.adapter";
import { IngestionContext } from "../ingestion.context";

@Injectable()
export class FacebookAdsAdapter implements PlatformIngestionAdapter {

  readonly platformCode = "facebook";

  async fetchTrends(context: IngestionContext) {
    console.log("START FACEBOOK TRANDS")
    return [];
  }
}