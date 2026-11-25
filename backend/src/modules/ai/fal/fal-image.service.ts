import { randomUUID } from 'crypto';
import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { createFalClient, type FalClient } from '@fal-ai/client';
import { S3Service } from '../../../core/s3/s3.service';
import {
  FalGenerateInput,
  FalGenerateResult,
  FalModelConfig,
  FalApiResponseSchema,
} from './fal.types';
import { FAL_MODEL_CHAIN, FAL_PREVIEW_MODEL } from './fal-models.config';

const MAX_RETRIES = 2;
const BASE_DELAY_MS = 1000;

@Injectable()
export class FalImageService {
  private readonly logger = new Logger(FalImageService.name);
  private readonly fal: FalClient;

  constructor(private readonly s3Service: S3Service) {
    if (!process.env.FAL_AI_API_KEY) {
      this.logger.warn('FAL_AI_API_KEY is not set — fal.ai calls will fail');
    }

    this.fal = createFalClient({
      credentials: process.env.FAL_AI_API_KEY,
    });
  }

  async generateForPost(
    input: FalGenerateInput,
    businessId: string,
  ): Promise<FalGenerateResult> {
    return this.executeWithFallback(input, businessId, FAL_MODEL_CHAIN, 1);
  }

  async generatePreview(
    input: FalGenerateInput,
    businessId: string,
  ): Promise<FalGenerateResult> {
    const numImages = Math.min(Math.max(input.variants ?? 2, 2), 3);
    const start = Date.now();

    const { images, requestId } = await this.retryWithBackoff(() =>
      this.callModel(FAL_PREVIEW_MODEL, input, numImages),
    );

    const s3Keys = await this.downloadAndUploadToS3(
      images.map((img) => img.url),
      businessId,
    );

    const result: FalGenerateResult = {
      imageUrls: s3Keys,
      modelId: FAL_PREVIEW_MODEL.id,
      requestId,
      latencyMs: Date.now() - start,
    };

    this.logger.log(
      `Preview complete: model=${FAL_PREVIEW_MODEL.label}, images=${s3Keys.length}, ${result.latencyMs}ms`,
    );

    return result;
  }

  private async executeWithFallback(
    input: FalGenerateInput,
    businessId: string,
    models: FalModelConfig[],
    numImages: number,
  ): Promise<FalGenerateResult> {
    const start = Date.now();
    const errors: string[] = [];

    for (const model of models) {
      try {
        const { images, requestId } = await this.retryWithBackoff(() =>
          this.callModel(model, input, numImages),
        );

        const s3Keys = await this.downloadAndUploadToS3(
          images.map((img) => img.url),
          businessId,
        );

        const result: FalGenerateResult = {
          imageUrls: s3Keys,
          modelId: model.id,
          requestId,
          latencyMs: Date.now() - start,
        };

        this.logger.log(
          `Generation complete: model=${model.label}, fallbacks=${errors.length}, ${result.latencyMs}ms`,
        );

        return result;
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error);
        errors.push(`${model.label}: ${msg}`);
        this.logger.warn(`Model ${model.label} failed after retries: ${msg}`);
      }
    }

    throw new InternalServerErrorException(
      `All fal.ai models failed: ${errors.join('; ')}`,
    );
  }

  private async callModel(
    model: FalModelConfig,
    input: FalGenerateInput,
    numImages: number,
  ): Promise<{
    images: { url: string; width: number; height: number }[];
    requestId: string;
  }> {
    const payload = model.adapt(input, numImages);
    const start = Date.now();

    const result = await this.fal.subscribe(model.id, {
      input: payload,
      logs: false,
    });

    const parsed = FalApiResponseSchema.parse(result.data);

    this.logger.log(
      `Model call: ${model.label}, ${Date.now() - start}ms, images=${parsed.images.length}, requestId=${result.requestId}`,
    );

    return { images: parsed.images, requestId: result.requestId };
  }

  private async retryWithBackoff<T>(fn: () => Promise<T>): Promise<T> {
    for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
      try {
        return await fn();
      } catch (error) {
        if (attempt < MAX_RETRIES && this.isRetryableError(error)) {
          const delay = BASE_DELAY_MS * Math.pow(2, attempt);
          this.logger.warn(
            `Retryable error (attempt ${attempt + 1}/${MAX_RETRIES + 1}), waiting ${delay}ms`,
          );
          await this.sleep(delay);
        } else {
          throw error;
        }
      }
    }

    throw new Error('Retry loop exited unexpectedly');
  }

  private isRetryableError(error: unknown): boolean {
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      if (msg.includes('429') || msg.includes('rate limit')) return true;
      if (
        msg.includes('500') ||
        msg.includes('502') ||
        msg.includes('503') ||
        msg.includes('504')
      )
        return true;
      if (
        msg.includes('timeout') ||
        msg.includes('econnreset') ||
        msg.includes('enotfound')
      )
        return true;
    }
    return false;
  }

  private async downloadAndUploadToS3(
    imageUrls: string[],
    businessId: string,
  ): Promise<string[]> {
    return Promise.all(
      imageUrls.map(async (url) => {
        const response = await fetch(url);
        if (!response.ok) {
          throw new InternalServerErrorException(
            `Failed to download image: HTTP ${response.status}`,
          );
        }
        const buffer = Buffer.from(await response.arrayBuffer());
        const key = `ai-images/${businessId}/${randomUUID()}.png`;
        await this.s3Service.upload(key, buffer, 'image/png');
        return key;
      }),
    );
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
