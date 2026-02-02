import OpenAI from "openai";
import { Injectable } from "@nestjs/common";
import { randomUUID } from "crypto";

import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

@Injectable()
export class AiImageService {
  private readonly openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  private readonly s3 = new S3Client({
    region: process.env.AWS_REGION!,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });

  async generateImage(prompt: string): Promise<string> {
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

    return this.saveBase64Image(b64);
  }

  async saveBase64Image(b64: string): Promise<string> {
    const buffer = Buffer.from(b64, "base64");
    const fileName = `${randomUUID()}.png`;

    const key = `ai-images/${fileName}`;

    await this.s3.send(
      new PutObjectCommand({
        Bucket: process.env.AWS_S3_BUCKET!,
        Key: key,
        Body: buffer,
        ContentType: "image/png",
      })
    );

    return key;
  }
}