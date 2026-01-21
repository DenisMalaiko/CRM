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

  async generateResultForFacebook(result) {
    const prompt = this.buildResultPrompt(result);
    const response = await this.model.invoke(prompt);
    return JSON.parse(response.content);
  }

  private buildPrompt(profile: any): string {
    return `
       You are a Facebook Ads copy and search expert.
      
      Your task is to generate Facebook Ads search PHRASES
      that closely match how REAL Facebook ads are written.
      
      Business industry:
      ${profile.business.industry}
      
      Products / services:
      ${profile.products.map(p => `- ${p.name}`).join('\n')}
      
      Audience problems:
      ${profile.audiences[0]?.pains.join('\n')}
      
      Audience expectations:
      ${profile.audiences[0]?.desires.join('\n')}
      
      INSTRUCTIONS:
      - Generate between 50 and 100 search phrases
      - EACH phrase MUST be between 15 and 45 characters long
      - Phrases MUST look like real Facebook ad headlines or short ad text
      - Focus on SERVICE intent, not product catalog wording
      - Use simple, common words used by real advertisers
      - Prefer short combinations like:
        - service + object
        - repair + object
        - maintenance + object
      - Avoid long sentences
      - Avoid descriptive or explanatory language
      - Avoid emotional or promotional words
      - Avoid prices, discounts, free offers
      - Avoid geo names
      
      CRITICAL OUTPUT RULES:
      - Output ONLY a valid JSON array of strings
      - Do NOT include markdown
      - Do NOT include explanations
      - Do NOT include labels
      - Do NOT include backticks
      - The response must start with '[' and end with ']'
      - No duplicates or near-duplicates
      - Each string must be under 45 characters
      
      Example of VALID output:
      [
        "oil change service",
        "car maintenance service",
        "engine oil replacement",
        "vehicle inspection service"
      ]
      
      Return ONLY the JSON array.
    `;
  }

  private buildResultPrompt(result: any) {
    return `
      You are a Facebook Ads copywriter.

      Your task is to generate READY-TO-PUBLISH Facebook ad creatives.
      
      Business industry:
      ${result.industry}
      
      Campaign focus:
      ${result.profile_focus}
      
      Business services:
      ${result.products}
      
      Audience priorities:
      ${result.goals}
      
      Reference Facebook ads copy (for style and wording only):
      ${result.facebookAds}
      
      INSTRUCTIONS:
      - Generate 3 Facebook ad creatives
      - Ads must be ready for immediate use
      - Do NOT copy competitor ads directly
      - Use similar wording style and tone as the reference ads
      - Focus on services, not physical products
      - Emphasize audience priorities when relevant
      - Keep language simple and realistic, like real Facebook ads
      
      CONTENT RULES:
      - No prices
      - No discounts
      - No coupons
      - No emojis
      - No hashtags
      - No URLs
      - No brand names from competitors
      
      FORMAT RULES:
      - Headline: max 30 characters
      - Primary text: max 120 characters
      - CTA: must match the campaign focus
      
      Return ONLY a valid JSON array in this format:
      
      [
        {
          "headline": "",
          "primary_text": "",
          "cta": ""
        }
      ]
    `
  }
}