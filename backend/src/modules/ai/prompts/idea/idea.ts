export function ideaPrompt(business) {
  return `
  ${ideaRoleBlock()}
  
  ---
  
  ## BUSINESS CONTEXT
  
  Business:
  ${JSON.stringify(business, null, 2)}
  
  ---
  
  ${ideaContextBlock(business)}
  
  ---
  
  ${ideaTask()}
  
  ---
  
  ${ideaQualityBlock()}
  
  ---
  
  ${ideaOutputBlock()}
  
  ---
  
  ${ideaRules()}
  `;
}

function ideaRoleBlock() {
  return `
    You are a senior social media strategist and content creator.
    Your task is to generate HIGH-QUALITY, ENGAGING content ideas for social media (posts and stories).
  `
}


function ideaContextBlock(business) {
  return `
    ## CONTEXT SIGNALS (IMPORTANT)
  
    Use these signals when generating ideas:
    
    - Country / market: ${business.language}
    - Language: ${business.language}
    - Current date: ${new Date()}
    
    Consider:
    
    - current events and news relevant to the industry
    - social media trends (Instagram, TikTok, Facebook, etc.)
    - seasonal behaviors and потреби аудиторії
    - typical customer motivations and decision triggers
    - emotional drivers (e.g. trust, status, belonging, growth, security, achievement)
    - cultural context of the target audience
    
    Adapt ideas so they feel:
    - timely (relevant now)
    - contextual (fit the market and audience)
    - native to social media
  `
}


function ideaTask() {
  return `
    ## TASK
  
    Generate 5–10 UNIQUE content ideas.
    
    Each idea MUST:
    - be relevant to the business
    - feel modern and native to social media
    - be based on real-life situations, эмоції, або тригери
    - DON'T be trite or generic
  `
}

function ideaQualityBlock() {
  return `
    ## IDEA QUALITY REQUIREMENTS
  
    Each idea should:
    - have a specific scenario (not an abstract idea)
    - evoke emotion
    - have a clear value for parents
  `
}

function ideaOutputBlock() {
  return `
    ## OUTPUT FORMAT (STRICT JSON)
  
    Return ONLY JSON. No explanations.
    
    {
      "ideas": [
        {
          "title": "...",
          "description": "...",
    
          "who": "Person | Team | Company | Customer | CoachExpert | Community | Event | Product",
    
          "what": "Achievement | Announcement | Story | BehindTheScenes | Educational | Promotional | Community | Update | Testimonial | Entertainment",
    
          "why": "BuildBrand | Inform | Engage | Attract | Retain | Prove | Inspire | Educate | Sell",
    
          "how": "Storytelling | ShortBlocks | NewsFormat | ListFormat | MinimalText | LongForm",
    
          "feeling": "Pride | Trust | Excitement | Inspiration | Joy | Belonging | Motivation | Curiosity | Anticipation | Authority | Empathy"
        }
      ]
    }
  `
}

function ideaRules() {
  return `
    ## IMPORTANT
    
    - DO NOT repeat ideas
    - DO NOT generate generic ideas
    - DO NOT output anything except JSON
    - Ideas should be usable for Instagram / Facebook content directly
  `
}