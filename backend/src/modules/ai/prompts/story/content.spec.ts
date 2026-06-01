import {
  storyBusinessContextBlock,
  storyIdeaBlock,
} from './content';

// ─────────────────────────────────────────────
// storyBusinessContextBlock
// ─────────────────────────────────────────────
describe('storyBusinessContextBlock', () => {
  const baseProfile = {
    name: null,
    business: {
      name: 'Story Biz',
      industry: 'Fashion',
      website: 'https://storybiz.com',
      language: 'Ukrainian',
      brand: 'Bold and modern',
      advantages: ['Unique designs', 'Fast turnaround'],
      goals: ['Build brand awareness'],
    },
  };

  it('omits the Target audience section when audienceBlock is empty string', () => {
    const result = storyBusinessContextBlock(baseProfile, '', 'Products block');
    expect(result).not.toContain('Target audience:');
  });

  it('omits the Target audience section when audienceBlock is null', () => {
    const result = storyBusinessContextBlock(baseProfile, null, 'Products block');
    expect(result).not.toContain('Target audience:');
  });

  it('includes the Target audience section when audienceBlock has content', () => {
    const result = storyBusinessContextBlock(baseProfile, 'Audience 1: Female 18-25', 'Products block');
    expect(result).toContain('Target audience:');
    expect(result).toContain('Audience 1: Female 18-25');
  });

  it('omits the Products/services section when productsBlock is empty string', () => {
    const result = storyBusinessContextBlock(baseProfile, 'Audience block', '');
    expect(result).not.toContain('Products / services:');
  });

  it('omits the Products/services section when productsBlock is null', () => {
    const result = storyBusinessContextBlock(baseProfile, 'Audience block', null);
    expect(result).not.toContain('Products / services:');
  });

  it('includes the Products/services section when productsBlock has content', () => {
    const result = storyBusinessContextBlock(baseProfile, '', 'Product 1: Dress');
    expect(result).toContain('Products / services:');
    expect(result).toContain('Product 1: Dress');
  });

  it('omits both sections when both blocks are empty strings', () => {
    const result = storyBusinessContextBlock(baseProfile, '', '');
    expect(result).not.toContain('Target audience:');
    expect(result).not.toContain('Products / services:');
  });

  it('includes both sections when both blocks have content', () => {
    const result = storyBusinessContextBlock(baseProfile, 'Audience info', 'Product info');
    expect(result).toContain('Target audience:');
    expect(result).toContain('Products / services:');
  });

  it('always includes business name, website, and language regardless of optional blocks', () => {
    const result = storyBusinessContextBlock(baseProfile, '', '');
    expect(result).toContain('Story Biz');
    expect(result).toContain('https://storybiz.com');
    expect(result).toContain('Ukrainian');
  });
});

// ─────────────────────────────────────────────
// storyIdeaBlock
// ─────────────────────────────────────────────
describe('storyIdeaBlock', () => {
  it('returns the fallback CREATIVE DIRECTION block when ideasBlock is empty string', () => {
    const result = storyIdeaBlock('');
    expect(result).toContain('CREATIVE DIRECTION');
    expect(result).toContain('No specific creative idea was provided');
  });

  it('returns the fallback CREATIVE DIRECTION block when ideasBlock is undefined', () => {
    const result = storyIdeaBlock(undefined as any);
    expect(result).toContain('CREATIVE DIRECTION');
    expect(result).toContain('No specific creative idea was provided');
  });

  it('returns the fallback CREATIVE DIRECTION block when ideasBlock is whitespace only', () => {
    const result = storyIdeaBlock('   ');
    expect(result).toContain('CREATIVE DIRECTION');
    expect(result).toContain('No specific creative idea was provided');
  });

  it('returns the CREATIVE IDEA block when ideasBlock has real content', () => {
    const ideasBlock = 'Idea 1: A visual countdown to a product launch.';
    const result = storyIdeaBlock(ideasBlock);
    expect(result).toContain('CREATIVE IDEA');
    expect(result).toContain(ideasBlock);
  });

  it('does not include the fallback text when ideasBlock has real content', () => {
    const ideasBlock = 'Idea 1: Bold visual narrative.';
    const result = storyIdeaBlock(ideasBlock);
    expect(result).not.toContain('No specific creative idea was provided');
  });

  it('includes a directive to follow the narrative direction when ideasBlock has content', () => {
    const ideasBlock = 'Idea 1: Bold visual narrative.';
    const result = storyIdeaBlock(ideasBlock);
    expect(result).toContain('narrative direction');
  });
});
