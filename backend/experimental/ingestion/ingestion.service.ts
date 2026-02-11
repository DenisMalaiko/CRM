import { Injectable, Inject } from '@nestjs/common';
import { PlatformIngestionAdapter } from './adapters/platform.adapter';
import { PLATFORM_ADAPTERS_TOKEN } from './ingestion.tokens';
import { AiService } from "../../src/modules/ai/ai.service";

@Injectable()
export class IngestionService {
  private readonly adapterMap: Map<string, PlatformIngestionAdapter>;

  constructor(
    @Inject(PLATFORM_ADAPTERS_TOKEN)
    adapters: PlatformIngestionAdapter[],
    private readonly aiService: AiService
  ) {
    this.adapterMap = new Map(adapters.map(a => [a.platformCode, a]));
  }

  /*async ingestProfile(profile) {
    for (const platform of profile.platforms) {
      console.log("PROFILE: ", profile)

      const adapter = this.adapterMap.get(platform.code);
      if (!adapter) continue;

      const search = await this.aiService.normalizeForFacebook(profile);

      const ads = await adapter.fetchTrends(profile, search);

      const dataForGenerationAds = {
        industry: profile.business.industry,
        profile_focus: profile.profileFocus,
        products: profile.products.map((x) => {
          return {
            name: x.name,
            description: x.description,
            type: x.type,
            priceSegment: x.priceSegment,
          }
        }),
        goals: profile.audiences.map((x) => {
          return x.desires.map((y) => y);
        }),
        facebookAds: ads.map((x) => {
          return {
            name: x.ad_creative_link_titles.length >= 1 ? x.ad_creative_link_titles[0] : '',
            description: x.ad_creative_link_descriptions.length >= 1 ? x.ad_creative_link_descriptions[0] : '',
            url: x.ad_snapshot_url ? x.ad_snapshot_url : '',
          }
        })
      }

      const result = await this.aiService.generateResultForFacebook(dataForGenerationAds);

      return result;
    }
  }*/
}
