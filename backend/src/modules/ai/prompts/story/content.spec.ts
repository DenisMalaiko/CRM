import {
  storyBusinessContextBlock,
  storyIdeaBlock,
  storyImagePromptBlock,
} from './content';
import { GalleryPhotoType } from '@prisma/client';

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

// ─────────────────────────────────────────────
// storyImagePromptBlock
// ─────────────────────────────────────────────
describe('storyImagePromptBlock', () => {
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

  const businessPhoto = {
    type: GalleryPhotoType.Image,
    url: 'https://s3.example.com/photos/runway-shot.jpg',
  };

  const decorationPhoto = {
    type: GalleryPhotoType.Decoration,
    url: 'https://s3.example.com/photos/sparkle-overlay.png',
  };

  const imagePrompts = ['Story headline', 'Supporting text', 'Swipe CTA'];

  it('WITHOUT userPrompt — contains "DO NOT invent anything" rule', () => {
    const result = storyImagePromptBlock(imagePrompts, baseProfile, [], undefined);
    expect(result).toContain('DO NOT invent anything');
  });

  it('WITHOUT userPrompt — contains "Describe ONLY the provided images" rule', () => {
    const result = storyImagePromptBlock(imagePrompts, baseProfile, [], undefined);
    expect(result).toContain('Describe ONLY the provided images');
  });

  it('WITHOUT userPrompt — does NOT contain user scenario language in rules', () => {
    const result = storyImagePromptBlock(imagePrompts, baseProfile, [], undefined);
    expect(result).not.toContain("Reflect the user's described scenario");
  });

  it('WITH userPrompt and NO photos — scene contains the user prompt text', () => {
    const userPrompt = 'Show models at Paris Fashion Week';
    const result = storyImagePromptBlock(imagePrompts, baseProfile, [], userPrompt);
    expect(result).toContain('Show models at Paris Fashion Week');
  });

  it('WITH userPrompt and NO photos — scene uses "Create a scene" phrasing', () => {
    const userPrompt = 'Show models at Paris Fashion Week';
    const result = storyImagePromptBlock(imagePrompts, baseProfile, [], userPrompt);
    expect(result).toContain('Create a scene that visually represents');
  });

  it('WITH userPrompt and NO photos — does NOT contain "DO NOT invent anything" rule', () => {
    const userPrompt = 'Show models at Paris Fashion Week';
    const result = storyImagePromptBlock(imagePrompts, baseProfile, [], userPrompt);
    expect(result).not.toContain('DO NOT invent anything');
  });

  it('WITH userPrompt and NO photos — rules reference user scenario instead of "invent" restriction', () => {
    const userPrompt = 'Show models at Paris Fashion Week';
    const result = storyImagePromptBlock(imagePrompts, baseProfile, [], userPrompt);
    expect(result).toContain("Reflect the user's described scenario");
  });

  it('WITH userPrompt and WITH photos — scene contains both photo instructions and user prompt', () => {
    const userPrompt = 'Emphasize the spring collection launch';
    const result = storyImagePromptBlock(imagePrompts, baseProfile, [businessPhoto], userPrompt);
    expect(result).toContain('runway-shot.jpg');
    expect(result).toContain('Emphasize the spring collection launch');
  });

  it('WITH userPrompt and WITH photos — scene appends user context to photo instructions', () => {
    const userPrompt = 'Emphasize the spring collection launch';
    const result = storyImagePromptBlock(imagePrompts, baseProfile, [businessPhoto], userPrompt);
    expect(result).toContain("incorporate the user's specific request into the scene");
  });

  it('WITH userPrompt and WITH photos — rules reference user scenario', () => {
    const userPrompt = 'Emphasize the spring collection launch';
    const result = storyImagePromptBlock(imagePrompts, baseProfile, [businessPhoto], userPrompt);
    expect(result).toContain("Reflect the user's described scenario");
    expect(result).not.toContain('DO NOT invent anything');
  });

  it('WITH userPrompt — user prompt text appears in the UserPrompt section', () => {
    const userPrompt = 'Tease the upcoming summer drop';
    const result = storyImagePromptBlock(imagePrompts, baseProfile, [], userPrompt);
    const userPromptSectionIndex = result.indexOf('Original user request');
    expect(userPromptSectionIndex).toBeGreaterThan(-1);
    expect(result.slice(userPromptSectionIndex)).toContain('Tease the upcoming summer drop');
  });

  it('WITH userPrompt and decoration photos — scene contains both photo and user prompt details', () => {
    const userPrompt = 'Celebrate brand anniversary 2025';
    const result = storyImagePromptBlock(imagePrompts, baseProfile, [businessPhoto, decorationPhoto], userPrompt);
    expect(result).toContain('runway-shot.jpg');
    expect(result).toContain('sparkle-overlay.png');
    expect(result).toContain('Celebrate brand anniversary 2025');
  });

  it('WITHOUT userPrompt — no "Original user request" section appears', () => {
    const result = storyImagePromptBlock(imagePrompts, baseProfile, [], undefined);
    expect(result).not.toContain('Original user request');
  });
});
