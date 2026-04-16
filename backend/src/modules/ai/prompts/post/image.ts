export function postImageRoleBlock() {
  return `
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

export function postImageDecorationBlock() {
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

export function postImageDecorationDescriptionBlock(fileName, photo) {
  return `
    Decoration reference.
          
    IMAGE_ID: ${fileName}
    
    Main element in this image:
    ${photo.description ?? "Not specified"}
    
    Focus only on this element.
    Ignore other background details.
  `
}

export function postImagePostBlock() {
  return `
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
}

export function postImagePostDescriptionBlock(fileName, photo) {
  return `
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
}

export function postImageBusinessBlock() {
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

export function postImageBusinessDescriptionBlock(fileName, photo) {
  return `
    Business photo.
    
    IMAGE_ID: ${fileName}
    
    Main subject:
    ${photo.description ?? "Business environment or product"}
    
    This photo may be used as a visual reference for scene generation
  `
}

export function postImageOutputBlock() {
  return `
    OUTPUT FORMAT
    
    Return the result strictly as JSON.
    
    CRITICAL JSON RULES (MUST FOLLOW)

    - JSON must be strictly valid and parsable by JSON.parse
    - Objects MUST contain only key-value pairs
    - NEVER output standalone values inside objects
    - If you want to add explanation — you MUST put it inside a string field
    - If no suitable key exists — create one
    
    INVALID EXAMPLE (DO NOT DO THIS):
    {
      "a": true,
      "some random text"
    }
    
    VALID EXAMPLE:
    {
      "a": true,
      "note": "some random text"
    }
    
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
    - Do NOT include comments
    - Do NOT use // or /* */
    - Do NOT explain anything
    - Do NOT add trailing commas
  `
}

export function postImageHasRealText() {
  return `
    The generated image MUST contain text.
    
    Replace the original headline with the new Title.
    Replace the original subheadline with the new Subtitle.
    
    Preserve typography style and position.
  `
}

export function postImageDoesntHaveRealText() {
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

export function postImageNoReferenceImages() {
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

export function postImageReferenceImages() {
  return `
    REFERENCE MODE: ENABLED
    
    Use reference images and design system strictly.
  `
}



export function postImageProfessionalContext() {
  return `
    You are a professional commercial product photographer and art director.
            
    Generate a high-quality decorative marketing photo based on the provided reference images.
  `
}

export function postImageTemplateReplicationMode(referenceRule) {
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

export function postImageReferenceDesignSystem(designSystem) {
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


export function postImageTextRenderingPrompt(prompt) {
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

export function postImageSuppressionPrompt() {
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

export function postImageCriticalRenderingRule() {
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

export function postImageTextGeneration() {
  return `
    All text must respect the typography system.
    
    If the reference headline is uppercase,
    the generated headline must also be uppercase.
  `
}

export function postImageTextSuppressionRule() {
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

export function postImageComposition() {
  return `
    - Clean balanced composition
    - Clear focal point
    - Decorative overlays must match the reference style
    - Modern marketing photography style
  `
}

export function postImageLighting() {
  return `
    - Soft diffused lighting
    - Natural highlights
    - No harsh shadows
  `
}

export function postImageCamera() {
  return `
    - Professional DSLR style
    - Sharp focus
    - High dynamic range
    - Realistic perspective
  `
}

export function postImageQuality() {
  return `
    - Ultra realistic
    - High resolution
    - Clean background
    - No visual noise
    - No distortions
  `
}