import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { S3Service } from '../../core/s3/s3.service';
import { randomUUID } from 'crypto';
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createHiggsfieldClient } = require('@higgsfield/client/v2');

interface HiggsfieldsJobResult {
  raw: { url: string };
  min: { url: string };
}

interface HiggsfieldsJob {
  id: string;
  job_set_type: string;
  status: 'queued' | 'in_progress' | 'completed' | 'failed' | 'nsfw';
  results: HiggsfieldsJobResult | null;
}

interface HiggsfieldsResponse {
  id: string;
  type: string;
  created_at: string;
  jobs: HiggsfieldsJob[];
  input_params: Record<string, unknown>;
}

interface HiggsfieldsClient {
  subscribe(
    endpoint: string,
    options: { input: Record<string, unknown>; withPolling?: boolean },
  ): Promise<HiggsfieldsResponse>;
}

interface HiggsfieldsStatusResponse {
  status: 'queued' | 'in_progress' | 'completed' | 'failed' | 'nsfw';
  request_id: string;
  status_url: string;
  cancel_url: string;
  video?: { url: string };
  images?: Array<{ url: string }>;
}

export interface HiggsfieldsResult {
  id: string;
  status: string;
  resultUrl: string;
}

const TERMINAL_STATUSES = new Set(['completed', 'failed', 'nsfw']);
const POLL_INTERVAL = 5_000;
const MAX_POLL_TIME = 10 * 60 * 1_000;
const BASE_URL = 'https://platform.higgsfield.ai';

@Injectable()
export class HiggsfieldsService {
  private readonly logger = new Logger(HiggsfieldsService.name);
  private readonly client: HiggsfieldsClient;
  private readonly authHeader: string;

  constructor(
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.getOrThrow<string>('HIGGSFIELD_API_KEY');
    const apiSecret = this.configService.getOrThrow<string>('HIGGSFIELD_API_KEY_SECRET');

    this.authHeader = `Key ${apiKey}:${apiSecret}`;

    this.client = createHiggsfieldClient({
      credentials: `${apiKey}:${apiSecret}`,
    });
  }

  async generateVideo(params: {
    prompt: string;
    sourceUrl?: string;
  }): Promise<string> {
    const modelId =
      this.configService.get<string>('HIGGSFIELD_MODEL_ID') ??
      'dop-turbo';

    const result = await this.runGeneration(modelId, params);

    return result.resultUrl;
  }

  async generateAndSaveVideo(params: {
    prompt: string;
    businessId: string;
    sourceUrl?: string;
  }): Promise<string> {
    const videoUrl = await this.generateVideo({
      prompt: params.prompt,
      sourceUrl: params.sourceUrl,
    });

    return await this.downloadAndSaveVideo(videoUrl, params.businessId);
  }

  private async runGeneration(
    model: string,
    params: { prompt: string; sourceUrl?: string },
  ): Promise<HiggsfieldsResult> {
    const videoParams: Record<string, unknown> = {
      model,
      prompt: params.prompt,
    };

    if (params.sourceUrl) {
      videoParams.input_images = [
        { type: 'image_url', image_url: params.sourceUrl },
      ];
    }

    try {
      const initial = await this.client.subscribe('/v1/image2video/dop', {
        input: { params: videoParams },
      });

      const response = await this.pollUntilDone(initial);

      if (response.status === 'nsfw') {
        throw new InternalServerErrorException(
          'Video generation failed: content rejected by moderation',
        );
      }

      if (response.status !== 'completed') {
        this.logger.error(`Unexpected status after polling: status=${response.status}`);
        throw new InternalServerErrorException(
          `Video generation failed: status=${response.status}`,
        );
      }

      const resultUrl = response.video?.url ?? response.images?.[0]?.url;
      if (!resultUrl) {
        throw new InternalServerErrorException(
          'Video generation failed: no result URL',
        );
      }

      return {
        id: response.request_id,
        status: 'completed',
        resultUrl,
      };
    } catch (err) {
      if (err instanceof InternalServerErrorException) throw err;
      const message = err instanceof Error ? err.message : String(err);
      this.logger.error(`Higgsfield SDK error: ${message}`);
      throw new InternalServerErrorException(
        `Video generation failed: ${message}`,
      );
    }
  }


  private async pollUntilDone(
    initial: HiggsfieldsResponse,
  ): Promise<HiggsfieldsStatusResponse> {
    // Якщо subscribe вже повернув termіnal — конвертуємо у status-формат
    const initialJobStatus = initial.jobs[0]?.status;
    if (initialJobStatus && TERMINAL_STATUSES.has(initialJobStatus)) {
      return {
        status: initialJobStatus,
        request_id: initial.id,
        status_url: '',
        cancel_url: '',
        video: initial.jobs[0]?.results?.raw
          ? { url: initial.jobs[0].results.raw.url }
          : undefined,
      };
    }

    this.logger.log(`Polling job ${initial.id} (initial status: ${initialJobStatus})`);

    const startTime = Date.now();
    const statusUrl = `${BASE_URL}/requests/${initial.id}/status`;

    while (Date.now() - startTime < MAX_POLL_TIME) {
      await new Promise((r) => setTimeout(r, POLL_INTERVAL));

      const res = await fetch(statusUrl, {
        headers: { Authorization: this.authHeader },
      });

      if (!res.ok) {
        if (res.status >= 500) {
          this.logger.warn(`Status poll returned ${res.status}, retrying…`);
          continue;
        }
        throw new InternalServerErrorException(
          `Status poll failed: HTTP ${res.status}`,
        );
      }

      const data = (await res.json()) as HiggsfieldsStatusResponse;
      this.logger.debug(`Poll ${initial.id}: status=${data.status}`);

      if (TERMINAL_STATUSES.has(data.status)) {
        return data;
      }
    }

    throw new InternalServerErrorException(
      'Video generation timed out after 10 minutes',
    );
  }

  async downloadAndSaveVideo(
    videoUrl: string,
    businessId: string,
  ): Promise<string> {
    const response = await fetch(videoUrl);
    if (!response.ok) {
      throw new InternalServerErrorException(`Failed to download video: ${response.status}`);
    }
    const buffer = Buffer.from(await response.arrayBuffer());
    const key = `ai-videos/${businessId}/${randomUUID()}.mp4`;
    await this.s3Service.upload(key, buffer, 'video/mp4');
    return key;
  }
}
