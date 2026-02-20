import {randomUUID} from "crypto";

const Replicate = require("replicate");

import { Injectable } from '@nestjs/common';
import { S3Service } from "../../core/s3/s3.service";

@Injectable()
export class AiReplicate {
  private readonly replicate;

  constructor(
    private readonly s3Service: S3Service,
  ) {
    this.replicate = new Replicate({
      auth: process.env.REPLICATE_API_KEY,
    });
  }

  async generateImage(prompt: string, businessId: string, photoUrls: string[]): Promise<any> {
    console.log("GENERATE IMAGE REPLICATE ...")
    console.log("PROMPT: ", prompt)
    console.log("PHOTOS: ", photoUrls)
    const NANO_BANANO = "google/nano-banana-pro";

    const stream = await this.replicate.run(
      NANO_BANANO,
      {
        input: {
          prompt,
          image_input: photoUrls
        },
      }
    );

    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }

    const buffer = Buffer.concat(chunks);

    const fileName = `${randomUUID()}.png`;

    const key = `ai-images/${businessId}/${fileName}`;

    await this.s3Service.upload(
      key,
      buffer,
      "image/png"
    );

    console.log("----------")
    console.log("KEY ", `https://crm-marketing-ai-bucket.s3.eu-north-1.amazonaws.com/${key}`);
    console.log("----------")

    return key;
  }
}