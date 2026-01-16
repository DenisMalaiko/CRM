import { Injectable, Inject } from '@nestjs/common';
import { PlatformIngestionAdapter } from './adapters/platform.adapter';
import { IngestionContext } from './ingestion.context';
import { PLATFORM_ADAPTERS_TOKEN } from './ingestion.tokens';

@Injectable()
export class IngestionService {
  private readonly adapterMap: Map<string, PlatformIngestionAdapter>;

  constructor(
    @Inject(PLATFORM_ADAPTERS_TOKEN)
    adapters: PlatformIngestionAdapter[],
  ) {
    this.adapterMap = new Map(adapters.map(a => [a.platformCode, a]));
  }

  buildSearch(profile) {
    const queries = new Set<string>();

    // 1. Product-based
    for (const product of profile.products) {
      queries.add(product.name.toLowerCase());

      if (product.priceSegment) {
        queries.add(
          `${product.priceSegment.toLowerCase()} ${product.name.toLowerCase()}`
        );
      }
    }

    // 2. Pain-based
    for (const audience of profile.audiences) {
      for (const pain of audience.pains ?? []) {
        queries.add(pain.toLowerCase());
      }
    }

    // 3. Desire-based
    for (const audience of profile.audiences) {
      for (const desire of audience.desires ?? []) {
        queries.add(desire.toLowerCase());
      }
    }

    return [...queries]
      .filter(q => q.length > 3)
      .slice(0, 20); // ⛔ ліміт — дуже важливо
  }

  async ingestProfile(profile) {
    for (const platform of profile.platforms) {
      const adapter = this.adapterMap.get(platform.code);
      if (!adapter) continue;

      console.log("----------")
      console.log("INGEST PROFILE: ", profile)

      const search = this.buildSearch(profile)

      console.log("SEARCH ", search)

      const signals = await adapter.fetchTrends(profile);

      console.log("Save Signal ", signals)
      console.log("----------")

      //await this.trendService.saveSignals(signals);
    }
  }
}
