import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from "@langchain/openai";

@Injectable()
export class AiService {
  private model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      model: 'gpt-4o-mini',
      temperature: 0.2,
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  async normalizeForFacebook(profile: any) {
    const prompt = this.buildPrompt(profile);
    const response = await this.model.invoke(prompt);
    return response.content;
  }

  private buildPrompt(profile: any): string {
    return `
      You are a Facebook Ads search expert.
      
      Business: ${profile.business.industry}
      Geo: ${profile.audiences[0]?.geo}
      
      Products:
      ${profile.products.map(p => `- ${p.name}`).join('\n')}
      
      Audience problems:
      ${profile.audiences[0]?.pains.join('\n')}
      
      Audience expectations:
      ${profile.audiences[0]?.desires.join('\n')}
      
      Generate 10 short Facebook Ads search phrases.
      Rules:
      - max 4 words
      - service-oriented
      - no emotional language
      - realistic ad wording
      - output as plain list
      
      Do NOT use words like:
      fast, quick, reliable, efficient, prompt, speedy, guaranteed, convenient, hassle-free
    `;
  }
}