import { Injectable, BadRequestException } from "@nestjs/common";
import * as process from "node:process";

@Injectable()
export class ApifyService {
  private readonly apifyApiKey: string = process.env.APIFY_API_KEY!;
  private readonly apifyApiURL: string = "https://api.apify.com/v2";

  async runActor<T>(actor: string, input: any): Promise<T[]> {
    const runUrl = `${this.apifyApiURL}/acts/${actor}/runs?token=${this.apifyApiKey}`;
    console.log("RUN 111")

    const runRes = await fetch(runUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    const runData = await runRes.json();

    console.log("RUN 222")

    if (runData.error) {
      throw new BadRequestException(
        runData.error.message || 'Failed to run actor'
      )
    }

    console.log("RUN 333")

    const runId = runData.data.id;
    const run = await this.waitForRun(runId);

    console.log("RUN 444")
    const datasetRes = await fetch(`${this.apifyApiURL}/datasets/${run.defaultDatasetId}/items?token=${this.apifyApiKey}`);

    console.log("RUN 555")
    const items = await datasetRes.json();

    console.log("RUN 666")

    if (items[0].error) {
      console.log("ITEMS ERROR: ", items[0])

      if(items[0].errorCode === "PAGE_PRIVATE") {
        throw new BadRequestException('Page is private');
      }

      if(items[0].errorCode === "ADS_NOT_FOUND") {
        throw new BadRequestException('Ads not found');
      }

      throw new BadRequestException('No data found for this page');
    }

    return items;
  }

  private async waitForRun(runId: string) {
    while (true) {
      const res = await fetch(
        `${this.apifyApiURL}/actor-runs/${runId}?token=${this.apifyApiKey}`
      );

      const data = await res.json();
      if (data.data.status === 'SUCCEEDED') {
        return data.data;
      }

      await new Promise(r => setTimeout(r, 2000));
    }
  }
}