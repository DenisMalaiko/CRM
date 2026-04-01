import { GalleryPhotoType } from "@prisma/client";

export function storyRoleBlock() {
  return `
    You are a senior performance marketer and short-form content strategist.
    Generate exactly ONE social media story based on the provided business context.
    Stories must be optimized for Instagram / Facebook vertical story format.
  `
}

export function storyBusinessContextBlock(profile, audienceBlock, productsBlock) {
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
    
    Profile:
    - Name: ${profile.name}
    - Focus: ${profile.profileFocus}
    - Idea: ${profile.ideas}
    
    Target audience:
    ${audienceBlock}
    
    Products / services:
    ${productsBlock}
  `
}

export function storyRulesBlock() {
  return `
    ## STORY UX RULES (VERTICAL FORMAT)
    
    Stories are viewed on a mobile device in a vertical 9:16 format.
    
    Important composition rules:
    
    - Main subject must stay in the center area
    - Avoid placing key objects at the top or bottom edges
    - Leave space for interface elements
    
    Safe zones:
    
    Top 15% → reserved for Instagram UI  
    Bottom 20% → reserved for buttons and reactions  
    
    Text placement:
    
    - Headline should appear in the upper-middle area
    - Supporting text in the middle area
    - CTA or reinforcement text in the lower-middle area
    
    Do NOT place text in UI areas.
  `
}

export function storyCompetitorBlock() {
  return `
    ## COMPETITOR STRUCTURE TRANSFER (REQUIRED)
    
    If a competitor reference post is provided:
    1) Identify its structure (hook → info blocks → CTA).
    2) Transfer that structure to the new post.
    3) Keep pacing and energy.
    
    Do NOT copy wording.
  `;
}

export function storyIdeaBlock(ideasBlock) {
  return `
    ## CREATIVE IDEA (PRIMARY INSPIRATION)
    
    Use the following idea as the narrative direction for the story sequence.
    
    ${ideasBlock}
    
    Stories MUST follow this narrative direction if provided.
  `
}

export function storyTextGenerationBlock(textPrompts) {
  return `
    ## TEXT GENERATION
    
    Fields:
    - headline
    - supporting_text
    - emotion_trigger
    - interaction
    - visual_description
    
    Rules:
    - short, punchy, scroll-stopping
    - headline: 1–5 words
    - supporting_text: 5–12 words
    - human, emotional
    - no clichés
    - no fake facts
    - no AI mentions
    
    Tone:
    - dynamic
    - visual
    - conversational
    
    ${textPrompts}
  `;
}

export function storyFormatReplicationBlock() {
  return `
    ## STORY FORMAT REPLICATION (STRICT)
    
    If competitor story exists:
    - replicate narrative flow
    - replicate pacing
    - replicate visual rhythm
    
    DO NOT:
    - copy wording
    - copy exact visuals
    
    DO:
    - copy structure
    - copy storytelling style
  `;
}

function getImageName(url: string) {
  return url.split('/').pop();
}

function storyImageStructureBlock(profile, photos, imagePrompts) {
  const businessImages = photos.filter(p => p.type === GalleryPhotoType.Image);
  const decorationsImages = photos.filter(p => p.type === GalleryPhotoType.Decoration);
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
    
    ### LANGUAGE:
    - Use ${profile.business.language}
    - Never mix languages
  `;
}

export function storyImagePromptBlock(imagePrompts, profile, photos) {
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
    - Do NOT rewrite
    - Do NOT generate new text
    
    Mapping:
    - title = first item
    - subtitle = second item
    - caption = third item (or empty)
    
    Output exactly.
    
    Language: ${profile.business.language}
    
    ${storyImageStructureBlock(profile, photos, imagePrompts)}
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
    
    ${storyImageStructureBlock(profile, photos, imagePrompts)}
  `;
  }
}

export function storyOutputBlock() {
  return `
    ## OUTPUT FORMAT (STRICT JSON)
    
    {
      "stories": [
        {
          "frame": 1,
          "headline": "string",
          "supporting_text": "string",
          "emotion_trigger": "curiosity | desire | urgency | fear | excitement",
          "interaction": "none | poll | question | slider | swipe",
          "visual_description": "string",
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






