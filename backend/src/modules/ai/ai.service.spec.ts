import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '@nestjs/config';

import { AiService } from './ai.service';
import { AiReplicateService } from './ai-replicate.service';
import { S3Service } from '../../core/s3/s3.service';

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
