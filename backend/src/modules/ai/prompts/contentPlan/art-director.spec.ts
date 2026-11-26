import { artDirectorSystemPrompt, artDirectorTaskBlock } from './art-director';

// ─────────────────────────────────────────────
// artDirectorSystemPrompt
// ─────────────────────────────────────────────
describe('artDirectorSystemPrompt', () => {
  it('contains the OVERLAY TEXT RULES section', () => {
    const result = artDirectorSystemPrompt();

    expect(result).toContain('OVERLAY TEXT RULES');
  });

  it('instructs to generate overlayTexts for each post', () => {
    const result = artDirectorSystemPrompt();

    expect(result).toContain('generate overlayTexts');
  });

  it('requires both Ukrainian and English versions', () => {
    const result = artDirectorSystemPrompt();

    expect(result).toContain('uk');
    expect(result).toContain('en');
  });

  it('defines the heading type rule', () => {
    const result = artDirectorSystemPrompt();

    expect(result).toContain('heading');
  });

  it('defines the subheading type rule', () => {
    const result = artDirectorSystemPrompt();

    expect(result).toContain('subheading');
  });

  it('defines the cta type rule', () => {
    const result = artDirectorSystemPrompt();

    expect(result).toContain('cta');
  });

  it('contains visual direction rules for POST format', () => {
    const result = artDirectorSystemPrompt();

    expect(result).toContain('POST');
  });

  it('contains visual direction rules for REELS format', () => {
    const result = artDirectorSystemPrompt();

    expect(result).toContain('REELS');
  });

  it('contains visual direction rules for STORIES format', () => {
    const result = artDirectorSystemPrompt();

    expect(result).toContain('STORIES');
  });

  it('contains funnel stage rules for TOFU, MOFU, BOFU', () => {
    const result = artDirectorSystemPrompt();

    expect(result).toContain('TOFU');
    expect(result).toContain('MOFU');
    expect(result).toContain('BOFU');
  });

  it('requires designReference to always be written in English', () => {
    const result = artDirectorSystemPrompt();

    expect(result).toContain(
      'designReference MUST always be written in English',
    );
  });
});

// ─────────────────────────────────────────────
// artDirectorTaskBlock
// ─────────────────────────────────────────────
describe('artDirectorTaskBlock', () => {
  const postsJson = JSON.stringify([{ day: 1, topic: 'Brand awareness' }]);

  it('contains the overlayTexts field in the JSON example', () => {
    const result = artDirectorTaskBlock(postsJson, 'Acme Corp', 'English');

    expect(result).toContain('overlayTexts');
  });

  it('includes both uk and en keys in the overlayTexts example', () => {
    const result = artDirectorTaskBlock(postsJson, 'Acme Corp', 'English');

    expect(result).toContain('"uk"');
    expect(result).toContain('"en"');
  });

  it('includes the business name in the task block', () => {
    const result = artDirectorTaskBlock(postsJson, 'Acme Corp', 'English');

    expect(result).toContain('Acme Corp');
  });

  it('includes the language instruction', () => {
    const result = artDirectorTaskBlock(postsJson, 'Acme Corp', 'Ukrainian');

    expect(result).toContain('Ukrainian');
  });

  it('includes the posts content in the task block', () => {
    const result = artDirectorTaskBlock(postsJson, 'Acme Corp', 'English');

    expect(result).toContain('Brand awareness');
  });

  it('instructs to add both designReference and overlayTexts fields', () => {
    const result = artDirectorTaskBlock(postsJson, 'Acme Corp', 'English');

    expect(result).toContain('designReference');
    expect(result).toContain('overlayTexts');
  });

  it('instructs that overlayTexts are always bilingual regardless of language setting', () => {
    const result = artDirectorTaskBlock(postsJson, 'Acme Corp', 'Ukrainian');

    expect(result).toContain('overlayTexts are always bilingual (uk and en)');
  });

  it('instructs that designReference must always be in English', () => {
    const result = artDirectorTaskBlock(postsJson, 'Acme Corp', 'Ukrainian');

    expect(result).toContain(
      'EXCEPT designReference which MUST always be in English',
    );
  });

  it('designReference example in JSON output is in English', () => {
    const result = artDirectorTaskBlock(postsJson, 'Acme Corp', 'English');

    expect(result).toMatch(/flat-lay|composition/i);
  });

  it('includes the OUTPUT FORMAT header', () => {
    const result = artDirectorTaskBlock(postsJson, 'Acme Corp', 'English');

    expect(result).toContain('## OUTPUT FORMAT (STRICT JSON)');
  });

  it('instructs to return only valid JSON without markdown', () => {
    const result = artDirectorTaskBlock(postsJson, 'Acme Corp', 'English');

    expect(result).toContain('Return ONLY valid JSON');
  });
});
