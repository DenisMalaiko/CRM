import { randomUUID } from "crypto";
import { GalleryPhotoType } from "@prisma/client";
import { inspect } from "util";
import * as process from "node:process";

import OpenAI from "openai";
const Replicate = require("replicate");

import { jsonrepair } from "jsonrepair";

import { Injectable } from '@nestjs/common';
import { S3Service } from "../../core/s3/s3.service";
import {
  postImageRoleBlock,
  postImageDecorationBlock,
  postImageDecorationDescriptionBlock,
  postImagePostBlock,
  postImagePostDescriptionBlock,
  postImageBusinessBlock,
  postImageBusinessDescriptionBlock,
  postImageOutputBlock,
  postImageHasRealText,
  postImageDoesntHaveRealText,
  postImageNoReferenceImages,
  postImageReferenceImages,
  postImageTextRenderingPrompt,
  postImageSuppressionPrompt,
  postImageCriticalRenderingRule,
  postImageTextGeneration,
  postImageTextSuppressionRule,
  postImageComposition,
  postImageLighting,
  postImageCamera,
  postImageQuality,
  postImageReferenceDesignSystem,
  postImageTemplateReplicationMode,
  postImageProfessionalContext
} from "./prompts/post/image";

import {
  storyImageRoleBlock,
  storyImageDecorationBlock,
  storyImageDecorationDescriptionBlock,
  storyImageStoryBlock,
  storyImageStoryDescriptionBlock,
  storyImageBusinessBlock,
  storyImageBusinessDescriptionBlock,
  storyImageOutputBlock,
  storyImageHasRealText,
  storyImageDoesntHaveRealText,
  storyImageReferenceImages,
  storyImageNoReferenceImages,
  storyImageProfessionalContext,
  storyImageTemplateReplicationMode,
  storyImageReferenceDesignSystem,
  storyImageTextRenderingPrompt,
  storyImageSuppressionPrompt,
  storyImageCriticalRenderingRule,
  storyImageTextGeneration,
  storyImageTextSuppressionRule,
  storyImageComposition,
  storyImageLighting,
  storyImageCamera,
  storyImageQuality
} from "./prompts/story/image";

@Injectable()
export class AiReplicateService {
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

  async generateImageOpenAI(prompt: any, businessId: string, photos: { url: string, type: GalleryPhotoType }[]): Promise<any> {
    const decorations = photos.filter(p => p.type === GalleryPhotoType.Decoration);
    const posts = photos.filter(p => p.type === GalleryPhotoType.Post);
    const businessPhotos = photos.filter(p => p.type === GalleryPhotoType.Image);
    const hasReferenceImages = decorations.length || posts.length || businessPhotos.length;

    let designSystem: any;
    let textRule = ``;
    let referenceRule = ``;
    let isTextEnabled = false;

    if(hasReferenceImages) {
      const content: any = this.generatePostContentForAnalytics(decorations, posts, businessPhotos);
      const response = await this.client.responses.create({
        model: "gpt-4.1",
        input: [
          {
            role: "user",
            content
          }
        ]
      });

      const parsedDesign = this.safeParseJson(response.output_text);
      const hasRealText = this.hasRealTextInPosts(parsedDesign);

      designSystem = inspect(parsedDesign, { depth: null, colors: true });
      isTextEnabled = hasRealText;
      textRule = hasRealText ? postImageHasRealText() : postImageDoesntHaveRealText();
      referenceRule = postImageReferenceImages();
    } else {
      textRule = postImageDoesntHaveRealText();
      referenceRule = postImageNoReferenceImages();
    }

    console.log("-----------")
    console.log("ACTOR ", process.env.REPLICATE_API_ACTOR)
    console.log("-----------")

    const stream = await this.replicate.run(
      process.env.REPLICATE_API_ACTOR,
      {
        input: {
          prompt: `
            ${postImageProfessionalContext()}
            
            --------------------------------------------------
            
            POST IDEA
            ${prompt.scene}
            
            --------------------------------------------------
            
            USER INSTRUCTION
            ${prompt.userPrompt}
            
            --------------------------------------------------
            
           
            TEMPLATE REPLICATION MODE
            ${postImageTemplateReplicationMode(referenceRule)}
            
            --------------------------------------------------
            
            REFERENCE DESIGN SYSTEM
            ${postImageReferenceDesignSystem(designSystem)}
            
            --------------------------------------------------
            
            TEXT RULE
            ${textRule}
            
            ${isTextEnabled ? postImageTextRenderingPrompt(prompt) : postImageSuppressionPrompt()}
            
            --------------------------------------------------
            
            CRITICAL RENDERING RULE
            ${postImageCriticalRenderingRule()}
            
            --------------------------------------------------
            
            TEXT GENERATION
            ${postImageTextGeneration()}
            
            --------------------------------------------------
            
            TEXT SUPPRESSION RULE
            ${postImageTextSuppressionRule()}
            
            --------------------------------------------------
            
            COMPOSITION
            ${postImageComposition()}
            
            --------------------------------------------------
            
            LIGHTING
            ${postImageLighting()}
            
            --------------------------------------------------
            
            CAMERA
            ${postImageCamera()}
            
            --------------------------------------------------
            
            QUALITY
            ${postImageQuality()}
          `,
          resolution: "2K",
          aspect_ratio: "4:5",
          safety_filter_level: "block_only_high",
          image_input: photos.map(photo => photo.url),
          allow_fallback_model: false
        },
      }
    );

    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }

    const buffer = Buffer.concat(chunks);

    return await this.savePhoto(businessId, buffer);
  }

  async generateStoryImageOpenAI(prompt: any, businessId: string, photos: { url: string, type: GalleryPhotoType }[]) {
    const decorations = photos.filter(p => p.type === GalleryPhotoType.Decoration);
    const stories = photos.filter(p => p.type === GalleryPhotoType.Story);
    const businessPhotos = photos.filter(p => p.type === GalleryPhotoType.Image);
    const hasReferenceImages = decorations.length || stories.length || businessPhotos.length;

    let designSystem: any;
    let textRule = ``;
    let referenceRule = ``;
    let isTextEnabled = false;


    if(hasReferenceImages) {
      const content: any = this.generateStoryContentForAnalytics(decorations, stories, businessPhotos);
      const response = await this.client.responses.create({
        model: "gpt-4.1",
        input: [
          {
            role: "user",
            content
          }
        ]
      });

      const parsedDesign = this.safeParseJson(response.output_text);
      const hasRealText = this.hasRealTextInStories(parsedDesign);

      designSystem = inspect(parsedDesign, { depth: null, colors: true });
      isTextEnabled = hasRealText;
      textRule = hasRealText ? storyImageHasRealText() : storyImageDoesntHaveRealText();
      referenceRule = storyImageReferenceImages();
    } else {
      textRule = storyImageDoesntHaveRealText();
      referenceRule = storyImageNoReferenceImages();
    }

    console.log("-----------")
    console.log("ACTOR ", process.env.REPLICATE_API_ACTOR)
    console.log("-----------")

    /*process.env.REPLICATE_API_ACTOR,*/
    const stream = await this.replicate.run(
      process.env.REPLICATE_API_ACTOR,
      {
        input: {
          prompt: `
            ${storyImageProfessionalContext()}
            
            --------------------------------------------------
            
            STORY IDEA
            ${prompt.scene}
            
            --------------------------------------------------
            
            USER INSTRUCTION
            ${prompt.userPrompt}
            
            --------------------------------------------------
            
            TEMPLATE REPLICATION MODE
            ${storyImageTemplateReplicationMode(referenceRule)}
            
            --------------------------------------------------
            
            REFERENCE DESIGN SYSTEM
            ${storyImageReferenceDesignSystem(designSystem)}
            
            --------------------------------------------------
            
            TEXT RULE
            ${textRule}
            
            ${isTextEnabled ? storyImageTextRenderingPrompt(prompt) : storyImageSuppressionPrompt()}
            
            --------------------------------------------------
            
            CRITICAL RENDERING RULE
            ${storyImageCriticalRenderingRule()}
            
            --------------------------------------------------
            
            TEXT GENERATION
            ${storyImageTextGeneration()}
            
            --------------------------------------------------
            
            TEXT SUPPRESSION RULE
            ${storyImageTextSuppressionRule()}
            
            --------------------------------------------------
            
            COMPOSITION
            ${storyImageComposition()}
            
            --------------------------------------------------
            
            LIGHTING
            ${storyImageLighting()}
            
            --------------------------------------------------
            
            CAMERA
            ${storyImageCamera()}
            
            --------------------------------------------------
            
            QUALITY
            ${storyImageQuality()}
          `,
          resolution: "2K",
          aspect_ratio: "9:16",
          safety_filter_level: "block_only_high",
          image_input: photos.map(photo => photo.url),
          allow_fallback_model: false
        }
      }
    );

    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }

    const buffer = Buffer.concat(chunks);

    return await this.savePhoto(businessId, buffer);
  }


  // Utils
  private getFileName(url: string) {
    return url.split("/").pop();
  }

  private generatePostContentForAnalytics(decorations, posts, businessPhotos) {
    const content: any[] = [
      {
        type: "input_text",
        text: postImageRoleBlock()
      }
    ];

    if (decorations.length) {
      content.push({
        type: "input_text",
        text: postImageDecorationBlock()
      });

      decorations.forEach((photo: any) => {
        const fileName = this.getFileName(photo.url);

        content.push({
          type: "input_text",
          text: postImageDecorationDescriptionBlock(fileName, photo)
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
        text: postImagePostBlock()
      });

      posts.forEach((photo: any) => {
        const fileName = this.getFileName(photo.url);

        content.push({
          type: "input_text",
          text: postImagePostDescriptionBlock(fileName, photo)
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
        text: postImageBusinessBlock()
      });

      businessPhotos.forEach((photo: any) => {
        const fileName = this.getFileName(photo.url);

        content.push({
          type: "input_text",
          text: postImageBusinessDescriptionBlock(fileName, photo)
        });

        content.push({
          type: "input_image",
          image_url: photo.url
        });
      });
    }

    content.push({
      type: "input_text",
      text: postImageOutputBlock()
    });

    return content;
  }

  private generateStoryContentForAnalytics(decorations, stories, businessPhotos) {
    const content: any[] = [
      {
        type: "input_text",
        text: storyImageRoleBlock()
      }
    ];

    if (decorations.length) {
      content.push({
        type: "input_text",
        text: storyImageDecorationBlock()
      });

      decorations.forEach((photo: any) => {
        const fileName = this.getFileName(photo.url);

        content.push({
          type: "input_text",
          text: storyImageDecorationDescriptionBlock(fileName, photo)
        });

        content.push({
          type: "input_image",
          image_url: photo.url
        });
      });
    }

    if (stories.length) {
      content.push({
        type: "input_text",
        text: storyImageStoryBlock()
      });

      stories.forEach((photo: any) => {
        const fileName = this.getFileName(photo.url);

        content.push({
          type: "input_text",
          text: storyImageStoryDescriptionBlock(fileName, photo)
        });

        content.push({
          type: "input_image",
          image_url: photo.url
        });
      });
    }

    if(businessPhotos.length) {
      content.push({
        type: "input_text",
        text: storyImageBusinessBlock()
      });

      businessPhotos.forEach((photo: any) => {
        const fileName = this.getFileName(photo.url);

        content.push({
          type: "input_text",
          text: storyImageBusinessDescriptionBlock(fileName, photo)
        });

        content.push({
          type: "input_image",
          image_url: photo.url
        });
      })
    }

    content.push({
      type: "input_text",
      text: storyImageOutputBlock()
    });

    return content;
  }

  private safeParseJson(text: string) {
    try {
      const repaired = jsonrepair(text);

      return JSON.parse(repaired);
    } catch (e) {
      console.error("JSON PARSE ERROR", text);
      throw new Error("Invalid JSON from AI");
    }
  }

  private hasRealTextInPosts(parsedDesign: any): boolean {
    return parsedDesign.posts?.some(post =>
      post.postDesignSystem?.typography?.textBlocks?.some(
        block =>
          block.textContent &&
          block.textContent !== "Not visible"
      )
    );
  }

  private hasRealTextInStories(parsedDesign: any): boolean {
    return parsedDesign.stories?.some(story =>
      story.storyDesignSystem?.typography?.textBlocks?.some(
        block =>
          block.textContent &&
          block.textContent !== "Not visible"
      )
    );
  }

  async savePhoto(businessId: string, buffer) {
    const fileName = `${randomUUID()}.png`;

    const key = `ai-images/${businessId}/${fileName}`;

    await this.s3Service.upload(
      key,
      buffer,
      "image/png"
    );

    console.log("----------")
    console.log("Photo URL ", `https://crm-marketing-ai-bucket.s3.eu-north-1.amazonaws.com/${key}`);
    console.log("----------")

    return key;
  }
}