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

    console.log("GENERATE IMAGE...")
    console.log("PROMPT: ", prompt)
    console.log("DECORATIONS: ", decorations)
    console.log("POSTS: ", posts)
    console.log("BUSINESS PHOTOS: ", businessPhotos)

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

    console.log("OUTPUT: ", designSystem)
    console.log("-----------")

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


    /*const analysis = await this.client.responses.create({
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
                
                5) GEOMETRIC INVARIANTS (ANALYSIS ONLY)

                Identify geometric properties that define the visual identity.
                
                Mark the following as STYLE INVARIANTS:
                
                - stripe angle
                - spacing ratios
                - layering order
                - overlap rules
                - alignment anchors
                
                IMPORTANT:
                You are ONLY analyzing the existing image.
                Do NOT propose changes or new scenes.
                Do NOT redesign anything.
                
                6) Structural Overlay System (CRITICAL — HIGH PRECISION)
                
                Analyze decorative graphics as a GEOMETRIC SYSTEM, not individual elements.
                
                Identify whether overlays form a repeating or rule-based structure.
                
                For the FULL overlay system describe:
                
                - System type:
                  (parallel stripes / radial / grid / frame / asymmetric accents / mixed)
                
                - Global orientation:
                  angle in degrees relative to horizontal axis
                
                - Origin reference:
                  where lines appear to start (outside frame / corner / center / edge)
                
                - Repetition logic:
                  fixed spacing / variable spacing / grouped clusters
                
                - Stripe/element count:
                  total visible + estimated off-frame continuation
                
                - Spacing:
                  distance between elements in px AND % of image width
                
                - Width consistency:
                  identical / alternating / progressive
                
                - Alignment rule:
                  aligned to canvas / aligned to subject / aligned to perspective
                
                - Coverage:
                  full-frame crossing / partial overlay / background-only
                
                - Depth layering model:
                  foreground overlay / mid overlay / background wash
                
                - Opacity hierarchy:
                  strongest → weakest element order
                
                - Interaction with subjects:
                  intersects subjects / avoids faces / masked behind players / global overlay
                
                - Symmetry or rhythm:
                  repeating cadence description
                  
                - Inter-element rule (CRITICAL):
                describe whether elements are allowed to overlap.
              
                Choose one:
                • overlapping allowed
                • touching only
                • fixed-gap non-overlapping (STRICT)
                • layered stacking
              
                If non-overlapping:
                - define gap size in px and %
                - confirm elements never intersect
                
                IMPORTANT:
                Treat stripes and graphic overlays as a mathematical layout system.
                Do NOT describe visually only — describe construction logic.
                
                - Decorative elements must be described using a consistent coordinate system
                  where (0%,0%) is top-left and (100%,100%) is bottom-right.
                - If decorative elements extend outside the frame, estimate continuation.
                - Prefer geometric relationships over visual adjectives.
                
                Rendering Constraints (MANDATORY FOR REBUILD):
 
                - Elements must preserve original spacing ratios.
                - Decorative elements must NOT intersect unless explicitly visible.
                - Maintain constant perpendicular distance between parallel stripes.
                - Treat gaps as design elements equal in importance to stripes.
                
                7) Decorative Graphic Elements (Instances)

                Now list individual elements ONLY as variations of the structural system above.
                
                For each:
                - Element index (Stripe 1, Stripe 2...)
                - Relation to system (primary/accent/background)
                - Offset from system origin (%)
                - Width deviation (if any)
                - Opacity deviation
                
                8) Marketing Intent
                - Primary message
                - Emotions triggered
                - What barrier is addressed
                - Positioning implied
                
                9) Rebuild Checklist (actionable)
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
    });*/


/*    const NANO_BANANO = "google/nano-banana-pro";

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

    return key;*/
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