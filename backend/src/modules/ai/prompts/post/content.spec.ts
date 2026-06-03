import {
  postBusinessContextBlock,
  postIdeaBlock,
  postImagePromptBlock,
} from './content';
import { GalleryPhotoType } from '@prisma/client';

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

// ─────────────────────────────────────────────
// postImagePromptBlock
// ─────────────────────────────────────────────
describe('postImagePromptBlock', () => {
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

  const businessPhoto = {
    type: GalleryPhotoType.Image,
    url: 'https://s3.example.com/photos/product-shot.jpg',
  };

  const decorationPhoto = {
    type: GalleryPhotoType.Decoration,
    url: 'https://s3.example.com/photos/star-icon.png',
  };

  const imagePrompts = ['Bold headline here', 'Subheading text', 'CTA text'];

  it('WITHOUT userPrompt — contains "DO NOT invent anything" rule', () => {
    const result = postImagePromptBlock(imagePrompts, baseProfile, [], undefined);
    expect(result).toContain('DO NOT invent anything');
  });

  it('WITHOUT userPrompt — contains "Describe ONLY the provided images" rule', () => {
    const result = postImagePromptBlock(imagePrompts, baseProfile, [], undefined);
    expect(result).toContain('Describe ONLY the provided images');
  });

  it('WITHOUT userPrompt — does NOT contain user scenario language in rules', () => {
    const result = postImagePromptBlock(imagePrompts, baseProfile, [], undefined);
    expect(result).not.toContain("Reflect the user's described scenario");
  });

  it('WITH userPrompt and NO photos — scene contains the user prompt text', () => {
    const userPrompt = 'Show a Christmas market in Vienna';
    const result = postImagePromptBlock(imagePrompts, baseProfile, [], userPrompt);
    expect(result).toContain('Show a Christmas market in Vienna');
  });

  it('WITH userPrompt and NO photos — scene uses "Create a scene" phrasing', () => {
    const userPrompt = 'Show a Christmas market in Vienna';
    const result = postImagePromptBlock(imagePrompts, baseProfile, [], userPrompt);
    expect(result).toContain('Create a scene that visually represents');
  });

  it('WITH userPrompt and NO photos — does NOT contain "DO NOT invent anything" rule', () => {
    const userPrompt = 'Show a Christmas market in Vienna';
    const result = postImagePromptBlock(imagePrompts, baseProfile, [], userPrompt);
    expect(result).not.toContain('DO NOT invent anything');
  });

  it('WITH userPrompt and NO photos — rules reference user scenario instead of "invent" restriction', () => {
    const userPrompt = 'Show a Christmas market in Vienna';
    const result = postImagePromptBlock(imagePrompts, baseProfile, [], userPrompt);
    expect(result).toContain("Reflect the user's described scenario");
  });

  it('WITH userPrompt and WITH photos — scene contains both photo instructions and user prompt', () => {
    const userPrompt = 'Add a festive holiday atmosphere';
    const result = postImagePromptBlock(imagePrompts, baseProfile, [businessPhoto], userPrompt);
    expect(result).toContain('product-shot.jpg');
    expect(result).toContain('Add a festive holiday atmosphere');
  });

  it('WITH userPrompt and WITH photos — scene appends user context to photo instructions', () => {
    const userPrompt = 'Add a festive holiday atmosphere';
    const result = postImagePromptBlock(imagePrompts, baseProfile, [businessPhoto], userPrompt);
    expect(result).toContain("incorporate the user's specific request into the scene");
  });

  it('WITH userPrompt and WITH photos — rules reference user scenario', () => {
    const userPrompt = 'Add a festive holiday atmosphere';
    const result = postImagePromptBlock(imagePrompts, baseProfile, [businessPhoto], userPrompt);
    expect(result).toContain("Reflect the user's described scenario");
    expect(result).not.toContain('DO NOT invent anything');
  });

  it('WITH userPrompt — user prompt text appears in the UserPrompt section', () => {
    const userPrompt = 'Highlight the summer sale event';
    const result = postImagePromptBlock(imagePrompts, baseProfile, [], userPrompt);
    const userPromptSectionIndex = result.indexOf('Original user request');
    expect(userPromptSectionIndex).toBeGreaterThan(-1);
    expect(result.slice(userPromptSectionIndex)).toContain('Highlight the summer sale event');
  });

  it('WITH userPrompt and decoration photos — scene contains both photo and user prompt details', () => {
    const userPrompt = 'Celebrate New Year 2025';
    const result = postImagePromptBlock(imagePrompts, baseProfile, [businessPhoto, decorationPhoto], userPrompt);
    expect(result).toContain('product-shot.jpg');
    expect(result).toContain('star-icon.png');
    expect(result).toContain('Celebrate New Year 2025');
  });

  it('WITHOUT userPrompt — no "Original user request" section appears', () => {
    const result = postImagePromptBlock(imagePrompts, baseProfile, [], undefined);
    expect(result).not.toContain('Original user request');
  });
});
