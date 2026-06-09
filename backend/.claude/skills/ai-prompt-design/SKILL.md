---
name: ai-prompt-design
description: Checklist for creating or editing AI prompts with proper validation. Use when adding new AI generation features or modifying existing prompts. Ensures jsonrepair, Zod validation, and proper file organization.
allowed-tools: Read Grep Glob Edit Write
---

## AI Prompt Design Checklist

### Step 1 — Define the output schema
- [ ] Create a Zod schema for the expected AI response shape
- [ ] Include all required fields with correct types
- [ ] Add `.describe()` on complex fields for self-documentation
- [ ] Export the schema and inferred type

### Step 2 — Write the prompt
- [ ] Create a new file in `src/modules/ai/prompts/<content-type>.ts`
- [ ] Structure: system message (role + rules) → user message (context + task)
- [ ] Include output format instructions (JSON schema description in the prompt)
- [ ] Keep prompts focused — one task per prompt
- [ ] Use template literals for dynamic context injection

### Step 3 — Implement the service method
- [ ] Call the AI provider (OpenAI / LangChain)
- [ ] Extract raw text from AI response
- [ ] Parse: `jsonrepair(rawText)` → `JSON.parse()` → Zod `.parse()`
- [ ] Handle errors gracefully: wrap in try/catch, throw NestJS exception on failure
- [ ] Return typed result (Zod inferred type)

### Step 4 — Wire up the prompt
```ts
// Pattern:
const raw = await this.openai.chat.completions.create({ ... });
const text = raw.choices[0]?.message?.content ?? '';
const repaired = jsonrepair(text);
const parsed = JSON.parse(repaired);
const validated = MySchema.parse(parsed);
return validated;
```

### Step 5 — Test
- [ ] Valid JSON response → correct output
- [ ] Malformed JSON → `jsonrepair` handles it
- [ ] Wrong schema → Zod throws, service catches gracefully
- [ ] Empty/null AI response → handled without crash

### Anti-Patterns
| Bad | Good |
|-----|------|
| `JSON.parse(aiResponse)` | `JSON.parse(jsonrepair(aiResponse))` |
| Inline prompt in service | Separate file in `prompts/` |
| No schema validation | Zod `.parse()` on every AI response |
| Trusting AI field names | Zod enforces exact schema |
