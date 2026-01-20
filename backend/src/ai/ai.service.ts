import { Injectable } from '@nestjs/common';
import { ChatOpenAI } from "@langchain/openai";
import {toArray} from "rxjs";

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
    return JSON.parse(response.content);
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
      
      Generate 10 Facebook Ads search words that would help people find your business on Facebook.
      
      Rules:s
      - service-oriented wording
      - realistic ad wording used in real ads
      - NO emotional or promotional language
      - each word MUST clearly relate to the business products or services listed above
      - avoid generic phrases that could apply to any business
      - output as plain list
      
      CRITICAL OUTPUT RULES:
      - Output ONLY a valid JSON array of strings
      - Do NOT include markdown
      - Do NOT include code blocks
      - Do NOT include explanations
      - Do NOT include labels
      - Do NOT include backticks
      - The response must start with '[' and end with ']'
      
      Example of VALID output:
      ["engine oil change service","car oil filter replacement"]
      
      Return ONLY the JSON array.
    `;
  }
}