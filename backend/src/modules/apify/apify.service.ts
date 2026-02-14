import { Injectable } from "@nestjs/common";
import * as process from "node:process";

@Injectable()
export class ApifyService {
  private readonly apifyApiKey: string = process.env.APIFY_API_KEY!;
  private readonly apifyApiURL: string = "https://api.apify.com/v2";

  async runActor<T>(actor: string, input: any): Promise<T[]> {
    const runUrl = `${this.apifyApiURL}/acts/${actor}/runs?token=${this.apifyApiKey}`;

    console.log("----------")
    console.log("INPUT ", input)
    console.log("----------")

    const runRes = await fetch(runUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    const runData = await runRes.json();
    const runId = runData.data.id;
    const run = await this.waitForRun(runId);
    const datasetRes = await fetch(`${this.apifyApiURL}/datasets/${run.defaultDatasetId}/items?token=${this.apifyApiKey}`);

    return datasetRes.json();
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