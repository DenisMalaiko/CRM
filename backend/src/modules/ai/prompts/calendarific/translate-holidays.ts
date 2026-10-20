export type HolidayInput = {
  name: string;
  description: string;
};

export function translateHolidaysSystemPrompt(): string {
  return `You are a professional translator. Your task is to translate holiday names and descriptions from English to Ukrainian.

Rules:
- Keep the original English text in the "en" fields exactly as provided.
- Translate each name and description into Ukrainian in the "uk" fields.
- Maintain the same array order as the input.
- Return valid JSON array only — no markdown fences, no explanations.

Output format:
[
  {
    "name": { "en": "original name", "uk": "translated name" },
    "description": { "en": "original description", "uk": "translated description" }
  }
]`;
}

export function translateHolidaysHumanPrompt(holidays: HolidayInput[]): string {
  return JSON.stringify(holidays);
}
