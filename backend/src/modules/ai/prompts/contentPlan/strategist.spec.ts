import { strategistOutputBlock } from './strategist';

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
