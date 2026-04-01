import { GalleryPhotoType } from "@prisma/client";

export function postRoleBlock() {
  return `
    You are a senior performance marketer and creative strategist.
    Generate exactly 1 social media post based on the provided business context.
  `;
}

export function postBusinessContextBlock(profile, audienceBlock, productsBlock) {
  return `
    ## BUSINESS CONTEXT
    
    Business:
    - Name: ${profile.business.name}
    - Industry: ${profile.business.industry}
    - Website: ${profile.business.website}
    - Language: ${profile.business.language}
    - Brand History: ${profile.business.brand}
    - Brand Advantages: ${profile.business.advantages.join(', ')}
    - Brand Goals: ${profile.business.goals.join(', ')}
    
    Context:
    - Name: ${profile.name}
    - Focus: ${profile.profileFocus}
    - Idea: ${profile.ideas}
    
    Target audience:
    ${audienceBlock}
    
    Products / services:
    ${productsBlock}
  `;
}

export function postCompetitorBlock() {
  return `
    ## COMPETITOR STRUCTURE TRANSFER (REQUIRED)
    
    If a competitor reference post is provided:
    1) Identify its structure (hook → info blocks → CTA).
    2) Transfer that structure to the new post.
    3) Keep pacing and energy.
    
    Do NOT copy wording.
  `;
}

export function postIdeaBlock(ideasBlock) {
  return `
    ## CREATIVE IDEA (PRIMARY INSPIRATION)
    
    Use the idea as the main creative direction.
    
    The idea defines:
    - WHAT
    - WHY
    - EMOTION
    - STORY FRAME
    
    If ignored → INVALID.
    
    ${ideasBlock}
  `;
}

export function postTextGenerationBlock(textPrompts) {
  return `
    ## TEXT GENERATION
    
    Fields:
    - hook
    - body
    - cta
    - emotional_angle
    
    Rules:
    - human, emotional
    - SEO natural
    - no clichés
    - no fake facts
    - no AI mentions
    
    ${textPrompts}
  `;
}

export function postFormatReplicationBlock() {
  return `
    ## POST FORMAT REPLICATION (STRICT)
    
    If competitor exists:
    - replicate structure
    - replicate line format
    - replicate pacing
    
    DO NOT:
    - copy wording
    
    DO:
    - copy structure
  `;
}

function getImageName(url: string) {
  return url.split('/').pop();
}

function postImageStructureBlock(profile, photos, imagePrompts) {
  const businessImages= photos.filter(p => p.type === GalleryPhotoType.Image);
  const decorationsImages= photos.filter(p => p.type === GalleryPhotoType.Decoration);
  const designImages = photos.filter(p => p.type === GalleryPhotoType.Post);

  const hasBusiness = businessImages.length > 0;
  const hasDecor = decorationsImages.length > 0;
  const hasDesign = designImages.length > 0;

  const businessNames = businessImages.map(img => getImageName(img.url));
  const decorNames = decorationsImages.map(img => getImageName(img.url));
  const designNames = designImages.map(img => getImageName(img.url));

  let scene = '';

  if (hasBusiness && !hasDecor && !hasDesign) {
    scene = `Use only the business image(s): ${businessNames.join(', ')}. Do not add, remove, or modify anything.`;
  } else if (hasBusiness && hasDecor && !hasDesign) {
    scene = `Use the business image(s): ${businessNames.join(', ')} as the base without any changes. 
    
      Add decorative overlays from: ${decorNames.join(', ')}.
      Use them as subtle visual accents such as shapes, icons, or patterns.
      Integrate them naturally into the composition.
      Maintain balance and spacing between elements.
      Ensure they enhance the image without overpowering it.
      Avoid random or clustered placement.
    `;

  } else if (hasBusiness && !hasDecor && hasDesign) {
    scene = `Use the business image(s): ${businessNames.join(', ')} as the base without any changes. 
    
      Apply design-style overlays from: ${designNames.join(', ')}.
      Follow the visual style, typography, and graphic elements from these design references.
      Arrange all overlay elements in a clean and balanced composition.
      Distribute elements evenly across the image.
      Avoid random placement in corners.
      Do not cover key subjects or important areas of the image.
    `;

  } else if (hasBusiness && hasDecor && hasDesign) {
    scene = `Use the business image(s): ${businessNames.join(', ')} as the base without any changes.

      Add decorative overlays from: ${decorNames.join(', ')}.
      Use them as subtle visual accents such as shapes, icons, or patterns.
      Integrate them naturally into the composition.
      Maintain balance and spacing between elements.
      Ensure they enhance the image without overpowering it.
      Avoid random or clustered placement.
  
      Apply design-style overlays from: ${designNames.join(', ')}.
      Follow the visual style, typography, and graphic elements from these design references.
      Arrange all overlay elements in a clean and balanced composition.
      Distribute elements evenly across the image.
      Avoid random placement in corners.
      Do not cover key subjects or important areas of the image.
    `;
  }

  return `
    ## IMAGE PROMPT STRUCTURE
    
    You MUST follow STRICT composition rules based on provided image types.
    
    ### SCENE (ENGLISH ONLY):
    Scene: "${scene}"
    
    ### USER CUSTOM PROMPT (TRANSLATE + APPLY)
    Original instructions:
    UserPrompt: "${imagePrompts.join('\n')}"
    
    🚨 CRITICAL:
    
    You MUST:
    - Translate the instructions to English
    - Immediately apply them inside the UserPrompt
    
    ❗ DO NOT output the translation separately
    ❗ DO NOT keep original language
    ❗ ONLY use English inside UserPrompt
    
    If instructions are not applied → INVALID OUTPUT
    
    
    #### GENERAL RULES:
    - Scene MUST be in English
    - UserPrompt MUST be in English
    - Describe ONLY the provided images
    - DO NOT invent anything
    - DO NOT use post text (hook, body, CTA)
    - Treat images as immutable
    - Do NOT describe text inside the image
    
    ### VISIBLE TEXT ON IMAGE:
    You MUST ALWAYS include Title, Subtitle and Caption.
    If any of them are missing, the output is INVALID.
    
    Rules:
    - If frontend text exists → use EXACT text
    - Otherwise → generate text from previously generated post content
    - Keep text short and visually suitable
    - Do NOT describe placement
    - Do NOT describe typography
    - Do NOT mention UI elements
    
    Output format:
    Title: "TEXT"
    Subtitle: "TEXT"
    Caption: "TEXT"
    
    ### LANGUAGE RULE:
    - ALL visible text MUST be in ${profile.business.language}
    - NEVER mix languages
  `;
}

export function postImagePromptBlock(imagePrompts, profile, photos) {
  const hasImagePrompts = imagePrompts?.length > 0;

  if (hasImagePrompts) {
    return `
    ## IMAGE PROMPT GENERATION (STRICT FRONTEND MODE)
    
    FRONTEND INPUT (JSON):
    ${JSON.stringify(imagePrompts)}
    
    🚨 CRITICAL:
    You are in STRICT MODE.
    
    - Use ONLY frontend input
    - Ignore any previously generated content
    - Do NOT generate text
    - You MAY transform text ONLY for translation purposes
    
    Mapping:
    - title = first item
    - subtitle = second item
    - caption = third item (or empty)
    
    Output exactly.
    
    Language: ${profile.business.language}
    
    ${postImageStructureBlock(profile, photos, imagePrompts)}
  `;
  } else {
    return `
    ## IMAGE PROMPT GENERATION
    
    FRONTEND INPUT:
    ${imagePrompts}
    
    ### TEXT SOURCE (CRITICAL):
    
    You have already generated:
    - hook
    - body
    - cta
    
    You MUST use that generated content as the ONLY source for image text.
    
    Priority:
    - If frontend text exists → use it EXACTLY
    - Otherwise → generate text from the POST CONTENT you created earlier
    - Use this language - ${profile.business.language}
    
    You MUST NOT invent unrelated text.
 
    ### TEXT TRANSFORMATION RULE:
    
    - Title → short, punchy version of hook
    - Subtitle → simplified key idea from body
    - Caption → short CTA version
    
    Rules:
    - Keep text short and visually suitable
    - Do NOT copy full sentences
    - Do NOT invent new ideas
    - Stay consistent with your generated post
    
    ${postImageStructureBlock(profile, photos, imagePrompts)}
  `;
  }
}

export function postOutputBlock() {
  return `
    ## OUTPUT FORMAT (STRICT JSON)
    
    {
      "posts": [
        {
          "platform": "...",
          "hook": "...",
          "body": "...",
          "cta": "...",
          "emotional_angle": "...",
          "image_prompt": {
            "scene": "string",
            "userPrompt": "string",
            "title": "string",
            "subtitle": "string",
            "caption": "string"
          }
        }
      ]
    }
    
    Return ONLY JSON.
  `;
}

export function normalizeUserPromptBlock(prompt: string) {
  return `
    ## PROMPT INTERPRETER
    
    You receive user prompts (any language, unstructured).
    
    INPUT:
    ${prompt}
    
    ---
    
    ## YOUR TASK
    
    Analyze the input and split it into TWO categories only:
    
    1. text → instructions for generating the post text
    2. image → instructions for generating the image
    
    ---
    
    ## RULES
    
    - Detect language automatically
    - Understand meaning, not keywords
    - Translate internally if needed (but output stays in original language if possible)
    
    - If instruction relates to:
      - storytelling, tone, CTA, emotions → text
      - visual scene, objects, composition, style → image
    
    - If something applies to both → include it in BOTH arrays
    
    - If user provides explicit text for image (e.g. "write 'SALE' on image"):
      → include it in "image" (do NOT move to text)
    
    - Do NOT invent anything
    - Do NOT lose important details
    - Keep instructions short and clear
    - Extract FULL instructions (complete sentences or meaningful instruction blocks)
    - DO NOT split instructions into smaller parts or phrases
    - Each array item must represent ONE complete instruction
    
    - Preserve original structure of the user request
    - If one sentence contains multiple intents:
      → keep it as ONE item (do not split)
    
    - Avoid duplication:
      → the same instruction should not appear twice in the same category
    
    ---
    
    ## OUTPUT FORMAT (STRICT JSON ONLY)
    
    {
      "text": string[],
      "image": string[]
    }
    
    ---
    
    ## IMPORTANT
    
    - No explanations
    - No extra fields
    - No markdown
    - Only valid JSON
    `;
}
