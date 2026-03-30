import {Injectable} from '@nestjs/common';
import {ChatOpenAI} from "@langchain/openai";
import {TProfile} from "../profiles/entities/profile.entity";
import {AiPost} from "./entities/aiPost.entity";
import {AiReplicate} from "./ai-replicate";
import {GalleryPhotoType} from "@prisma/client";
import {IdeasBatchSchema} from "../idea/schema/idea.schema";

import {
  postRoleBlock,
  postBusinessContextBlock,
  postCompetitorBlock,
  postIdeaBlock,
  postTextGenerationBlock,
  postFormatReplicationBlock,
  postImagePromptBlock,
  postOutputBlock
} from "./prompts/post/content";

import {
  storyRoleBlock,
  storyBusinessContextBlock,
  storyCompetitorBlock,
  storyIdeaBlock,
  storyTextGenerationBlock,
  storyFormatReplicationBlock,
  storyOutputBlock,
  storyImagePromptBlock,
  storyRulesBlock,
} from "./prompts/story/content";

type Photo = {
  url: string,
  type: GalleryPhotoType,
  description: string | null,
};

@Injectable()
export class AiService {
  private model: ChatOpenAI;

  constructor(
    private readonly aiReplicate: AiReplicate,
  ) {
    this.model = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async generatePostsBasedOnBusinessProfile(profile: TProfile, photos: Photo[]): Promise<AiPost[]> {
    const prompt = this.buildPromptForPosts(profile, photos);
    const response = await this.model.invoke(prompt);
    const rawText = this.extractTextContent(response.content);
    const posts: AiPost[] = JSON.parse(rawText)?.posts ?? [];

    for (const post of posts) {
      if (post.image_prompt) {
        console.log("POST ", post);
        post.imageUrl = await this.aiReplicate.generateImageOpenAI(post.image_prompt, profile.businessId, photos);
      }
    }

    return posts;
  }

  async generateStoriesBasedOnBusinessProfile(profile: TProfile, photos: Photo[]): Promise<any[]> {
    const prompt = this.buildPromptForStories(profile, photos);
    const response = await this.model.invoke(prompt);
    const rawText = this.extractTextContent(response.content);
    const stories: any[] = JSON.parse(rawText)?.stories ?? [];

    for (const story of stories) {
      if (story.image_prompt) {
        console.log("STORY ", story);
        story.imageUrl = await this.aiReplicate.generateStoryImageOpenAI(story.image_prompt, profile.businessId, photos);
      }
    }

    return stories;
  }

  async generatePostsBasedOnManuallySettings(settings, photos: Photo[]): Promise<AiPost[]> {
    const prompt = this.buildPromptForPosts(settings, photos);
    const response = await this.model.invoke(prompt);
    const rawText = this.extractTextContent(response.content);
    const posts: AiPost[] = JSON.parse(rawText)?.posts ?? [];

    for (const post of posts) {
      if (post.image_prompt) {
        console.log("POST ", post);
        post.imageUrl = await this.aiReplicate.generateImageOpenAI(post.image_prompt, settings.business.id, photos);
      }
    }

    return posts;
  }

  async generateStoriesBasedOnManuallySettings(settings, photos: Photo[]): Promise<AiPost[]> {
    const prompt = this.buildPromptForStories(settings, photos);
    const response = await this.model.invoke(prompt);
    const rawText = this.extractTextContent(response.content);
    const stories: AiPost[] = JSON.parse(rawText)?.stories ?? [];

    for (const story of stories) {
      if (story.image_prompt) {
        console.log("STORY ", story);
        story.imageUrl = await this.aiReplicate.generateStoryImageOpenAI(story.image_prompt, settings.business.id, photos);
      }
    }

    return stories;
  }

  async analyzeCompetitorPosts(posts: any[]) {
    const structuredModel =
      this.model.withStructuredOutput(IdeasBatchSchema);

    const payload = posts.map(p => ({
      competitorPostId: p.id,
      platform: p.platform,
      text: p.text,
      likes: p.likes,
      shares: p.shares,
      views: p.views,
    }));

    const prompt = `
      You are a senior social media marketing analyst.
      
      Your task is to analyze EACH competitor post and extract ONE reusable marketing idea per post.
      
      IMPORTANT RULES:
      
      - Return EXACTLY the same number of ideas as posts.
      - Do NOT skip posts.
      - Do NOT merge posts.
      - Do NOT summarize the post.
      - Extract a MARKETING IDEA that can be reused by another business.
      - Response MUST be valid JSON only.
      - ALL textual fields MUST be written in Ukrainian language.
      
      ----------------------------
      
      IDEA REQUIREMENTS:
      
      title:
      - Ukrainian language ONLY
      - 8–15 words
      - Clear marketing concept name
      - Not generic
      - Should describe the core idea of the content
      
      description:
      - Ukrainian language ONLY
      - 3–5 full sentences
      - Explain:
        1) what happens in the post
        2) why this content works marketing-wise
        3) how another business could reuse this idea
      - Write like a professional marketing strategist
      - No emojis
      - No bullet points
      
      Return object:
      {
        "ideas": [...]
      }
      
      Posts:
      ${JSON.stringify(payload)}
     `;

    const result = await structuredModel.invoke(prompt);

    return result.ideas;
  }

  private buildPromptForPosts(profile, photos) {
    const audienceBlock = this.getAudiences(profile.audiences);
    const productsBlock = this.getProducts(profile.products);
    const ideasBlock = this.getIdeas(profile.ideas);
    const textPrompts = this.buildPromptsBlock(profile.prompts.filter(p => p.purpose === 'Text'));
    const imagePrompts = profile.prompts.filter(p => p.purpose === "Image" && p.isActive).map(p => p.text);

    const prompt = [
      postRoleBlock(),
      postBusinessContextBlock(profile, audienceBlock, productsBlock),
      postCompetitorBlock(),
      postIdeaBlock(ideasBlock),
      postTextGenerationBlock(textPrompts),
      postFormatReplicationBlock(),
      postImagePromptBlock(imagePrompts, profile, photos),
      postOutputBlock()
    ]

    return prompt.join('\n\n');
  }

  private buildPromptForStories(profile, photos) {
    const audienceBlock = this.getAudiences(profile.audiences);
    const productsBlock = this.getProducts(profile.products);
    const ideasBlock = this.getIdeas(profile.ideas);
    const textPrompts = this.buildPromptsBlock(profile.prompts.filter(p => p.purpose === 'Text'));
    const imagePrompts = profile.prompts.filter(p => p.purpose === "Image" && p.isActive).map(p => p.text);

    const prompt = [
      storyRoleBlock(),
      storyBusinessContextBlock(profile, audienceBlock, productsBlock),
      storyRulesBlock(),
      storyCompetitorBlock(),
      storyIdeaBlock(ideasBlock),
      storyTextGenerationBlock(textPrompts),
      storyFormatReplicationBlock(),
      storyImagePromptBlock(imagePrompts, profile, photos),
      storyOutputBlock(),
    ]

    return prompt.join('\n\n');

    /*    return `
          You are a senior performance marketer and short-form content strategist.
          Generate exactly ONE social media story based on the provided business context.
          Stories must be optimized for Instagram / Facebook vertical story format.

          ---

          ## BUSINESS CONTEXT

          Business:
          - Name: ${profile.business.name}
          - Industry: ${profile.business.industry}
          - Website: ${profile.business.website}
          - Language: ${profile.business.language}

          Profile:
          - Name: ${profile.name}
          - Focus: ${profile.profileFocus}

          Target audience:
          ${audienceBlock}

          Products / services:
          ${productsBlock}

          ---

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

          ---

          ## CREATIVE IDEA (PRIMARY INSPIRATION)

          Use the following idea as the narrative direction for the story sequence.

          ${ideasBlock}

          Stories MUST follow this narrative direction if provided.

          ---

          ## STORY STRUCTURE

          Generate ONE story frame that works as a standalone story but visually feels like part of a larger story sequence.

          The story should follow a psychological progression:

          1. Hook (attention)
          2. Context or pain
          3. Solution or insight
          4. Product/service appearance
          5. CTA

          Not every sequence must contain all steps, but the progression must feel natural.

          ---

          ## STORY WRITING RULES

          Each story frame must contain:

          - headline (very short attention hook)
          - supporting_text (context or value)
          - visual_description (what the viewer sees)
          - emotion_trigger
          - interaction element (optional)

          Story principle:

          Stories must feel like a quick moment captured on camera,
          not like a static marketing banner.

          Rules:

          - headline: 1–5 words
          - supporting_text: 5–12 words
          - caption_on_image: optional, short, 2–6 words
          - Stories must be punchy and scroll-stopping
          - Avoid long sentences
          - Use emotionally engaging language
          - Speak directly to audience pains/desires
          - Avoid generic marketing clichés
          - Do NOT invent business facts
          - Do NOT mention AI

          Tone:

          - dynamic
          - visual
          - conversational

          Emojis allowed if natural.

          ---

          ## TEXT VISUAL HIERARCHY

          Story images use a clear visual hierarchy.

          Text layers:

          1. Headline — largest and most dominant text
          2. Supporting text — medium size
          3. Caption / CTA / reinforcement — smallest text

          Rules:

          - Headline must be the strongest message
          - Supporting text explains the context
          - Caption is the third text layer and should normally be present in story creatives.

          ---

          ## INTERACTION ELEMENTS (OPTIONAL)

          Prefer interactive elements when appropriate.

          Available elements:

          - poll
          - question
          - slider
          - swipe
          - none

          Use interaction only when it improves engagement.

          --------------------------------

          FRONTEND IMAGE PROMPTS (SOURCE OF SCENE AND TEXT)

          The following prompts were provided by the marketing team.

          ${imagePrompts}

          These prompts define the visual scene and may also contain text that must appear on the image.


          TEXT EXTRACTION

          Some prompts may contain instruction phrases such as:

          - Add text
          - Add title
          - Add headline
          - Додай текст
          - Додай заголовок

          These phrases are instructions and are NOT part of the final image text.

          When extracting quoted text ("..."):

          - ignore the instruction words
          - keep ONLY the quoted text content

          Example:

          Add text "Goalberi Переможець в Чернівцях"

          Extracted text:
          Goalberi Переможець в Чернівцях


          TEXT MAPPING RULE

          Extract all quoted text fragments in the order they appear.

          Mapping:

          - first extracted text → Title
          - second extracted text → Subtitle
          - ignore any additional texts


          RULES

          - Use the marketing text exactly as written
          - Do NOT rewrite marketing text
          - Do NOT translate marketing text
          - Do NOT invent alternative text if marketing text exists

          --------------------------------

          ## FRONTEND TEXT PRIORITY (CRITICAL)

          First check whether the frontend image prompts contain explicit text that must appear on the image.

          Explicit text means:
          - quoted text fragments
          - direct instructions like add text / title / headline / subtitle / caption
          - marketing text explicitly provided for the image

          If explicit frontend text exists:

          Use it as the primary source for image text.

          Rules:

          - Do NOT rewrite the provided frontend text
          - Do NOT translate the provided frontend text

          Text mapping:

          If 1 frontend text exists:
          Title = frontend text
          Subtitle = generate from story context
          Caption = generate from story context

          If 2 frontend texts exist:
          Title = first frontend text
          Subtitle = second frontend text
          Caption = generate from story context

          If 3 frontend texts exist:
          Title = first frontend text
          Subtitle = second frontend text
          Caption = third frontend text

          If more than 3 texts exist:
          Use only the first three.

          Only if NO explicit frontend text exists,
          generate visible text from the story content.

          --------------------------------

          ## IMAGE PROMPT WRITING RULES

          The image_prompt MUST follow this structure:

          SCENE:
          VISIBLE TEXT ON IMAGE:

          Write the image_prompt in two clear sections:

          SCENE (one paragraph)

          VISIBLE TEXT ON IMAGE (structured lines)

          VISIBLE TEXT ON IMAGE:
          Title: "..."
          Subtitle: "..."
          Caption: "..."

          --------------------------------

          ## SCENE

          Use the frontend image prompt as the base scene description.

          Your task is NOT to invent a new scene.

          If the frontend prompt is written in another language,
          translate only the SCENE description into English while preserving the exact meaning.

          Rules:

          - Do NOT add new objects
          - Do NOT invent atmosphere or background details
          - Do NOT add fans, banners, crowd, lights, etc.
          - Do NOT expand the scene creatively
          - Mention the key objects from the frontend prompt
          - Optimize composition for vertical 9:16
          - Keep the main subject in the safe center area

          IMPORTANT:

          This translation rule applies ONLY to the SCENE description.

          --------------------------------

          ## LANGUAGE RULES FOR IMAGE TEXT, HEADLINE, SUPPORTING TEXT

          All visible text inside the image MUST be written in ${profile.business.language}.

          Language selection priority:

          1. If the frontend image prompt contains explicit text → use that language.
          2. Otherwise → use ${profile.business.language}.
          3. Never mix languages.

          Rules:
          - Caption MUST use the same language as Title and Subtitle.
          - Never switch languages inside the same image.
          - Do NOT translate existing marketing text.

          --------------------------------

          ## VISIBLE TEXT ON IMAGE

          First extract all explicit text fragments from the frontend image prompts.

          Use extracted texts in the order they appear.

          Text placement rules:

          - If only one text exists → use it as Title
          - If two texts exist → first = Title, second = Subtitle
          - If three texts exist → first = Title, second = Subtitle, third = Caption
          - If more than three texts exist → use only the first three
          - If no explicit frontend text exists → generate image text from the story fields

          Fallback generation rules when no explicit frontend text exists:

          - Title = story headline
          - Subtitle = story supporting_text
          - Caption = ALWAYS generate a contextual reinforcement line.

          Caption must always be generated when it is not explicitly provided.

          Caption rules:

          - 2–6 words
          - MUST be written in the SAME language as Title and Subtitle
          - derived from the story idea or business context
          - reinforce emotion, achievement, momentum, or CTA
          - must NOT repeat the Title or Subtitle

          TEXT HIERARCHY MAPPING:

          - primary_headline → Title
          - secondary_headline → Subtitle
          - caption / info_text / footer text → Caption

          Output format inside image_prompt:

          Title: "TEXT"
          Subtitle: "TEXT"
          Caption: "TEXT"

          Rules:

          - Write the EXACT words that must appear on the image
          - Do NOT rewrite frontend marketing text
          - Do NOT translate frontend marketing text
          - Do NOT describe typography
          - Do NOT describe layout
          - Do NOT explain anything

          Language rules:

          - SCENE description must be written in English
          - VISIBLE TEXT ON IMAGE must remain in the original business / marketing language
          - If frontend image text is provided, preserve its original language exactly

          --------------------------------

          ## TEXT CONSISTENCY RULE

          If no explicit frontend image text is provided,
          then the visible text on the image MUST match the generated story text.

          Mapping:

          - story headline → image Title
          - story supporting_text → image Subtitle
          - optional CTA / reinforcement → image Caption

          Never generate different wording between story text and image text in fallback mode.

          --------------------------------

          ## CAPTION GENERATION RULE

          When Caption is generated automatically:

          - it must add new meaning
          - it must not repeat Title or Subtitle
          - it should reinforce emotion, result, or CTA

          Examples:

          Title: "Goalberi Переможець в Чернівцях"
          Subtitle: "Команда Goalberi виграла 10 матчів"
          Caption: "Гордість команди"

          --------------------------------

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
                "image_prompt": "string"
              }
            ]
          }

          Return ONLY the JSON object. No explanations.`*/
  }

  private extractTextContent(content: any): string {
    if (typeof content === "string") {
      return content;
    }

    if (Array.isArray(content)) {
      return content
        .map(block => {
          if (typeof block === "string") return block;
          if ("text" in block) return block.text;
          return "";
        })
        .join("");
    }

    return "";
  }

  getAudiences(audiences?) {
    return audiences
      .map((a, i) => `
        Audience ${i + 1}:
        - Age range: ${a.ageRange}
        - Gender: ${a.gender ?? 'any'}
        - Location: ${a.geo}
        - Pains: ${a.pains.join(', ')}
        - Desires: ${a.desires.join(', ')}
        - Triggers: ${a.triggers.join(', ')}
        - Income level: ${a.incomeLevel ?? 'not specified'}
        `)
      .join('\n');
  }

  getProducts(products?) {
    return products
      .filter(p => p.isActive)
      .map((p, i) => `
        Product ${i + 1}:
        - Name: ${p.name}
        - Type: ${p.type}
        - Description: ${p.description}
        - Price segment: ${p.priceSegment}
        - Positioning hint: ${
        p.priceSegment === 'Premium'
          ? 'high value, quality, exclusivity'
          : p.priceSegment === 'Middle'
            ? 'balanced value and affordability'
            : 'accessible, cost-effective, practical'
      }
        `)
      .join('\n');
  }

  getIdeas(ideas?) {
    return ideas && ideas.length
      ? ideas.map((idea, i) => `
        Idea ${i + 1} (Creative Direction):
        - Title: ${idea.title}
        - Description: ${idea.description}
        - Target emotion: ${idea.feeling}
        - Audience intent (Who): ${idea.who}
        - Content type (What): ${idea.what}
        - Marketing goal (Why): ${idea.why}
        - Execution style (How): ${idea.how}
        
        Competitor reference post (for structure only, NOT for copying):
        """
        ${idea.competitorText ?? 'not available'}
        """
        
        How to use the competitor post (MANDATORY):
        - Extract the STRUCTURE and PSYCHOLOGY:
          - Hook pattern (1 sentence)
          - Information blocks order (bullet list)
          - CTA pattern (1 sentence)
          - Emotional triggers used (bullet list)
        - Rebuild the post from scratch for THIS business:
          - Replace all entities (teams, cities, names, numbers, phone) with business-relevant details
          - Keep only the idea + structure, not wording
        - Hard anti-copy rules:
          - Do NOT reuse phrases longer than 4 words from the competitor post
          - Do NOT keep proper nouns (club names, cities, people, phone numbers, dates)
          - Do NOT mention the competitor or that this is adapted
        `
      ).join('\n')
      : ` No specific idea provided. Generate a post based only on business context and audience insights.`;
  }

  buildPromptsBlock(prompts: any[]) {
    return prompts
      .filter(p => p.isActive)
      .map((p, i) => `Prompt ${i + 1}: - ${p.text}`)
      .join('\n');
  }
}