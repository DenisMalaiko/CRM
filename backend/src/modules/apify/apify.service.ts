import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import * as process from "node:process";

@Injectable()
export class ApifyService {
  private readonly logger = new Logger(ApifyService.name);
  private readonly apifyApiKey: string = process.env.APIFY_API_KEY!;
  private readonly apifyApiURL: string = "https://api.apify.com/v2";

  private readonly POLL_INTERVAL_MS = 3000;
  private readonly MAX_POLL_ATTEMPTS = 200;
  private readonly INITIAL_DELAY_MS = 2000;

  async runActor<T>(actor: string, input: any): Promise<T[]> {
    const runUrl = `${this.apifyApiURL}/acts/${actor}/runs?token=${this.apifyApiKey}`;
    console.log("111");
    console.log(runUrl);

    const runRes = await fetch(runUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    console.log("222");

    const runData = await this.safeJson(runRes, 'start actor');

    if (runData.error) {
      this.logger.error(`Apify start error: ${runData.error.message}`);
      throw new BadRequestException(runData.error.message || 'Failed to run actor');
    }

    console.log("333");

    const runId = runData.data?.id;
    if (!runId) {
      throw new BadRequestException('Apify did not return run id');
    }

    const run = await this.waitForRun(runId);

    const datasetRes = await fetch(`${this.apifyApiURL}/datasets/${run.defaultDatasetId}/items?token=${this.apifyApiKey}`);

    const items: any[] = await this.safeJson(datasetRes, 'fetch dataset');

    if (!Array.isArray(items) || items.length === 0) {
      return [];
    }

    const first = items[0];
    if (first?.error) {
      if (first.errorCode === 'PAGE_PRIVATE') {
        throw new BadRequestException('Page is private');
      }
      if (first.errorCode === 'ADS_NOT_FOUND') {
        throw new BadRequestException('Ads not found');
      }
      throw new BadRequestException('No data found for this page');
    }

    return items;
  }

  private async waitForRun(runId: string) {
    await this.sleep(this.INITIAL_DELAY_MS);

    const url = `${this.apifyApiURL}/actor-runs/${runId}?token=${this.apifyApiKey}`;

    for (let attempt = 0; attempt < this.MAX_POLL_ATTEMPTS; attempt++) {
      let data: any;
      try {
        const res = await fetch(url);
        data = await this.safeJson(res, `poll run ${runId}`);
      } catch (err) {
        // Тимчасові помилки CDN/мережі — лог і продовжуємо polling
        this.logger.warn(`Poll attempt ${attempt + 1} failed, retrying: ${err.message}`);
        await this.sleep(this.POLL_INTERVAL_MS);
        continue;
      }

      const status = data.data?.status;

      if (status === 'SUCCEEDED') {
        return data.data;
      }

      if (['FAILED', 'ABORTED', 'TIMED-OUT', 'TIMEOUT'].includes(status)) {
        this.logger.error(`Apify run ${runId} ended with status ${status}`);
        throw new BadRequestException(`Apify run ${status.toLowerCase()}`);
      }

      await this.sleep(this.POLL_INTERVAL_MS);
    }

    throw new BadRequestException(`Apify run ${runId} did not finish in time`);
  }

  private async safeJson(res: Response, context: string): Promise<any> {
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      this.logger.error(`Apify ${context} HTTP ${res.status}: ${text.slice(0, 300)}`);
      throw new BadRequestException(`Apify ${context} failed: HTTP ${res.status}`);
    }

    const contentType = res.headers.get('content-type') ?? '';
    if (!contentType.includes('application/json')) {
      const text = await res.text().catch(() => '');
      this.logger.error(`Apify ${context} non-JSON: ${text.slice(0, 300)}`);
      throw new BadRequestException(`Apify ${context} returned non-JSON response`);
    }

    return res.json();
  }

  private sleep(ms: number) {
    return new Promise(r => setTimeout(r, ms));
  }
}
