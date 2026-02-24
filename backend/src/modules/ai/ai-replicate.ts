import {randomUUID} from "crypto";

import OpenAI from "openai";
const Replicate = require("replicate");

import { Injectable } from '@nestjs/common';
import { S3Service } from "../../core/s3/s3.service";

@Injectable()
export class AiReplicate {
  private readonly replicate;
  private client: any;

  constructor(
    private readonly s3Service: S3Service,
  ) {
    this.replicate = new Replicate({
      auth: process.env.REPLICATE_API_KEY,
    });

    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateImageOpenAI(prompt: string, businessId: string, photoUrls: string[]): Promise<any> {
    console.log("GENERATE IMAGE OPENAI ...")
    console.log("PROMPT: ", prompt)
    console.log("PHOTOS: ", photoUrls)

    return "";

    // TODO: Analise decorators photos (Describe different details)
    // TODO: Send to Nano-banana

    /*    const analysis = await this.client.responses.create({
          model: "gpt-4.1",
          input: [
            {
              role: "user",
              content: [
                { type: "input_text", text: "Опиши стиль цього фото максимально детально" },
                ...photoUrls.map(url => ({
                  type: "input_image",
                  image_url: url,
                })),
              ]
            }
          ]
        });

        const response = await this.client.images.generate({
          model: "gpt-image-1",
          prompt: `
            ${analysis.output_text}
            Create a marketing image for product X
          `,
          size: "1024x1024"
        });

        const base64Image = response.data[0].b64_json;

        if (!base64Image) {
          throw new Error("Image generation failed");
        }

        const buffer = Buffer.from(base64Image, "base64");

        const fileName = `${randomUUID()}.png`;
        const key = `ai-images/${businessId}/${fileName}`;

        await this.s3Service.upload(
          key,
          buffer,
          "image/png"
        );

        return key;*/
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
          prompt: prompt,
          resolution: "1K",
          image_input: photoUrls,
          allow_fallback_model: true
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