import {randomUUID} from "crypto";
import { GalleryPhotoType } from "@prisma/client";

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

  async generateImageOpenAI(prompt: string, businessId: string, photos: { url: string, type: GalleryPhotoType }[]): Promise<any> {
    console.log("-------------")
    console.log("GENERATE IMAGE OPENAI ...")

    console.log("PROMPT: ", prompt)

    const analysis = await this.client.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "user",
          content: [
            { type: "input_text",
              text: `
                You are a senior brand designer and visual marketing analyst.
                
                Analyze the decorative images provided.
                
                Provide a detailed, structured analysis with the following sections:
                
                1. Overall Visual Style
                   - Minimalistic / Luxury / Vintage / Modern / Playful / etc.
                   - Emotional tone
                   - Target audience impression
                
                2. Composition & Layout
                   - Layout structure (centered, grid, asymmetrical, etc.)
                   - Balance and spacing
                   - Focal points
                
                3. Colors
                   - Dominant colors
                   - Accent colors
                   - Background color
                   - Color contrast (high/low)
                   - Mood created by the palette
                
                4. Typography (if present)
                   - Font style (serif, sans-serif, script, bold, condensed, etc.)
                   - Estimated font weight (light, regular, bold)
                   - Font size hierarchy (headline vs body)
                   - Typography mood
                   - Readability
                
                5. Graphic & Design Elements
                   - Decorative elements (shapes, frames, icons, patterns)
                   - Product placement style
                   - Shadows / gradients / textures
                
                6. Ingredients (if visible)
                   - Listed ingredients
                   - How they are visually presented
                   - Emphasis level
                
                7. Marketing Intent
                   - What emotion is being triggered?
                   - What problem is being solved visually?
                   - What type of product positioning is implied?
                
                Be objective. 
                Do not invent details that are not visible.
                If something is not visible, explicitly state "Not visible".
                `
                },
                ...photos.map(photo => ({
                  type: "input_image",
                  image_url: photo.url,
                })),
          ]
        }
      ]
    });

    console.log("Analysis text ", analysis.output_text)

    const NANO_BANANO = "google/nano-banana-pro";

    const stream = await this.replicate.run(
      NANO_BANANO,
      {
        input: {
          prompt: `
            You are a professional commercial product photographer and art director.

            Generate a high-quality decorative product photo based on the provided reference images.
            
            MAIN GOAL:
            Create a visually appealing, premium-looking product image suitable for e-commerce and social media advertising.
            
            PRODUCT & SCENE:
            ${prompt}
            
            DECORATION & STYLE GUIDELINES:
            Use the following decorative style and visual rules extracted from analysis:
            ${analysis.output_text}
            
            COMPOSITION:
            - Clean, well-balanced composition
            - Clear focal point on the product
            - Decorative elements support the product, not overpower it
            - Modern commercial photography style
            
            LIGHTING:
            - Soft, diffused studio lighting
            - No harsh shadows
            - Natural highlights on product edges
            
            COLORS:
            - Consistent color palette
            - Harmonize background and decoration colors
            - Avoid overly saturated or clashing colors
            
            CAMERA:
            - Professional DSLR look
            - Shallow depth of field
            - Sharp focus on product
            - High dynamic range
            
            QUALITY:
            - Ultra realistic
            - High resolution
            - Clean background
            - No visual noise
            - No distortions
            
            NEGATIVE CONSTRAINTS:
            - No text overlays
            - No watermarks
            - No logos
            - No hands or people unless explicitly requested
            - No cluttered background
            - No low-quality artifacts
          `,
          resolution: "2K",
          safety_filter_level: "block_only_high",
          image_input: photos.filter(x => x.type === GalleryPhotoType.Image).map(photo => photo.url),
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