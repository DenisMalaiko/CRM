import OpenAI from "openai";
import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";
import { S3Service } from "../../core/s3/s3.service";

@Injectable()
export class AiImageService {
  private readonly openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  constructor(
    private readonly s3Service: S3Service,
  ) {}

  async generateImage(prompt: string, businessId: string): Promise<string> {
    console.log("GENERATE IMAGE...")

    const result = await this.openai.images.generate({
      model: "gpt-image-1",
      prompt,
      size: "1024x1024",
    });

    console.log("SUCCESSFULLY FINISHED GENERATING IMAGE")

    const b64 = result.data?.[0]?.b64_json;

    if (!b64) {
      throw new Error("Image generation failed");
    }

    return this.saveBase64Image(b64, businessId);
  }

  async saveBase64Image(b64: string, businessId: string): Promise<string> {
    const buffer = Buffer.from(b64, "base64");
    const fileName = `${randomUUID()}.png`;

    const key = `ai-images/${businessId}/${fileName}`;

    await this.s3Service.upload(
      key,
      buffer,
      "image/png"
    );

    return key;
  }
}