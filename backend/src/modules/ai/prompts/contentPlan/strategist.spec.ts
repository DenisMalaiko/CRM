import { strategistIdeasBlock, strategistOutputBlock } from './strategist';

// ─────────────────────────────────────────────
// strategistOutputBlock
// ─────────────────────────────────────────────
describe('strategistOutputBlock', () => {
  it('uses generic title hint when no products and no ideas are provided', () => {
    const result = strategistOutputBlock('English');

    expect(result).toContain('short name for the content plan (5-10 words)');
  });

  it('uses generic description hint when no products and no ideas are provided', () => {
    const result = strategistOutputBlock('English');

    expect(result).toContain(
      "brief summary of the plan's funnel strategy (2-3 sentences)",
    );
  });

  it('does not include MUST reference instruction when no products and no ideas are provided', () => {
    const result = strategistOutputBlock('English');

    expect(result).not.toContain('MUST reference');
  });

  it('uses generic hints when both arrays are explicitly passed as empty', () => {
    const result = strategistOutputBlock('English', [], []);

    expect(result).toContain('short name for the content plan (5-10 words)');
    expect(result).not.toContain('MUST reference');
  });

  it('title hint references product names when only products are provided', () => {
    const result = strategistOutputBlock('English', ['Supplement A', 'App B']);

    expect(result).toContain('MUST reference the source');
    expect(result).toContain('products/services: Supplement A, App B');
  });

  it('description hint mentions products when only products are provided', () => {
    const result = strategistOutputBlock('English', ['Supplement A', 'App B']);

    expect(result).toContain('Mention that this plan is built around');
    expect(result).toContain('products/services: Supplement A, App B');
  });

  it('title hint does not reference ideas when only products are provided', () => {
    const result = strategistOutputBlock('English', ['Supplement A']);

    expect(result).not.toContain('ideas:');
  });

  it('title hint references idea names when only ideas are provided', () => {
    const result = strategistOutputBlock(
      'English',
      [],
      ['Summer campaign', 'Launch promo'],
    );

    expect(result).toContain('MUST reference the source');
    expect(result).toContain('ideas: Summer campaign, Launch promo');
  });

  it('description hint mentions ideas when only ideas are provided', () => {
    const result = strategistOutputBlock(
      'English',
      [],
      ['Summer campaign', 'Launch promo'],
    );

    expect(result).toContain('Mention that this plan is built around');
    expect(result).toContain('ideas: Summer campaign, Launch promo');
  });

  it('title hint does not reference products when only ideas are provided', () => {
    const result = strategistOutputBlock('English', [], ['Summer campaign']);

    expect(result).not.toContain('products/services:');
  });

  it('title hint references both ideas and products when both are provided', () => {
    const result = strategistOutputBlock(
      'English',
      ['Supplement A'],
      ['Summer campaign'],
    );

    expect(result).toContain('ideas: Summer campaign');
    expect(result).toContain('products/services: Supplement A');
  });

  it('lists ideas before products in the hint when both are provided', () => {
    const result = strategistOutputBlock('English', ['Product X'], ['Idea Y']);

    const ideasIndex = result.indexOf('ideas: Idea Y');
    const productsIndex = result.indexOf('products/services: Product X');

    expect(ideasIndex).toBeGreaterThan(-1);
    expect(productsIndex).toBeGreaterThan(-1);
    expect(ideasIndex).toBeLessThan(productsIndex);
  });

  it('always includes the specified language in the output language instruction', () => {
    const result = strategistOutputBlock('Ukrainian');

    expect(result).toContain('ALL text fields MUST be written in Ukrainian');
  });

  it('repeats the language in the ALL text fields MUST be in rule at the end', () => {
    const result = strategistOutputBlock('Spanish');

    const matches = result.match(/Spanish/g) ?? [];
    expect(matches.length).toBeGreaterThanOrEqual(2);
  });

  it('always includes the OUTPUT FORMAT header', () => {
    const result = strategistOutputBlock('English');

    expect(result).toContain('## OUTPUT FORMAT (STRICT JSON)');
  });

  it('always includes exactly 10 posts rule', () => {
    const result = strategistOutputBlock('English');

    expect(result).toContain('Generate exactly 10 posts');
  });
});

// ─────────────────────────────────────────────
// strategistIdeasBlock
// ─────────────────────────────────────────────
describe('strategistIdeasBlock', () => {
  const ideasBlock = 'Idea 1: Launch campaign\nIdea 2: Behind the scenes';

  it('returns PRIMARY DRIVER header when ideas are provided', () => {
    const result = strategistIdeasBlock(ideasBlock);

    expect(result).toContain('CREATIVE DIRECTION FROM IDEAS (PRIMARY)');
  });

  it('labels ideas as the PRIMARY DRIVER when ideas are provided', () => {
    const result = strategistIdeasBlock(ideasBlock);

    expect(result).toContain('PRIMARY DRIVER');
  });

  it('includes the MUST become at least one post directive when ideas are provided', () => {
    const result = strategistIdeasBlock(ideasBlock);

    expect(result).toContain('MUST become at least one post');
  });

  it('includes the IDEA-DRIVEN PLANNING RULES section when ideas are provided', () => {
    const result = strategistIdeasBlock(ideasBlock);

    expect(result).toContain('IDEA-DRIVEN PLANNING RULES');
  });

  it('includes the provided ideas content in the output', () => {
    const result = strategistIdeasBlock(ideasBlock);

    expect(result).toContain('Idea 1: Launch campaign');
    expect(result).toContain('Idea 2: Behind the scenes');
  });

  it('includes additional context when both ideas and context are provided', () => {
    const result = strategistIdeasBlock(ideasBlock, 'Focus on summer theme');

    expect(result).toContain('Additional context:');
    expect(result).toContain('Focus on summer theme');
  });

  it('does not include additional context section when context is empty string', () => {
    const result = strategistIdeasBlock(ideasBlock, '');

    expect(result).not.toContain('Additional context:');
  });

  it('does not include additional context section when context is whitespace only', () => {
    const result = strategistIdeasBlock(ideasBlock, '   ');

    expect(result).not.toContain('Additional context:');
  });

  it('returns fallback no-ideas text when ideasBlock is empty string', () => {
    const result = strategistIdeasBlock('');

    expect(result).toContain('No specific ideas provided');
  });

  it('returns fallback no-ideas text when ideasBlock is whitespace only', () => {
    const result = strategistIdeasBlock('   ');

    expect(result).toContain('No specific ideas provided');
  });

  it('does not include PRIMARY DRIVER language in fallback when no ideas provided', () => {
    const result = strategistIdeasBlock('');

    expect(result).not.toContain('PRIMARY DRIVER');
  });

  it('returns context-only block when no ideas but context is provided', () => {
    const result = strategistIdeasBlock('', 'Promote end-of-year deals');

    expect(result).toContain('## CREATIVE DIRECTION');
    expect(result).toContain('Promote end-of-year deals');
  });

  it('does not include IDEA-DRIVEN PLANNING RULES in context-only block', () => {
    const result = strategistIdeasBlock('', 'Promote end-of-year deals');

    expect(result).not.toContain('IDEA-DRIVEN PLANNING RULES');
  });

  it('returns generic fallback when neither ideas nor context are provided', () => {
    const result = strategistIdeasBlock('');

    expect(result).toContain('## CREATIVE DIRECTION');
    expect(result).toContain('No specific ideas provided');
    expect(result).toContain('business context');
  });
});
