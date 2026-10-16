import {
  copywriterIdeasContext,
  copywriterSystemPrompt,
  copywriterTaskBlock,
} from './copywriter';

// ─────────────────────────────────────────────
// copywriterIdeasContext
// ─────────────────────────────────────────────
describe('copywriterIdeasContext', () => {
  const ideasBlock = 'Idea 1: Summer launch\nIdea 2: Customer story';

  it('returns the IDEA CONTEXT header when ideas are provided', () => {
    const result = copywriterIdeasContext(ideasBlock);

    expect(result).toContain('## IDEA CONTEXT');
  });

  it('instructs to match HOOK tone to the idea feeling when ideas are provided', () => {
    const result = copywriterIdeasContext(ideasBlock);

    expect(result).toContain('Match the HOOK tone to the idea');
  });

  it('instructs to shape THESIS around idea execution when ideas are provided', () => {
    const result = copywriterIdeasContext(ideasBlock);

    expect(result).toContain('Shape the THESIS around the idea');
  });

  it('includes the provided ideas content in the output', () => {
    const result = copywriterIdeasContext(ideasBlock);

    expect(result).toContain('Idea 1: Summer launch');
    expect(result).toContain('Idea 2: Customer story');
  });

  it('instructs to extract structure and psychology from competitor posts, not copy text', () => {
    const result = copywriterIdeasContext(ideasBlock);

    expect(result).toContain('never copy text');
  });

  it('returns empty string when ideasBlock is empty string', () => {
    const result = copywriterIdeasContext('');

    expect(result).toBe('');
  });

  it('returns empty string when ideasBlock is whitespace only', () => {
    const result = copywriterIdeasContext('   ');

    expect(result).toBe('');
  });

  it('returns empty string when ideasBlock is undefined', () => {
    const result = copywriterIdeasContext(undefined as any);

    expect(result).toBe('');
  });

  it('does not include IDEA CONTEXT header when no ideas are provided', () => {
    const result = copywriterIdeasContext('');

    expect(result).not.toContain('## IDEA CONTEXT');
  });
});

// ─────────────────────────────────────────────
// copywriterSystemPrompt
// ─────────────────────────────────────────────
describe('copywriterSystemPrompt', () => {
  it('includes TOFU writing rules', () => {
    const result = copywriterSystemPrompt();

    expect(result).toContain('TOFU');
  });

  it('includes MOFU writing rules', () => {
    const result = copywriterSystemPrompt();

    expect(result).toContain('MOFU');
  });

  it('includes BOFU writing rules', () => {
    const result = copywriterSystemPrompt();

    expect(result).toContain('BOFU');
  });

  it('always includes the hook, thesis, and CTA structure', () => {
    const result = copywriterSystemPrompt();

    expect(result).toContain('Hook');
    expect(result).toContain('Thesis');
    expect(result).toContain('CTA');
  });
});

// ─────────────────────────────────────────────
// copywriterTaskBlock
// ─────────────────────────────────────────────
describe('copywriterTaskBlock', () => {
  const postsJson = JSON.stringify([{ day: 1, topic: 'Brand story' }]);

  it('includes the business name in the task block', () => {
    const result = copywriterTaskBlock(postsJson, 'Acme Corp', 'English');

    expect(result).toContain('Acme Corp');
  });

  it('includes the language instruction in the output format', () => {
    const result = copywriterTaskBlock(postsJson, 'Acme Corp', 'Ukrainian');

    expect(result).toContain('Ukrainian');
  });

  it('includes the posts JSON in the task block', () => {
    const result = copywriterTaskBlock(postsJson, 'Acme Corp', 'English');

    expect(result).toContain('Brand story');
  });

  it('always instructs to keep all strategy fields', () => {
    const result = copywriterTaskBlock(postsJson, 'Acme Corp', 'English');

    expect(result).toContain('Keep all fields from the strategy');
  });

  it('always includes the OUTPUT FORMAT header', () => {
    const result = copywriterTaskBlock(postsJson, 'Acme Corp', 'English');

    expect(result).toContain('## OUTPUT FORMAT (STRICT JSON)');
  });
});
