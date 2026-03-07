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
    const decorations = photos.filter(p => p.type === GalleryPhotoType.Decoration);
    const posts = photos.filter(p => p.type === GalleryPhotoType.Post);
    const businessPhotos = photos.filter(p => p.type === GalleryPhotoType.Image);
    const content: any[] = [
      {
        type: "input_text",
        text: `
          You are a senior brand designer, visual marketing analyst and commercial art director.
          
          You will receive three types of images:
          
          1) DECORATIONS – brand elements such as logos, shapes, overlays.
          2) POSTS – marketing post designs that define the visual style.
          3) BUSINESS PHOTOS – real photos of products, people or environment.
          
          Analyze each type differently according to the instructions provided before each image group.
          
          IMPORTANT:
          - Do not invent details that are not visible.
          - If something is unclear write "Not visible".
          - Focus on extracting reusable visual rules.
          `
      }
    ];

    if (decorations.length) {
      content.push({
        type: "input_text",
        text: `
          DECORATIONS ANALYSIS

          These images contain brand decorative elements.
          
          Extract the BRAND VISUAL LANGUAGE:
          
          - logo style
          - graphic shapes
          - decorative motifs
          - overlays
          - gradients
          - textures
          - brand color palette
          - corner radius
          - stroke style
          - shadow style
          
          Describe reusable graphic elements that define the brand identity.
        `
      });

      decorations.forEach((photo: any) => {
        const fileName = this.getFileName(photo.url);

        content.push({
          type: "input_text",
          text: `
            Decoration reference.
            
            IMAGE_ID: ${fileName}
            
            Main element in this image:
            ${photo.description ?? "Not specified"}
            
            Focus only on this element.
            Ignore other background details.
           `
        });

        content.push({
          type: "input_image",
          image_url: photo.url
        });
      });
    }

    if (posts.length) {
      content.push({
        type: "input_text",
        text: `
          POST DESIGN SYSTEM ANALYSIS
          
          You are analyzing a MARKETING POST.
          
          Your main task is to extract the COMPLETE TYPOGRAPHY SYSTEM.
          
          Spend at least 50% of the analysis on text styling.
          
          For EVERY text block visible in the image extract the following:
          
          TEXT BLOCK ANALYSIS
          
          For each block return:
          
          - textContent (exact text if readable)
          - role (headline / subheadline / CTA / caption)
          
          FONT STYLE
          - fontClassification (sans / serif / display)
          - fontWidth (condensed / normal / wide)
          - weight (light / regular / bold / extra bold)
          
          TEXT SHAPE
          - case (uppercase / lowercase / title)
          - alignment (left / center / right)
          
          TEXT COLOR
          - fillColor (approx HEX)
          - opacity
          
          OUTLINE / STROKE
          - hasStroke (true / false)
          - strokeColor
          - strokeWidth (approx px)
          
          SHADOW
          - hasShadow (true / false)
          - shadowColor
          - shadowBlur
          - shadowOffset
          
          SIZE
          - approximateTextHeightPx
          - approximateTextHeightPercentOfImage
          
          POSITION
          - boundingBox
            - xPercent
            - yPercent
            - widthPercent
            - heightPercent
          
          READABILITY SUPPORT
          - background blur
          - dark overlay
          - contrast strategy
          
          IMPORTANT RULES
          
          - Do NOT skip text blocks.
          - If text is visible but unreadable still analyze style.
          - Estimate sizes visually if necessary.
          - Be precise with stroke and shadow.
        `
      });

      posts.forEach((photo: any) => {
        const fileName = this.getFileName(photo.url);

        content.push({
          type: "input_text",
          text: `
            Marketing post reference.
            
            IMAGE_ID: ${fileName}
            
            Important element in this image:
            ${photo.description ?? "Full post design"}
            
            Focus on:
            - typography
            - layout
            - decorative overlays
            - spacing
            `
        });

        content.push({
          type: "input_image",
          image_url: photo.url
        });
      });
    }

    if (businessPhotos.length) {
      content.push({
        type: "input_text",
        text: `
          BUSINESS PHOTO ANALYSIS

          These images show the business environment or products.
          
          Extract useful information for scene generation:
          
          - main objects
          - product type
          - environment
          - lighting style
          - camera perspective
          - color temperature
          - background context
          
          This information will be used to generate new marketing visuals.
        `
      });

      businessPhotos.forEach((photo: any) => {
        const fileName = this.getFileName(photo.url);

        content.push({
          type: "input_text",
          text: `
            Business photo.
            
            IMAGE_ID: ${fileName}
            
            Main subject:
            ${photo.description ?? "Business environment or product"}
            
            This photo may be used as a visual reference for scene generation.
          `
        });

        content.push({
          type: "input_image",
          image_url: photo.url
        });
      });
    }

    content.push({
      type: "input_text",
      text: `
        OUTPUT FORMAT
        
        Return the result strictly as JSON.
        
        Each analyzed image must reference its IMAGE_ID.
        
        Structure:
        
        {
          "decorations": [
            {
              "imageId": "IMAGE_ID",
              "brandStyle": {
                "logoStyle": "",
                "colorPalette": [],
                "decorativeMotifs": [],
                "gradients": [],
                "textures": [],
                "graphicElements": []
              }
            }
          ],
        
          "posts": [
            {
              "imageId": "IMAGE_ID",
              "postDesignSystem": {
                "typography": {
                  "textBlocks": [
                    {
                      "role": "",
                      "textContent": "",
                      "fontClassification": "",
                      "fontWidth": "",
                      "weight": "",
                      "case": "",
                      "alignment": "",
                      "fillType": "solid | outline",
                      "fillColor": "",
                      "hasStroke": false,
                      "strokeColor": "",
                      "strokeWidth": "",
                      "hasShadow": false,
                      "shadowColor": "",
                      "shadowBlur": "",
                      "shadowOffset": "",
                      "approximateTextHeightPx": "",
                      "approximateTextHeightPercentOfImage": "",
                      "boundingBox": {}
                    }
                  ]
                }
                "layout": {},
                "colorSystem": {},
                "decorativeGraphics": {},
                "compositionRules": {},
                "marketingIntent": ""
              }
            }
          ],
        
          "businessPhotos": [
            {
              "imageId": "IMAGE_ID",
              "sceneContext": {
                "objects": [],
                "environment": "",
                "lighting": "",
                "cameraStyle": "",
                "colorTemperature": ""
              }
            }
          ]
        }
        
        IMPORTANT RULES
        
        - Each entry must reference the IMAGE_ID that was provided earlier.
        - Do not merge multiple images into one analysis.
        - If multiple images exist, create multiple entries.
        - Return ONLY valid JSON.
      `
    });

    const analysis = await this.client.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "user",
          content
        }
      ]
    });

    const designSystem = analysis.output_text;

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
            ${designSystem}
            
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

  async generateStoryImageOpenAI(
    prompt: string,
    businessId: string,
    photos: { url: string, type: GalleryPhotoType }[]
  ) {
    const decorations = photos.filter(p => p.type === GalleryPhotoType.Decoration);
    const posts = photos.filter(p => p.type === GalleryPhotoType.Post);
    const businessPhotos = photos.filter(p => p.type === GalleryPhotoType.Image);
    const content: any[] = [
      {
        type: "input_text",
        text: `
          You are a senior brand designer, visual marketing analyst and commercial art director.
          
          You will receive three types of images:
          
          1) DECORATIONS – brand elements such as logos, shapes, overlays.
          2) POSTS – marketing post designs that define the visual style.
          3) BUSINESS PHOTOS – real photos of products, people or environment.
          
          Analyze each type differently according to the instructions provided before each image group.
          
          IMPORTANT:
          - Do not invent details that are not visible.
          - If something is unclear write "Not visible".
          - Focus on extracting reusable visual rules.
          `
      }
    ];

    if (decorations.length) {
      content.push({
        type: "input_text",
        text: `
          DECORATIONS ANALYSIS

          These images contain brand decorative elements.
          
          Extract the BRAND VISUAL LANGUAGE:
          
          - logo style
          - graphic shapes
          - decorative motifs
          - overlays
          - gradients
          - textures
          - brand color palette
          - corner radius
          - stroke style
          - shadow style
          
          Describe reusable graphic elements that define the brand identity.
        `
      });

      decorations.forEach((photo: any) => {
        const fileName = this.getFileName(photo.url);

        content.push({
          type: "input_text",
          text: `
            Decoration reference.
            
            IMAGE_ID: ${fileName}
            
            Main element in this image:
            ${photo.description ?? "Not specified"}
            
            Focus only on this element.
            Ignore other background details.
           `
        });

        content.push({
          type: "input_image",
          image_url: photo.url
        });
      });
    }

    if (posts.length) {
      content.push({
        type: "input_text",
        text: `
          POST DESIGN SYSTEM ANALYSIS
          
          You are analyzing a MARKETING POST.
          
          Your main task is to extract the COMPLETE TYPOGRAPHY SYSTEM.
          
          Spend at least 50% of the analysis on text styling.
          
          For EVERY text block visible in the image extract the following:
          
          TEXT BLOCK ANALYSIS
          
          For each block return:
          
          - textContent (exact text if readable)
          - role (headline / subheadline / CTA / caption)
          
          FONT STYLE
          - fontClassification (sans / serif / display)
          - fontWidth (condensed / normal / wide)
          - weight (light / regular / bold / extra bold)
          
          TEXT SHAPE
          - case (uppercase / lowercase / title)
          - alignment (left / center / right)
          
          TEXT COLOR
          - fillColor (approx HEX)
          - opacity
          
          OUTLINE / STROKE
          - hasStroke (true / false)
          - strokeColor
          - strokeWidth (approx px)
          
          SHADOW
          - hasShadow (true / false)
          - shadowColor
          - shadowBlur
          - shadowOffset
          
          SIZE
          - approximateTextHeightPx
          - approximateTextHeightPercentOfImage
          
          POSITION
          - boundingBox
            - xPercent
            - yPercent
            - widthPercent
            - heightPercent
          
          READABILITY SUPPORT
          - background blur
          - dark overlay
          - contrast strategy
          
          IMPORTANT RULES
          
          - Do NOT skip text blocks.
          - If text is visible but unreadable still analyze style.
          - Estimate sizes visually if necessary.
          - Be precise with stroke and shadow.
        `
      });

      posts.forEach((photo: any) => {
        const fileName = this.getFileName(photo.url);

        content.push({
          type: "input_text",
          text: `
            Marketing post reference.
            
            IMAGE_ID: ${fileName}
            
            Important element in this image:
            ${photo.description ?? "Full post design"}
            
            Focus on:
            - typography
            - layout
            - decorative overlays
            - spacing
            `
        });

        content.push({
          type: "input_image",
          image_url: photo.url
        });
      });
    }

    if (businessPhotos.length) {
      content.push({
        type: "input_text",
        text: `
          BUSINESS PHOTO ANALYSIS

          These images show the business environment or products.
          
          Extract useful information for scene generation:
          
          - main objects
          - product type
          - environment
          - lighting style
          - camera perspective
          - color temperature
          - background context
          
          This information will be used to generate new marketing visuals.
        `
      });

      businessPhotos.forEach((photo: any) => {
        const fileName = this.getFileName(photo.url);

        content.push({
          type: "input_text",
          text: `
            Business photo.
            
            IMAGE_ID: ${fileName}
            
            Main subject:
            ${photo.description ?? "Business environment or product"}
            
            This photo may be used as a visual reference for scene generation.
          `
        });

        content.push({
          type: "input_image",
          image_url: photo.url
        });
      });
    }

    content.push({
      type: "input_text",
      text: `
        OUTPUT FORMAT
        
        Return the result strictly as JSON.
        
        Each analyzed image must reference its IMAGE_ID.
        
        Structure:
        
        {
          "decorations": [
            {
              "imageId": "IMAGE_ID",
              "brandStyle": {
                "logoStyle": "",
                "colorPalette": [],
                "decorativeMotifs": [],
                "gradients": [],
                "textures": [],
                "graphicElements": []
              }
            }
          ],
        
          "posts": [
            {
              "imageId": "IMAGE_ID",
              "postDesignSystem": {
                "typography": {
                  "textBlocks": [
                    {
                      "role": "",
                      "textContent": "",
                      "fontClassification": "",
                      "fontWidth": "",
                      "weight": "",
                      "case": "",
                      "alignment": "",
                      "fillType": "solid | outline",
                      "fillColor": "",
                      "hasStroke": false,
                      "strokeColor": "",
                      "strokeWidth": "",
                      "hasShadow": false,
                      "shadowColor": "",
                      "shadowBlur": "",
                      "shadowOffset": "",
                      "approximateTextHeightPx": "",
                      "approximateTextHeightPercentOfImage": "",
                      "boundingBox": {}
                    }
                  ]
                }
                "layout": {},
                "colorSystem": {},
                "decorativeGraphics": {},
                "compositionRules": {},
                "marketingIntent": ""
              }
            }
          ],
        
          "businessPhotos": [
            {
              "imageId": "IMAGE_ID",
              "sceneContext": {
                "objects": [],
                "environment": "",
                "lighting": "",
                "cameraStyle": "",
                "colorTemperature": ""
              }
            }
          ]
        }
        
        IMPORTANT RULES
        
        - Each entry must reference the IMAGE_ID that was provided earlier.
        - Do not merge multiple images into one analysis.
        - If multiple images exist, create multiple entries.
        - Return ONLY valid JSON.
      `
    });

    const analysis = await this.client.responses.create({
      model: "gpt-4.1",
      input: [
        {
          role: "user",
          content
        }
      ]
    });

    const designSystem = analysis.output_text;

    const NANO_BANANO = "google/nano-banana-pro";

    const stream = await this.replicate.run(
      NANO_BANANO,
      {
        input: {
          prompt: `
        You are a senior social media art director specializing in Instagram Story creatives.

        Generate a vertical Instagram Story image.

        STORY CONTEXT:
        ${prompt}

        STYLE GUIDELINES:
        Use the following brand design system extracted from analysis:
        ${designSystem}

        FORMAT:
        - Vertical 9:16
        - Instagram story safe margins
        - Leave space for UI (top and bottom)

        COMPOSITION:
        - One clear focal subject
        - Large readable headline area
        - Minimal distractions
        - Clean hierarchy

        TEXT PLACEMENT:
        - Headline area in upper-middle section
        - Large readable typography
        - Avoid placing text near top 10% or bottom 15% of frame

        VISUAL STYLE:
        - Modern social media advertising
        - High contrast for readability
        - Bold composition
        - Eye-catching layout

        LIGHTING:
        - Soft cinematic lighting
        - Clear subject separation

        COLORS:
        - Follow brand palette
        - Strong contrast for text readability

        CAMERA:
        - Professional photography look
        - Shallow depth of field

        QUALITY:
        - Ultra realistic
        - High resolution
        - Clean background
        - No visual noise
      `,
          resolution: "2K",
          aspect_ratio: "9:16",
          safety_filter_level: "block_only_high",
          image_input: photos.map(p => p.url),
          allow_fallback_model: true
        }
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

  getFileName(url: string) {
    return url.split("/").pop();
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