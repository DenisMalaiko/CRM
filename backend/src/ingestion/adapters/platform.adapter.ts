import { IngestionContext } from "../ingestion.context";

export interface PlatformIngestionAdapter {
  readonly platformCode: string;

  fetchTrends(
    context: IngestionContext
  ): Promise<any[]>;
}