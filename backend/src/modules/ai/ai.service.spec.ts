import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';

import { AiService } from './ai.service';
import { AiReplicateService } from './ai-replicate.service';
import { S3Service } from '../../core/s3/s3.service';

// ─────────────────────────────────────────────
// getAudiences / getProducts — empty-input handling
// ─────────────────────────────────────────────
describe('AiService — getAudiences / getProducts (unit-level)', () => {
  let module: TestingModule;
  let service: AiService;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [
        AiService,
        {
          provide: AiReplicateService,
          useValue: {
            generateAndSaveVideo: jest.fn(),
            generatePostImage: jest.fn(),
            generateStoryImage: jest.fn(),
            startAiPhotoJobAsync: jest.fn(),
            pollAndSaveImage: jest.fn(),
            buildPostImagePrompt: jest.fn(),
            buildStoryImagePrompt: jest.fn(),
            generateAiPhoto: jest.fn(),
          },
        },
        { provide: S3Service, useValue: { upload: jest.fn(), delete: jest.fn() } },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
  });

  afterAll(async () => {
    await module.close();
  });

  describe('getAudiences', () => {
    it('returns empty string when called with undefined', () => {
      expect(service.getAudiences(undefined)).toBe('');
    });

    it('returns empty string when called with an empty array', () => {
      expect(service.getAudiences([])).toBe('');
    });

    it('returns a non-empty string containing audience fields when valid data is provided', () => {
      const audiences = [
        {
          ageRange: '25-35',
          gender: 'Female',
          geo: 'Kyiv',
          pains: ['lack of time'],
          desires: ['convenience'],
          triggers: ['discounts'],
          incomeLevel: 'Middle',
        },
      ];
      const result = service.getAudiences(audiences);
      expect(result).toBeTruthy();
      expect(result).toContain('25-35');
      expect(result).toContain('Kyiv');
      expect(result).toContain('lack of time');
    });

    it('formats multiple audiences with sequential numbering', () => {
      const audiences = [
        {
          ageRange: '20-30',
          gender: null,
          geo: 'Lviv',
          pains: ['pain1'],
          desires: ['desire1'],
          triggers: ['trigger1'],
          incomeLevel: null,
        },
        {
          ageRange: '30-40',
          gender: 'Male',
          geo: 'Odesa',
          pains: ['pain2'],
          desires: ['desire2'],
          triggers: ['trigger2'],
          incomeLevel: 'High',
        },
      ];
      const result = service.getAudiences(audiences);
      expect(result).toContain('Audience 1');
      expect(result).toContain('Audience 2');
    });

    it('falls back to "any" when gender is null', () => {
      const audiences = [
        {
          ageRange: '18-25',
          gender: null,
          geo: 'Kharkiv',
          pains: [],
          desires: [],
          triggers: [],
          incomeLevel: null,
        },
      ];
      const result = service.getAudiences(audiences);
      expect(result).toContain('any');
    });
  });

  describe('getProducts', () => {
    it('returns empty string when called with undefined', () => {
      expect(service.getProducts(undefined)).toBe('');
    });

    it('returns empty string when called with an empty array', () => {
      expect(service.getProducts([])).toBe('');
    });

    it('returns a non-empty string containing product fields for active products', () => {
      const products = [
        {
          name: 'Premium Membership',
          type: 'Service',
          description: 'Full access to all features',
          priceSegment: 'Premium',
          isActive: true,
        },
      ];
      const result = service.getProducts(products);
      expect(result).toBeTruthy();
      expect(result).toContain('Premium Membership');
      expect(result).toContain('high value, quality, exclusivity');
    });

    it('filters out inactive products', () => {
      const products = [
        {
          name: 'Active Product',
          type: 'Good',
          description: 'Available',
          priceSegment: 'Middle',
          isActive: true,
        },
        {
          name: 'Inactive Product',
          type: 'Good',
          description: 'Discontinued',
          priceSegment: 'Budget',
          isActive: false,
        },
      ];
      const result = service.getProducts(products);
      expect(result).toContain('Active Product');
      expect(result).not.toContain('Inactive Product');
    });

    it('returns empty string when all products are inactive', () => {
      const products = [
        {
          name: 'Old Product',
          type: 'Good',
          description: 'Gone',
          priceSegment: 'Budget',
          isActive: false,
        },
      ];
      expect(service.getProducts(products)).toBe('');
    });

    it('includes "balanced value and affordability" hint for Middle price segment', () => {
      const products = [
        {
          name: 'Mid Tier',
          type: 'Service',
          description: 'Balanced',
          priceSegment: 'Middle',
          isActive: true,
        },
      ];
      expect(service.getProducts(products)).toContain('balanced value and affordability');
    });

    it('includes "accessible, cost-effective, practical" hint for Budget price segment', () => {
      const products = [
        {
          name: 'Budget Option',
          type: 'Service',
          description: 'Cheap',
          priceSegment: 'Budget',
          isActive: true,
        },
      ];
      expect(service.getProducts(products)).toContain('accessible, cost-effective, practical');
    });
  });
});

// ─────────────────────────────────────────────
// buildPromptForPostsManually — skips LLM normalization when prompt is empty
// ─────────────────────────────────────────────
describe('AiService — buildPromptForPostsManually / buildPromptForStoriesManually (integration)', () => {
  let module: TestingModule;
  let service: AiService;
  let mockModel: { invoke: jest.Mock };

  const baseProfile = {
    prompt: '',
    audiences: [],
    products: [],
    ideas: [],
    ideasAi: [],
    business: {
      name: 'Test Biz',
      industry: 'Retail',
      website: 'https://test.com',
      language: 'Ukrainian',
      brand: 'Brand history',
      advantages: ['Fast delivery'],
      goals: ['Grow online'],
    },
  };

  const minimalParsedResponse = {
    choices: [
      {
        message: {
          content: JSON.stringify({
            posts: [
              {
                platform: 'Instagram',
                hook: 'hook',
                body: 'body',
                cta: 'cta',
                emotional_angle: 'joy',
                image_prompt: {
                  scene: 'scene',
                  userPrompt: 'prompt',
                  title: 'title',
                  subtitle: 'sub',
                  caption: 'cap',
                },
              },
            ],
          }),
        },
      },
    ],
  };

  const minimalStoriesResponse = {
    choices: [
      {
        message: {
          content: JSON.stringify({
            stories: [
              {
                frame: 1,
                headline: 'headline',
                supporting_text: 'support',
                emotion_trigger: 'curiosity',
                interaction: 'none',
                visual_description: 'visual',
                image_prompt: {
                  scene: 'scene',
                  userPrompt: 'up',
                  title: 'title',
                  subtitle: 'sub',
                  caption: 'cap',
                },
              },
            ],
          }),
        },
      },
    ],
  };

  beforeAll(async () => {
    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [
        AiService,
        {
          provide: AiReplicateService,
          useValue: {
            generateAndSaveVideo: jest.fn(),
            generatePostImage: jest.fn(),
            generateStoryImage: jest.fn(),
            startAiPhotoJobAsync: jest.fn(),
            pollAndSaveImage: jest.fn(),
            buildPostImagePrompt: jest.fn(),
            buildStoryImagePrompt: jest.fn(),
            generateAiPhoto: jest.fn(),
          },
        },
        { provide: S3Service, useValue: { upload: jest.fn(), delete: jest.fn() } },
      ],
    }).compile();

    service = module.get<AiService>(AiService);
    mockModel = { invoke: jest.fn() };
    (service as any).model = mockModel;
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generatePostsBasedOnManuallySettings — empty prompt skips LLM normalization', () => {
    it('calls model.invoke exactly once (content generation only) when profile.prompt is empty', async () => {
      mockModel.invoke.mockResolvedValue({
        content: minimalParsedResponse.choices[0].message.content,
      });

      await service.generatePostsBasedOnManuallySettings(
        { ...baseProfile, prompt: '' },
        [],
      );

      expect(mockModel.invoke).toHaveBeenCalledTimes(1);
    });

    it('calls model.invoke exactly once when profile.prompt is undefined', async () => {
      mockModel.invoke.mockResolvedValue({
        content: minimalParsedResponse.choices[0].message.content,
      });

      await service.generatePostsBasedOnManuallySettings(
        { ...baseProfile, prompt: undefined },
        [],
      );

      expect(mockModel.invoke).toHaveBeenCalledTimes(1);
    });

    it('calls model.invoke twice when profile.prompt is non-empty (normalization + generation)', async () => {
      const normalizedPromptJson = JSON.stringify({ text: ['write emotionally'], image: ['bright colors'] });

      mockModel.invoke
        .mockResolvedValueOnce({ content: normalizedPromptJson })
        .mockResolvedValueOnce({ content: minimalParsedResponse.choices[0].message.content });

      await service.generatePostsBasedOnManuallySettings(
        { ...baseProfile, prompt: 'make it emotional and bright' },
        [],
      );

      expect(mockModel.invoke).toHaveBeenCalledTimes(2);
    });

    it('returns posts array from the AI response', async () => {
      mockModel.invoke.mockResolvedValue({
        content: minimalParsedResponse.choices[0].message.content,
      });

      const result = await service.generatePostsBasedOnManuallySettings(
        { ...baseProfile, prompt: '' },
        [],
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('hook');
      expect(result[0]).toHaveProperty('body');
    });
  });

  describe('generateStoriesBasedOnManuallySettings — empty prompt skips LLM normalization', () => {
    it('calls model.invoke exactly once when profile.prompt is empty', async () => {
      mockModel.invoke.mockResolvedValue({
        content: minimalStoriesResponse.choices[0].message.content,
      });

      await service.generateStoriesBasedOnManuallySettings(
        { ...baseProfile, prompt: '' },
        [],
      );

      expect(mockModel.invoke).toHaveBeenCalledTimes(1);
    });

    it('calls model.invoke exactly once when profile.prompt is undefined', async () => {
      mockModel.invoke.mockResolvedValue({
        content: minimalStoriesResponse.choices[0].message.content,
      });

      await service.generateStoriesBasedOnManuallySettings(
        { ...baseProfile, prompt: undefined },
        [],
      );

      expect(mockModel.invoke).toHaveBeenCalledTimes(1);
    });

    it('calls model.invoke twice when profile.prompt is non-empty', async () => {
      const normalizedPromptJson = JSON.stringify({ text: ['be punchy'], image: ['dark background'] });

      mockModel.invoke
        .mockResolvedValueOnce({ content: normalizedPromptJson })
        .mockResolvedValueOnce({ content: minimalStoriesResponse.choices[0].message.content });

      await service.generateStoriesBasedOnManuallySettings(
        { ...baseProfile, prompt: 'dark and punchy' },
        [],
      );

      expect(mockModel.invoke).toHaveBeenCalledTimes(2);
    });

    it('returns stories array from the AI response', async () => {
      mockModel.invoke.mockResolvedValue({
        content: minimalStoriesResponse.choices[0].message.content,
      });

      const result = await service.generateStoriesBasedOnManuallySettings(
        { ...baseProfile, prompt: '' },
        [],
      );

      expect(Array.isArray(result)).toBe(true);
      expect(result[0]).toHaveProperty('headline');
    });
  });
});

describe('AiService — translateToEnglish (integration)', () => {
  let module: TestingModule;
  let service: AiService;

  let mockModel: { invoke: jest.Mock };
  let mockAiReplicateService: jest.Mocked<Pick<AiReplicateService, 'generateAndSaveVideo' | 'generatePostImage' | 'generateStoryImage' | 'startAiPhotoJobAsync' | 'pollAndSaveImage' | 'buildPostImagePrompt' | 'buildStoryImagePrompt'>>;
  let mockS3Service: jest.Mocked<Pick<S3Service, 'upload' | 'delete'>>;

  beforeAll(async () => {
    mockAiReplicateService = {
      generateAndSaveVideo: jest.fn(),
      generatePostImage: jest.fn(),
      generateStoryImage: jest.fn(),
      startAiPhotoJobAsync: jest.fn(),
      pollAndSaveImage: jest.fn(),
      buildPostImagePrompt: jest.fn(),
      buildStoryImagePrompt: jest.fn(),
    } as any;

    mockS3Service = {
      upload: jest.fn(),
      delete: jest.fn(),
    };

    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      providers: [
        AiService,
        { provide: AiReplicateService, useValue: mockAiReplicateService },
        { provide: S3Service, useValue: mockS3Service },
      ],
    }).compile();

    service = module.get<AiService>(AiService);

    // Replace the internal ChatOpenAI model with a controllable mock.
    // The constructor stores it as `this.model`; we reach it via the
    // compiled service instance.
    mockModel = { invoke: jest.fn() };
    (service as any).model = mockModel;
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────
  // translateToEnglish
  // ─────────────────────────────────────────────
  describe('translateToEnglish', () => {
    it('returns the translated string from the model response', async () => {
      mockModel.invoke.mockResolvedValue({ content: 'Hello, world!' });

      const result = await service.translateToEnglish('Hola, mundo!');

      expect(result).toBe('Hello, world!');
    });

    it('passes the original text as a human message to the model', async () => {
      mockModel.invoke.mockResolvedValue({ content: 'Good morning' });

      await service.translateToEnglish('Buenos días');

      const [messages] = mockModel.invoke.mock.calls[0];
      const humanMessage = messages.find(([role]: [string, string]) => role === 'human');
      expect(humanMessage).toBeDefined();
      expect(humanMessage[1]).toBe('Buenos días');
    });

    it('sends a system message instructing translation to English', async () => {
      mockModel.invoke.mockResolvedValue({ content: 'Thank you' });

      await service.translateToEnglish('Merci');

      const [messages] = mockModel.invoke.mock.calls[0];
      const systemMessage = messages.find(([role]: [string, string]) => role === 'system');
      expect(systemMessage).toBeDefined();
      expect(systemMessage[1]).toMatch(/translate/i);
      expect(systemMessage[1]).toMatch(/english/i);
    });

    it('returns text unchanged when the input is already in English', async () => {
      const alreadyEnglish = 'This is already in English.';
      mockModel.invoke.mockResolvedValue({ content: alreadyEnglish });

      const result = await service.translateToEnglish(alreadyEnglish);

      expect(result).toBe(alreadyEnglish);
    });

    it('falls back to original text when the model throws an error', async () => {
      mockModel.invoke.mockRejectedValue(new Error('OpenAI quota exceeded'));

      const result = await service.translateToEnglish('test');

      expect(result).toBe('test');
    });

    it('calls model.invoke exactly once per invocation', async () => {
      mockModel.invoke.mockResolvedValue({ content: 'translated' });

      await service.translateToEnglish('texto');

      expect(mockModel.invoke).toHaveBeenCalledTimes(1);
    });
  });
});
