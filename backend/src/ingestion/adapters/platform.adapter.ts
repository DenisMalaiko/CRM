import { IngestionContext } from "../ingestion.context";

export interface PlatformIngestionAdapter {
  readonly platformCode: string;

  fetchTrends(
    context: any,
    search: string[]
  ): Promise<any[]>;
}