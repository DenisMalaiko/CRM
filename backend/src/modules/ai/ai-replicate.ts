import { randomUUID } from "crypto";
import { GalleryPhotoType } from "@prisma/client";

import OpenAI from "openai";
const Replicate = require("replicate");

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
  postImageTemplateReplicationMode, postImageProfessionalContext
} from "./prompts/post/image";

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

  async generateImageOpenAI(prompt: any, businessId: string, photos: { url: string, type: GalleryPhotoType }[]): Promise<any> {
    const decorations = photos.filter(p => p.type === GalleryPhotoType.Decoration);
    const posts = photos.filter(p => p.type === GalleryPhotoType.Post);
    const businessPhotos = photos.filter(p => p.type === GalleryPhotoType.Image);
    const hasReferenceImages = decorations.length || posts.length || businessPhotos.length;

    let designSystem = ``;
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
      console.log("HAS TEXT IN PHOTO")

      designSystem = parsedDesign;
      isTextEnabled = hasRealText;
      textRule = hasRealText ? postImageHasRealText() : postImageDoesntHaveRealText();
      referenceRule = postImageReferenceImages();
    } else {
      textRule = postImageDoesntHaveRealText();
      referenceRule = postImageNoReferenceImages();
    }

    console.log("DESIGN SYSTEM ", designSystem);
    console.log("-----------------")
    console.log("TEXT RULE ", textRule);
    console.log("-----------------")
    console.log("REFERENCE RULE ", referenceRule);
    console.log("-----------------")

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

  async generateStoryImageOpenAI(prompt: string, businessId: string, photos: { url: string, type: GalleryPhotoType }[]) {
    const decorations = photos.filter(p => p.type === GalleryPhotoType.Decoration);
    const stories = photos.filter(p => p.type === GalleryPhotoType.Story);
    const businessPhotos = photos.filter(p => p.type === GalleryPhotoType.Image);
    const content: any[] = [
      {
        type: "input_text",
        text: `
          You are a senior brand designer, visual marketing analyst and commercial art director.
          
          You will receive three types of images:
          
          1) DECORATIONS – brand elements such as logos, shapes, overlays.
          2) STORIES – marketing story designs that define the visual style.
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

    if (stories.length) {
      content.push({
        type: "input_text",
        text: `
          STORY DESIGN SYSTEM ANALYSIS
      
          You are analyzing an INSTAGRAM / FACEBOOK STORY creative.
          
          Stories use a vertical 9:16 layout and a fast visual hierarchy.
          
          Your task is to extract the STORY DESIGN SYSTEM so that similar story creatives
          can be generated automatically.
          
          Focus on FOUR main systems:
          
          1) STORY LAYOUT STRUCTURE
          2) TEXT ZONE DETECTION & TYPOGRAPHY SYSTEM
          3) DECORATIVE GRAPHICS & TEXT SUPPORT DECORATIONS
          4) HERO SUBJECT
          
          Spend roughly:
          - 30% on layout
          - 35% on text detection + typography
          - 20% on decorative graphics
          - 15% on subject placement
          
          --------------------------------
          
          STORY LAYOUT ANALYSIS
          
          Extract the structural layout of the story.
          
          Identify:
          
          - canvas orientation (should be vertical)
          - main focal zone
          - text zones
          - top intro text zones
          - image zones
          - CTA zones
          - decorative overlay zones
          - text-attached decoration zones
          - contrast helper zones
          
          For each zone return:
          
          - zoneType (headline / subheadline / info panel / CTA / background / hero image / text decoration / contrast helper)
          - boundingBox
            - xPercent
            - yPercent
            - widthPercent
            - heightPercent
          
          Also detect:
          
          - safe margins for UI (top and bottom areas usually empty)
          - background structure (solid / texture / gradient / photo)
          - layering order (background → overlays → text → CTA)
          - relationship between text and nearby decorative contrast elements
          - whether small upper text is a separate layout zone
          
          --------------------------------
          
          EXHAUSTIVE TEXT ZONE DETECTION
          
          Detect ALL visible text zones in the story, not only the largest headline.
          
          You must scan the FULL frame from top to bottom.
          
          Include:
          - large headlines
          - small intro text
          - supporting text
          - footer text
          - CTA text
          - text placed near the top safe area
          - text placed over photo backgrounds
          - text placed inside or near decorative contrast elements
          
          Important rules:
          - Do NOT return only the dominant headline.
          - Small text can still be structurally important.
          - Text in the top 0–30% of the frame must be checked carefully.
          - If a text block is readable, return its exact text.
          - If a text block is not fully readable, still return its style and approximate position.
          - Multi-line text must be treated as a single text block if it belongs to one message.
          
          For each detected text block also return:
          - isSmallButImportant (true / false)
          - isTopZoneText (true / false)
          
          --------------------------------
          
          TEXT HIERARCHY
      
          Determine the visual hierarchy of all text blocks.
          
          Rank them by visual importance based on:
          
          • text size
          • font weight
          • central placement
          • contrast
          
          Return fields:
          
          hierarchyLevel
          visualRank
          
          Possible values for hierarchyLevel:
          
          - primary_headline
          - secondary_headline
          - info_text
          - caption
          - CTA
          
          visualRank rules:
          
          1 = largest and most dominant text  
          2 = secondary headline  
          3 = supporting info text  
          4 = caption or footer text  
          5 = CTA button text
          
          Important:
          Hierarchy is NOT the same as importance to detection.
          
          Even if a text block has low visualRank, it must still be returned if it contributes to the layout structure.
          
          Return all textBlocks SORTED by visualRank from largest to smallest.
          
          --------------------------------
          
          PRIMARY HEADLINE DETECTION
      
          Identify the largest and most dominant text in the story.
          
          This text defines the main marketing message.
          
          Detection signals:
          
          • largest text height
          • strong font weight (bold / extra bold)
          • uppercase typography
          • strong contrast color
          • positioned in upper or central area
          
          Return:
          
          isPrimaryHeadline: true / false
          
          --------------------------------
          
          TYPOGRAPHY CONTRAST ANALYSIS
      
          Do NOT assume all text blocks use the same typography.
          
          For each text block determine whether it differs from other blocks in:
          - font width
          - font weight
          - case
          - text height
          - spacing
          - visual density
          - contrast level
          
          Return:
          - styleGroup
          - differsFromPrimaryStyle (true / false)
          
          Examples of styleGroup:
          - primary_condensed_bold
          - secondary_narrow_light
          - caption_small_regular
          - info_italic_light
          
          --------------------------------
          
          TYPOGRAPHY SYSTEM
          
          For EVERY text block extract:
          
          TEXT CONTENT
          - textContent (exact text if readable)
          - role (headline / subheadline / CTA / info / caption)
          
          FONT STYLE
          - fontClassification (sans / serif / display)
          - fontWidth (condensed / normal / wide)
          - weight (light / regular / bold / extra bold)
          
          TEXT SHAPE
          
          Analyze the exact letter casing used in the text.
          
          Determine whether the text is written as:
          
          - uppercase (ALL LETTERS CAPITALIZED)
          - lowercase (all letters small)
          - title case (Each Word Starts With Capital Letter)
          - sentence case (Only first letter capitalized)
          
          Important:
          
          - The case value MUST reflect the exact typography style visible in the image.
          - If the text is uppercase in the design, the case must be "uppercase".
          - If the text uses mixed casing, describe it accurately.
          
          Fields:
          - case (uppercase / lowercase / title / sentence)
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
          
          --------------------------------
          
          TEXT SUPPORT DECORATIONS
      
          Detect decorative elements that specifically support text readability, contrast, or hierarchy.
      
          Examples:
          - colored bars near text
          - slashes
          - diagonal accents
          - underline accents
          - contrast panels behind text
          - dark gradient behind text
          - paint strokes behind text
          - framing marks attached to a headline
      
          Important:
          These elements are often small but structurally important.
          Do NOT ignore decorative accents attached to top text.
      
          For each such element return:
          - relatedTextBlockIndex
          - decorationRole (contrast / emphasis / separator / framing / readability support)
          - shape
          - color
          - opacity
          - orientation
          - angle
          - boundingBox
          
          --------------------------------
          
          DECORATIVE GRAPHICS & OVERLAYS
          
          Stories often use strong graphic overlays.
          
          Identify decorative elements such as:
          
          - diagonal color blocks
          - geometric panels
          - background gradients
          - texture overlays
          - color accents
          - decorative stripes
          - torn paper effects
          - framing elements
          
          For each element return:
          
          - elementType
          - shape (rectangle / stripe / diagonal / gradient / texture)
          - color
          - opacity
          - orientation (horizontal / vertical / diagonal)
          - angle (if diagonal)
          - boundingBox
          
          --------------------------------
          
          HERO SUBJECT
          
          Identify the main visual subject:
          
          - person / player
          - product
          - object
          - background scene
          
          Return:
          
          - subjectType
          - position
          - approximate size
          - relation to layout (foreground / background)
          
          --------------------------------
          
          IMPORTANT RULES
          
          - Do NOT invent details that are not visible.
          - If text is unreadable still analyze its style.
          - Always estimate positions relative to the full story frame.
          - Treat the story as a layered design system.
          - Return ALL detected text blocks, not only dominant ones.
          - Do NOT summarize multiple text zones into one simplified headline.
          - Small upper text is often structurally important and must not be ignored.
          - If a text block has a nearby decorative accent, return both the text block and the decoration.
          - If different text blocks clearly use different font styles, preserve them as separate style groups.
          
          Return precise structural information.
        `
      });

      stories.forEach((photo: any) => {
        const fileName = this.getFileName(photo.url);

        content.push({
          type: "input_text",
          text: `
            Instagram Story reference.
            
            IMAGE_ID: ${fileName}
            
            Important elements in this story:
            ${photo.description ?? "Full story creative"}
            
            Focus on extracting:
            
            - all story layout zones
            - all visible text blocks from top to bottom
            - small top text and intro text
            - decorative accents attached to text
            - typography differences between text blocks
            - subject placement
            
            Do NOT ignore small text in the upper part of the story.
            Do NOT simplify the story into only one main headline.
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
        
          "stories": [
            {
              "imageId": "IMAGE_ID",
              "storyDesignSystem": {
                "typography": {
                  "textBlocks": [
                    {
                      "role": "",
                      "hierarchyLevel": "",
                      "visualRank": 0,
                      "isPrimaryHeadline": false,
                      "isSmallButImportant": false,
                      "isTopZoneText": false,
                      "styleGroup": "",
                      "differsFromPrimaryStyle": false,
                      "relatedDecorations": [],
                      "textContent": "",
                      "fontClassification": "",
                      "fontWidth": "",
                      "weight": "",
                      "case": "uppercase | lowercase | title | sentence",
                      "alignment": "",
                      "fillType": "solid | outline",
                      "fillColor": "",
                      "opacity": "",
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
                },
                "decorativeGraphics": {
                  "elements": [
                    {
                      "elementType": "",
                      "shape": "",
                      "color": "",
                      "opacity": "",
                      "orientation": "",
                      "angle": "",
                      "relatedTextBlockIndex": null,
                      "decorationRole": "",
                      "boundingBox": {}
                    }
                  ]
                },
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
            You are a professional social media art director.
            
            Generate a high-quality Instagram Story marketing creative.
            
            --------------------------------------------------
            
            STORY IDEA
            ${prompt}
            
            BRAND DESIGN SYSTEM (STRICT)
            
            The following design system was extracted from real story creatives.
            
            You MUST reproduce the SAME visual layout structure.
            
            This includes:
            
            • same decorative stripe directions  
            • same placement of color panels  
            • same background composition  
            • same typography zones  
            • same hierarchy (headline → subject → CTA)
            
            Do NOT redesign the layout.
            
            Treat the reference design as a TEMPLATE.
            
            Only change the scene content (players, bus, environment).
            
            Design system:
            ${designSystem}
            
            TEXT REPLACEMENT RULES

            Use the typography hierarchy from the design system.
            
            1. Replace the PRIMARY HEADLINE first
               (text block where isPrimaryHeadline = true).
            
            2. Keep the exact style:
               • same casing
               • same alignment
               • same font weight
               • same size
               • same position
            
            3. Secondary texts must follow the same hierarchy order:
            
            primary_headline
            secondary_headline
            info_text
            caption
            CTA
            
            Never move headline placement.
            Never change typography structure.
            
            FORMAT
            Vertical 9:16 Instagram Story.
            
            LAYOUT
            • clear visual hierarchy
            • one strong focal subject
            • headline readable on mobile
            • minimal clutter
            
            SAFE AREAS
            Avoid placing important content in:
            • top 15% of frame
            • bottom 15% of frame
            
            STYLE
            • modern advertising design
            • strong contrast typography
            • bold composition
            • brand color palette
            
            SUBJECT
            Use a clear hero subject related to the story context.
            
            TEXT GENERATION
            All text must respect the typography system.
            
            If the reference headline is uppercase,
            the generated headline must also be uppercase.
            
            Do not invent additional text blocks.
            
            QUALITY
            • ultra realistic
            • professional advertising look
            • clean composition
            • high resolution
            
            Avoid:
            • clutter
            • small unreadable text
            • random stock-photo layouts
          `,
          resolution: "2K",
          aspect_ratio: "9:16",
          safety_filter_level: "block_only_high",
          image_input: photos.map(p => p.url),
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

  private safeParseJson(text: string) {
    try {
      const clean = text
        .replace(/\/\/.*$/gm, "")
        .replace(/,\s*]/g, "]")
        .replace(/,\s*}/g, "}");

      return JSON.parse(clean);
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