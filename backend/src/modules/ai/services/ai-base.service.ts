import { Injectable, Logger } from '@nestjs/common';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { jsonrepair } from 'jsonrepair';
import * as process from 'node:process';

export enum AiModel {
  Fast = 'fast',
  Smart = 'smart',
  Creative = 'creative',
}

interface ModelConfig {
  provider: 'openai' | 'anthropic';
  model: string;
  temperature: number;
}

const MODEL_CONFIG: Record<AiModel, ModelConfig> = {
  [AiModel.Fast]: {
    provider: 'openai',
    model: 'gpt-4o-mini',
    temperature: 0.2,
  },
  [AiModel.Smart]: {
    provider: 'anthropic',
    model: 'claude-sonnet-4-20250514',
    temperature: 0.3,
  },
  [AiModel.Creative]: {
    provider: 'openai',
    model: 'gpt-4o',
    temperature: 0.7,
  },
};

@Injectable()
export class AiBaseService {
  private readonly models = new Map<AiModel, BaseChatModel>();
  readonly logger = new Logger(AiBaseService.name);

  constructor() {
    for (const [role, config] of Object.entries(MODEL_CONFIG)) {
      this.models.set(role as AiModel, this.createModel(config));
    }
  }

  getModel(role: AiModel): BaseChatModel {
    const model = this.models.get(role);
    if (!model) {
      throw new Error(`AI model not configured for role: ${role}`);
    }
    return model;
  }

  private createModel(config: ModelConfig): BaseChatModel {
    switch (config.provider) {
      case 'openai':
        return new ChatOpenAI({
          model: config.model,
          temperature: config.temperature,
          apiKey: process.env.OPENAI_API_KEY,
        });
      case 'anthropic':
        return new ChatAnthropic({
          model: config.model,
          temperature: config.temperature,
          apiKey: process.env.ANTHROPIC_API_KEY,
        });
    }
  }

  safeParseJson(text: string): any {
    try {
      return JSON.parse(jsonrepair(text));
    } catch (e) {
      this.logger.error('Failed to parse AI JSON response', text);
      throw new Error('AI returned malformed JSON');
    }
  }

  extractTextContent(content: any): string {
    if (typeof content === 'string') {
      return content;
    }

    if (Array.isArray(content)) {
      return content
        .map((block) => {
          if (typeof block === 'string') return block;
          if ('text' in block) return block.text;
          return '';
        })
        .join('');
    }

    return '';
  }

  getAudiences(audiences?) {
    if (!audiences?.length) return '';
    return audiences
      .map(
        (a, i) => `
        Audience ${i + 1}:
        - Age range: ${a.ageRange}
        - Gender: ${a.gender ?? 'any'}
        - Location: ${a.geo}
        - Pains: ${a.pains.join(', ')}
        - Desires: ${a.desires.join(', ')}
        - Triggers: ${a.triggers.join(', ')}
        - Income level: ${a.incomeLevel ?? 'not specified'}
        `,
      )
      .join('\n');
  }

  getProducts(products?) {
    if (!products?.length) return '';
    return products
      .filter((p) => p.isActive)
      .map(
        (p, i) => `
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
        `,
      )
      .join('\n');
  }

  getIdeas(ideas?) {
    return ideas && ideas.length
      ? ideas
          .map(
            (idea, i) => `
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
        `,
          )
          .join('\n')
      : ` No specific idea provided. Generate a post based only on business context and audience insights.`;
  }

  buildPromptsBlock(prompts: any[]) {
    return prompts
      .filter((p) => p.isActive)
      .map((p, i) => `Prompt ${i + 1}: - ${p.text}`)
      .join('\n');
  }
}
