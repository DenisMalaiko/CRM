import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { ApifyClient } from 'apify-client';
import * as process from 'node:process';


@Injectable()
export class ApifyService {
  private readonly logger = new Logger(ApifyService.name);

  private readonly client = new ApifyClient({
    token: process.env.APIFY_API_KEY!,
    maxRetries: 8, // ретраї на 5xx/429/мережеві фейли з експоненційним backoff
  });

  async runActor<T>(actor: string, input: any): Promise<T[]> {
    this.logger.log(`Starting Apify actor: ${actor}`);

    let run;
    try {
      run = await this.client.actor(actor).call(input, {
        // Можеш налаштувати під свої потреби:
        // timeout: 600,    // макс. час виконання в секундах
        // memory: 2048,    // МБ оперативки для actor'а
        // waitSecs: 600,   // макс. час очікування завершення на стороні клієнта
      });
    } catch (err: any) {
      this.logger.error(`Apify actor start failed: ${err.message}`);
      throw new BadRequestException(err.message || 'Failed to run actor');
    }

    if (run.status !== 'SUCCEEDED') {
      this.logger.error(`Apify run ${run.id} ended with status ${run.status}`);
      throw new BadRequestException(`Apify run ${run.status.toLowerCase()}`);
    }

    this.logger.log(`Apify run ${run.id} succeeded, fetching dataset`);

    const { items } = await this.client
      .dataset(run.defaultDatasetId)
      .listItems();

    if (!Array.isArray(items) || items.length === 0) {
      return [];
    }

    const first = items[0] as any;
    if (first?.error) {
      if (first.errorCode === 'PAGE_PRIVATE') {
        throw new BadRequestException('Page is private');
      }
      if (first.errorCode === 'ADS_NOT_FOUND') {
        throw new BadRequestException('Ads not found');
      }
      throw new BadRequestException('No data found for this page');
    }

    return items as T[];
  }
}



/*
import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import * as process from 'node:process';

class ApifyHttpError extends Error {
  constructor(public status: number, public body: string, message: string) {
    super(message);
  }
}

@Injectable()
export class ApifyService {
  private readonly logger = new Logger(ApifyService.name);
  private readonly apifyApiKey: string = process.env.APIFY_API_KEY!;
  private readonly apifyApiURL: string = 'https://api.apify.com/v2';

  private readonly POLL_INTERVAL_MS = 3000;
  private readonly MAX_POLL_ATTEMPTS = 200;
  private readonly INITIAL_DELAY_MS = 2000;
  private readonly RETRIABLE_STATUSES = new Set([408, 429, 500, 502, 503, 504]);

  async runActor<T>(actor: string, input: any): Promise<T[]> {
    const runUrl = `${this.apifyApiURL}/acts/${actor}/runs?token=${this.apifyApiKey}`;

    const runRes = await fetch(runUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(input),
    });

    const runData = await this.safeJson(runRes, 'start actor');

    if (runData.error) {
      this.logger.error(`Apify start error: ${runData.error.message}`);
      throw new BadRequestException(runData.error.message || 'Failed to run actor');
    }

    const runId = runData.data?.id;
    if (!runId) {
      throw new BadRequestException('Apify did not return run id');
    }

    const run = await this.waitForRun(runId);

    const datasetRes = await fetch(
      `${this.apifyApiURL}/datasets/${run.defaultDatasetId}/items?token=${this.apifyApiKey}`
    );
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
        if (err instanceof ApifyHttpError && this.RETRIABLE_STATUSES.has(err.status)) {
          // Тимчасова помилка — повторяємо без зайвого шуму
          this.logger.debug(
            `Poll attempt ${attempt + 1} got HTTP ${err.status}, retrying`
          );
          await this.sleep(this.POLL_INTERVAL_MS);
          continue;
        }

        if (err instanceof TypeError) {
          // Мережеві помилки (fetch failed, ECONNRESET) — теж ретраїмо
          this.logger.debug(
            `Poll attempt ${attempt + 1} network error: ${err.message}, retrying`
          );
          await this.sleep(this.POLL_INTERVAL_MS);
          continue;
        }

        // Нефатально-нелогічна помилка (401, 404, etc.) — кидаємо вище
        throw err;
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
      throw new ApifyHttpError(
        res.status,
        text,
        `Apify ${context} failed: HTTP ${res.status}`
      );
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
*/
