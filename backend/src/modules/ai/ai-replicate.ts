import { randomUUID } from "crypto";
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
    const analysis = await this.client.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
                You are a senior brand designer, typography director, and visual marketing analyst.

                Analyze the provided decorative marketing image(s) with maximum attention to:
                (1) Typography specs (exact visual construction),
                (2) Decorative graphic elements (lines, shapes, overlays, gradients, textures),
                (3) Layout system and safe margins.
                
                IMPORTANT RULES:
                - Be objective. Do NOT invent details that are not visible.
                - If something is unclear, write "Not visible" or "Uncertain" and explain why.
                - When estimating sizes/positions, provide BOTH:
                  a) approximate pixels (px) and
                  b) relative percentages (%) of the full image width/height.
                - Use consistent terms: fill, stroke/outline, stroke thickness, shadow, tracking, line-height, alignment, case, font width (condensed/normal), corner radius, opacity, gradient direction, angle.
                
                Return the analysis in the following structure:
                
                0) Quick Summary (3–5 bullets): what makes this design recognizable.
                
                1) Overall Visual Style
                - Style keywords
                - Emotional tone
                - Target audience impression
                
                2) Composition & Layout (with measurements)
                - Layout structure (grid/asymmetrical/centered)
                - Main focal points (ranked)
                - Text zone(s): position (x%, y%), width%, height%
                - Safe margins: top/bottom/left/right in % and px
                - Depth cues (foreground/background separation)
                
                3) Color System
                - Dominant colors (approx HEX if possible)
                - Accent colors (approx HEX)
                - Background treatment (solid/photo/gradient/overlay)
                - Contrast strategy (how readability is ensured)
                
                4) Typography System (DETAILED)
                For EACH text block found, output:
                - Text content (exact)
                - Role: Headline / Subheadline / Body / CTA / Disclaimer
                - Font classification: sans/serif/script + condensed/extended
                - Case: uppercase/lowercase/title case
                - Weight estimate: light/regular/medium/bold/black
                - Fill: color (HEX-like) and opacity
                - Stroke/outline: yes/no; color; thickness (px); inside/outside/center (if inferable)
                - Shadow/glow: yes/no; color; blur; offset (px) (if visible)
                - Size: cap-height or letter height in px + % of image height
                - Tracking: tight/normal/wide (estimate) + reason
                - Line-height: px and relative (if multi-line)
                - Alignment: left/center/right + anchor point
                - Bounding box: x%, y%, w%, h% (top-left origin)
                - Readability notes: what supports contrast (dark overlay, blur, etc.)
                
                5) Decorative Graphic Elements (DETAILED)
                List EACH decorative element as a spec object:
                - Element type: diagonal stripe / line / frame / overlay / gradient / particle / icon etc.
                - Geometry: angle (degrees), position (x%, y%), size (w%, h%), thickness (px) if applicable
                - Color: HEX-like + opacity %
                - Edge treatment: sharp/soft, feather, blur
                - Layering: above/below subjects/text (if inferable)
                - Purpose: guides eye to..., supports brand..., increases contrast...
                
                6) Photography / Image Treatment (if photo-based)
                - Lighting type, time of day, weather cues
                - Camera feel: focal length impression, depth of field, motion blur
                - Color grading: cool/warm, contrast, vignette
                
                7) Marketing Intent
                - Primary message
                - Emotions triggered
                - What barrier is addressed
                - Positioning implied
                
                8) Rebuild Checklist (actionable)
                - 8–12 bullet checklist to recreate this style in a new creative.
                
                If typography is present, spend at least 40% of the total analysis on typography + decorative elements.
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
          `,
          resolution: "2K",
          safety_filter_level: "block_only_high",
          image_input: photos.map(photo => photo.url),
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

  async generateImage(prompt: string, businessId: string, photoUrls: string[]): Promise<any> {
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

    return key;
  }
}