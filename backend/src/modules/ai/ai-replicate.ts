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
          
          IMPORTANT TEXT DETECTION RULE

          Detect text blocks ONLY if the text is clearly visible as a graphic overlay added on top of the image.
          
          A valid text block must meet ALL conditions:
          - clearly readable letters
          - large enough to function as headline/subheadline
          - intentionally placed as part of the post design
          - visually separated from the photographed objects
          
          Do NOT detect text that appears on:
          - clothing
          - jerseys
          - logos
          - objects inside the photo
          - background elements
          - signage or environment
          
          Only detect text that is intentionally placed as part of the marketing design layer.
          
          If no clear overlay text exists, textBlocks MUST be an empty array.
          
          If you are uncertain whether text is a design overlay, assume there is NO text.

          TEXT BLOCK ANALYSIS
          
          For each block return:
          
          - textContent (exact text if readable)
          - role (headline / subheadline / CTA / caption)
          
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
          
          --------------------------------

          DECORATIVE GRAPHIC ELEMENTS
          
          Identify graphic design elements that are layered over the photo.
          
          Examples include:
          - diagonal color stripes
          - diagonal translucent overlays
          - geometric shapes
          - color panels
          - framing lines
          - background accents
          
          For each decorative element return:
          
          - elementType (stripe / diagonal overlay / panel / shape)
          - color (approx HEX)
          - opacity
          - orientation (horizontal / vertical / diagonal)
          - angle (if diagonal)
          - boundingBox
            - xPercent
            - yPercent
            - widthPercent
            - heightPercent
          
          IMPORTANT RULES
          
          - Do NOT skip text blocks.
          - If text is visible but unreadable still analyze style.
          - Estimate sizes visually if necessary.
          - Be precise with stroke and shadow.
          - Decorative overlays such as diagonal stripes MUST be detected and described.
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
                      "case": "uppercase | lowercase | title | sentence",
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
        - Return ONLY STRICT valid JSON. Do NOT include comments (//) or explanations inside JSON.
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

    console.log("DESIGN SYSTEM ", designSystem)

    const cleanJson = designSystem
      .replace(/\/\/.*$/gm, "")
      .replace(/,\s*]/g, "]")
      .replace(/,\s*}/g, "}");

    console.log("CLEAN JSON ", cleanJson)

    const parsedDesign = JSON.parse(cleanJson);

    const hasRealText =
      parsedDesign.posts?.some(post =>
        post.postDesignSystem?.typography?.textBlocks?.some(
          block => block.textContent && block.textContent !== "Not visible"
        )
      );

    console.log("HAS TEXT ", hasRealText)

    console.log("ANALIZE ", designSystem)

    let textRule = "";

    if (hasRealText) {
      textRule = `
        The generated image MUST contain text.
      
        Replace the original headline with the new Title.
        Replace the original subheadline with the new Subtitle.
      
        Preserve typography style and position.
        `;
    } else {
      textRule = `
        CRITICAL RULE:
        This design DOES NOT contain text.
      
        The generated image MUST NOT contain:
        - headlines
        - captions
        - slogans
        - typography
        - letters
        - words
        - UI text
        `;
    }

    const NANO_BANANO = "google/nano-banana-pro";

    const stream = await this.replicate.run(
      NANO_BANANO,
      {
        input: {
          prompt: `
            You are a professional commercial product photographer and art director.
            
            Generate a high-quality decorative marketing photo based on the provided reference images.
            
            MAIN GOAL:
            Create a visually appealing, premium-looking marketing image suitable for social media advertising.
            
            --------------------------------------------------
            
            SCENE DESCRIPTION
            ${prompt}
            
            --------------------------------------------------
            
            REFERENCE DESIGN SYSTEM
            Use the visual design system extracted from the reference images.
            
            ${designSystem}
            
            IMPORTANT:
            - Decorative graphic overlays must match the reference design.
            - If a decorative element has a boundingBox it MUST appear in the same position.
            - Do NOT change overlay angle.
            - Do NOT change overlay size.
            - Do NOT move overlays to another area.
            
            --------------------------------------------------
            
            TEXT RULE
            ${textRule}
            
            --------------------------------------------------
            
            CRITICAL RENDERING RULE
            
            The generated image MUST NOT contain any technical annotations.
            
            Do NOT render:
            - HEX color codes
            - opacity values
            - percentages
            - bounding boxes
            - design notes
            - debug labels
            - layout measurements
            
            --------------------------------------------------
            
            TEXT SUPPRESSION RULE
            
            If the design does not contain text blocks,
            the generated image must contain ZERO readable text.
            
            Do NOT place text on:
            - vehicles
            - clothing
            - banners
            - flags
            - buildings
            - signs
            - products
            
            --------------------------------------------------
            
            COMPOSITION
            
            - Clean balanced composition
            - Clear focal point
            - Decorative overlays must match the reference style
            - Modern marketing photography style
            
            --------------------------------------------------
            
            LIGHTING
            
            - Soft diffused lighting
            - Natural highlights
            - No harsh shadows
            
            --------------------------------------------------
            
            CAMERA
            
            - Professional DSLR style
            - Sharp focus
            - High dynamic range
            - Realistic perspective
            
            --------------------------------------------------
            
            QUALITY
            
            - Ultra realistic
            - High resolution
            - Clean background
            - No visual noise
            - No distortions
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

    console.log("STORY PROMPT ", prompt)

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
          
          Focus on THREE main systems:
          
          1) STORY LAYOUT STRUCTURE
          2) TYPOGRAPHY SYSTEM
          3) DECORATIVE GRAPHICS & OVERLAYS
          
          Spend roughly:
          - 40% on layout
          - 40% on typography
          - 20% on decorative graphics.
          
          --------------------------------
          
          STORY LAYOUT ANALYSIS
          
          Extract the structural layout of the story.
          
          Identify:
          
          - canvas orientation (should be vertical)
          - main focal zone
          - text zones
          - image zones
          - CTA zones
          - decorative overlay zones
          
          For each zone return:
          
          - zoneType (headline / info panel / CTA / background / hero image)
          - boundingBox
            - xPercent
            - yPercent
            - widthPercent
            - heightPercent
          
          Also detect:
          
          - safe margins for UI (top and bottom areas usually empty)
          - background structure (solid / texture / gradient / photo)
          - layering order (background → overlays → text → CTA)
          
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
            
            - story layout zones
            - typography system
            - decorative overlays
            - subject placement
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
                      "textContent": "",
                      "fontClassification": "",
                      "fontWidth": "",
                      "weight": "",
                      "case": "uppercase | lowercase | title | sentence",
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
            You are a professional social media art director.
            
            Generate a high-quality Instagram Story marketing creative.
            
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