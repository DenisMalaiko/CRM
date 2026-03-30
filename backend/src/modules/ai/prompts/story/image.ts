export function storyImageRoleBlock() {
  return `
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

export function storyImageDecorationBlock() {
  return `
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
  `;
}

export function storyImageDecorationDescriptionBlock(fileName, photo) {
  return `
    Decoration reference.
          
    IMAGE_ID: ${fileName}
    
    Main element in this image:
    ${photo.description ?? "Not specified"}
    
    Focus only on this element.
    Ignore other background details.
  `
}

export function storyImageStoryBlock() {
  return `
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
}

export function storyImageStoryDescriptionBlock(fileName, photo) {
  return `
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
}

export function storyImageBusinessBlock() {
  return `
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
}

export function storyImageBusinessDescriptionBlock(fileName, photo) {
  return `
    Business photo.
    
    IMAGE_ID: ${fileName}
    
    Main subject:
    ${photo.description ?? "Business environment or product"}
    
    This photo may be used as a visual reference for scene generation.
  `
}

export function storyImageOutputBlock() {
  return `
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
    - Do NOT include comments
    - Do NOT use // or /* */
    - Do NOT explain anything
    - Do NOT add trailing commas
  `
}


export function storyImageHasRealText() {
  return `
    The generated image MUST contain text.
    
    Replace the original headline with the new Title.
    Replace the original subheadline with the new Subtitle.
    
    Preserve typography style and position.
  `
}

export function storyImageDoesntHaveRealText() {
  return `
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
  `
}

export function storyImageNoReferenceImages() {
  return `
    REFERENCE MODE: NONE
    
    No reference images were provided.
    
    Rules:
    - Do NOT replicate any template
    - Do NOT generate text
    - Do NOT generate decorative overlays
    - Do NOT add graphic elements
    
    Generate a clean, natural marketing photo based ONLY on the idea.
    
    The image must look like a real photograph, not a designed poster.
  `
}

export function storyImageReferenceImages() {
  return `
    REFERENCE MODE: ENABLED
    
    Use reference images and design system strictly.
  `
}

export function storyImageProfessionalContext() {
  return `
    You are a professional social media art director.
    
    Generate a high-quality Instagram Story marketing creative.
  `
}

export function storyImageTemplateReplicationMode(referenceRule) {
  return `
    The reference post images define a strict visual template.
            
    You MUST preserve:
    
    • layout structure  
    • position of graphic elements  
    • overlay shapes  
    • color panels  
    • decorative stripes  
    • spacing between elements  
    
    Do NOT redesign the composition.
    
    Treat the reference post as a TEMPLATE.
    
    Only change:
    ${referenceRule}
    
    Everything else must follow the reference layout.
  `
}

export function storyImageReferenceDesignSystem(designSystem) {
  return `
    Use the visual design system extracted from the reference images.
    
    ${designSystem}
    
    IMPORTANT:
    - Decorative graphic overlays must match the reference design.
    - If a decorative element has a boundingBox it MUST appear in the same position.
    - Do NOT change overlay angle.
    - Do NOT change overlay size.
    - Do NOT move overlays to another area.
  `
}

export function storyImageTextRenderingPrompt(prompt) {
  return `
    IMAGE TEXT CONTENT (MANDATORY)
            
    Title:
    ${prompt.title}
    
    Subtitle:
    ${prompt.subtitle}
    
    Caption:
    ${prompt.caption}
    
    RULES:
    
    - You MUST render this exact text on the image
    - Do NOT modify text
    - Do NOT translate text
    - Do NOT omit any text
    
    Replace:
    - original headline → Title
    - original subheadline → Subtitle
    
    Preserve:
    - typography style
    - position
  `
}

export function storyImageSuppressionPrompt() {
  return `
    TEXT MUST NOT BE RENDERED
            
    CRITICAL:
    
    - Ignore any text content provided
    - Do NOT render:
      - headlines
      - captions
      - slogans
      - letters
      - words
      - UI text
    
    If layout contains text areas → leave them empty
  `;
}

export function storyImageCriticalRenderingRule() {
  return `
     The generated image MUST NOT contain any technical annotations.
            
      Do NOT render:
      - HEX color codes
      - opacity values
      - percentages
      - bounding boxes
      - design notes
      - debug labels
      - layout measurements
  `
}

export function storyImageTextGeneration() {
  return `
    All text must respect the typography system.
    
    If the reference headline is uppercase,
    the generated headline must also be uppercase.
  `
}

export function storyImageTextSuppressionRule() {
  return `
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
  `
}

export function storyImageComposition() {
  return `
    - Clean balanced composition
    - Clear focal point
    - Decorative overlays must match the reference style
    - Modern marketing photography style
  `
}

export function storyImageLighting() {
  return `
    - Soft diffused lighting
    - Natural highlights
    - No harsh shadows
  `
}

export function storyImageCamera() {
  return `
    - Professional DSLR style
    - Sharp focus
    - High dynamic range
    - Realistic perspective
  `
}

export function storyImageQuality() {
  return `
    - Ultra realistic
    - High resolution
    - Clean background
    - No visual noise
    - No distortions
  `
}