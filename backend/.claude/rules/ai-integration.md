---
paths:
  - "src/modules/ai/**"
  - "src/modules/**/ai*"
  - "src/modules/ideaAI/**"
---

# AI Integration Rules

- `jsonrepair()` before `JSON.parse()` on any AI-generated output
- Zod schema validation on parsed AI responses — never trust raw structure
- Prompts in `src/modules/ai/prompts/` as separate files per content type — not inline strings
- Never trust raw AI output — always validate
- AI errors handled gracefully — service doesn't crash on malformed AI response

| Anti-pattern | Correct approach |
|--------------|------------------|
| `JSON.parse()` on AI output directly | `jsonrepair()` first, then parse, then Zod validate |
| Inline prompt strings in services | Separate prompt file in `src/modules/ai/prompts/` |
| Trusting AI output structure | Zod schema validates every field |
