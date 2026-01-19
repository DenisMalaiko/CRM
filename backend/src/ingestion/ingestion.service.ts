import { Injectable, Inject } from '@nestjs/common';
import { PlatformIngestionAdapter } from './adapters/platform.adapter';
import { PLATFORM_ADAPTERS_TOKEN } from './ingestion.tokens';
import { AiService } from "../ai/ai.service";

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

  async ingestProfile(profile) {
    for (const platform of profile.platforms) {
      const adapter = this.adapterMap.get(platform.code);
      if (!adapter) continue;

      console.log("----------")
      console.log("INGEST PROFILE: ", profile)

      const search = await this.aiService.normalizeForFacebook(profile);
      console.log("SEARCH ", search)

      const signals = await adapter.fetchTrends(profile, search);
      console.log("----------")

      //await this.trendService.saveSignals(signals);
    }
  }
}
