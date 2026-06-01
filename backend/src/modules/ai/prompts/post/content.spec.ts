import {
  postBusinessContextBlock,
  postIdeaBlock,
} from './content';

// ─────────────────────────────────────────────
// postBusinessContextBlock
// ─────────────────────────────────────────────
describe('postBusinessContextBlock', () => {
  const baseProfile = {
    name: null,
    business: {
      name: 'Acme Corp',
      industry: 'E-commerce',
      website: 'https://acme.com',
      language: 'English',
      brand: 'Trusted since 2010',
      advantages: ['Fast delivery', 'Best prices'],
      goals: ['Grow market share'],
    },
  };

  it('omits the Target audience section when audienceBlock is empty string', () => {
    const result = postBusinessContextBlock(baseProfile, '', 'Products block');
    expect(result).not.toContain('Target audience:');
  });

  it('omits the Target audience section when audienceBlock is null', () => {
    const result = postBusinessContextBlock(baseProfile, null, 'Products block');
    expect(result).not.toContain('Target audience:');
  });

  it('includes the Target audience section when audienceBlock has content', () => {
    const result = postBusinessContextBlock(baseProfile, 'Audience 1: Age 25-35', 'Products block');
    expect(result).toContain('Target audience:');
    expect(result).toContain('Audience 1: Age 25-35');
  });

  it('omits the Products/services section when productsBlock is empty string', () => {
    const result = postBusinessContextBlock(baseProfile, 'Audience block', '');
    expect(result).not.toContain('Products / services:');
  });

  it('omits the Products/services section when productsBlock is null', () => {
    const result = postBusinessContextBlock(baseProfile, 'Audience block', null);
    expect(result).not.toContain('Products / services:');
  });

  it('includes the Products/services section when productsBlock has content', () => {
    const result = postBusinessContextBlock(baseProfile, '', 'Product 1: Membership');
    expect(result).toContain('Products / services:');
    expect(result).toContain('Product 1: Membership');
  });

  it('omits both sections when both blocks are empty strings', () => {
    const result = postBusinessContextBlock(baseProfile, '', '');
    expect(result).not.toContain('Target audience:');
    expect(result).not.toContain('Products / services:');
  });

  it('includes both sections when both blocks have content', () => {
    const result = postBusinessContextBlock(baseProfile, 'Audience info', 'Product info');
    expect(result).toContain('Target audience:');
    expect(result).toContain('Products / services:');
  });

  it('always includes business name, website, and language regardless of optional blocks', () => {
    const result = postBusinessContextBlock(baseProfile, '', '');
    expect(result).toContain('Acme Corp');
    expect(result).toContain('https://acme.com');
    expect(result).toContain('English');
  });
});

// ─────────────────────────────────────────────
// postIdeaBlock
// ─────────────────────────────────────────────
describe('postIdeaBlock', () => {
  it('returns the fallback CREATIVE DIRECTION block when ideasBlock is empty string', () => {
    const result = postIdeaBlock('');
    expect(result).toContain('CREATIVE DIRECTION');
    expect(result).toContain('No specific creative idea was provided');
  });

  it('returns the fallback CREATIVE DIRECTION block when ideasBlock is undefined', () => {
    const result = postIdeaBlock(undefined as any);
    expect(result).toContain('CREATIVE DIRECTION');
    expect(result).toContain('No specific creative idea was provided');
  });

  it('returns the fallback CREATIVE DIRECTION block when ideasBlock is whitespace only', () => {
    const result = postIdeaBlock('   ');
    expect(result).toContain('CREATIVE DIRECTION');
    expect(result).toContain('No specific creative idea was provided');
  });

  it('returns the CREATIVE IDEA block when ideasBlock has real content', () => {
    const ideasBlock = 'Idea 1: Use storytelling to connect with the audience.';
    const result = postIdeaBlock(ideasBlock);
    expect(result).toContain('CREATIVE IDEA');
    expect(result).toContain(ideasBlock);
  });

  it('does not include the fallback text when ideasBlock has real content', () => {
    const ideasBlock = 'Idea 1: Creative direction here.';
    const result = postIdeaBlock(ideasBlock);
    expect(result).not.toContain('No specific creative idea was provided');
  });
});
