import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { ConfigModule } from '@nestjs/config';

import { AiArtifactController } from './aiArtifact.controller';
import { AiArtifactService } from './aiArtifact.service';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

const ARTIFACT_UUID = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';
const MEDIA_UUID = 'b2c3d4e5-f6a7-8901-bcde-f12345678901';

const fakeArtifact = { id: ARTIFACT_UUID, media: [] };

describe('AiArtifactController — DELETE /ai-artifact/batch (integration)', () => {
  let app: INestApplication;
  let mockService: jest.Mocked<
    Pick<
      AiArtifactService,
      | 'deleteAiArtifactsBatch'
      | 'regenerateAiArtifact'
      | 'revertAiArtifactOriginal'
      | 'revertAiArtifactPrevious'
    >
  >;

  beforeAll(async () => {
    mockService = {
      deleteAiArtifactsBatch: jest.fn().mockResolvedValue({ success: true }),
      regenerateAiArtifact: jest.fn().mockResolvedValue(fakeArtifact),
      revertAiArtifactOriginal: jest.fn().mockResolvedValue(fakeArtifact),
      revertAiArtifactPrevious: jest.fn().mockResolvedValue(fakeArtifact),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot({ isGlobal: true })],
      controllers: [AiArtifactController],
      providers: [
        { provide: AiArtifactService, useValue: mockService },
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = module.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockService.deleteAiArtifactsBatch.mockResolvedValue({ success: true });
    mockService.regenerateAiArtifact.mockResolvedValue(fakeArtifact as any);
    mockService.revertAiArtifactOriginal.mockResolvedValue(fakeArtifact as any);
    mockService.revertAiArtifactPrevious.mockResolvedValue(fakeArtifact as any);
  });

  it('returns 200 with { success: true } for a valid array of UUIDs', async () => {
    const ids = [
      'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      'b2c3d4e5-f6a7-8901-bcde-f12345678901',
    ];

    const response = await request(app.getHttpServer())
      .delete('/ai-artifact/batch')
      .send({ ids })
      .expect(200);

    // ApiResponseInterceptor is not bound in this test module, so the service
    // return value arrives unwrapped as the raw response body.
    expect(response.body).toEqual({ success: true });
    expect(mockService.deleteAiArtifactsBatch).toHaveBeenCalledWith(ids);
  });

  it('returns 400 for an empty array (ArrayMinSize validation)', async () => {
    await request(app.getHttpServer())
      .delete('/ai-artifact/batch')
      .send({ ids: [] })
      .expect(400);

    expect(mockService.deleteAiArtifactsBatch).not.toHaveBeenCalled();
  });

  it('returns 400 when ids contains a non-UUID string', async () => {
    await request(app.getHttpServer())
      .delete('/ai-artifact/batch')
      .send({ ids: ['not-a-uuid', 'also-not-a-uuid'] })
      .expect(400);

    expect(mockService.deleteAiArtifactsBatch).not.toHaveBeenCalled();
  });

  it('returns 400 when ids field is missing from the body', async () => {
    await request(app.getHttpServer())
      .delete('/ai-artifact/batch')
      .send({})
      .expect(400);

    expect(mockService.deleteAiArtifactsBatch).not.toHaveBeenCalled();
  });

  it('returns 400 when ids is a string instead of an array', async () => {
    await request(app.getHttpServer())
      .delete('/ai-artifact/batch')
      .send({ ids: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
      .expect(400);

    expect(mockService.deleteAiArtifactsBatch).not.toHaveBeenCalled();
  });

  it('returns 400 when array contains a mix of valid UUIDs and invalid strings', async () => {
    await request(app.getHttpServer())
      .delete('/ai-artifact/batch')
      .send({
        ids: [
          'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
          'invalid-entry',
        ],
      })
      .expect(400);

    expect(mockService.deleteAiArtifactsBatch).not.toHaveBeenCalled();
  });

  // ─────────────────────────────────────────────
  // POST /:id/regenerate
  // ─────────────────────────────────────────────
  describe('POST /:id/regenerate', () => {
    it('returns 201 and calls regenerateAiArtifact with correct args', async () => {
      const response = await request(app.getHttpServer())
        .post(`/ai-artifact/${ARTIFACT_UUID}/regenerate`)
        .send({ mediaId: MEDIA_UUID, prompt: 'bright product photo' })
        .expect(201);

      expect(response.body).toEqual(fakeArtifact);
      expect(mockService.regenerateAiArtifact).toHaveBeenCalledWith(
        ARTIFACT_UUID,
        MEDIA_UUID,
        'bright product photo',
      );
    });

    it('returns 400 when mediaId is missing', async () => {
      await request(app.getHttpServer())
        .post(`/ai-artifact/${ARTIFACT_UUID}/regenerate`)
        .send({ prompt: 'some prompt' })
        .expect(400);

      expect(mockService.regenerateAiArtifact).not.toHaveBeenCalled();
    });

    it('returns 400 when mediaId is not a UUID', async () => {
      await request(app.getHttpServer())
        .post(`/ai-artifact/${ARTIFACT_UUID}/regenerate`)
        .send({ mediaId: 'not-a-uuid', prompt: 'some prompt' })
        .expect(400);

      expect(mockService.regenerateAiArtifact).not.toHaveBeenCalled();
    });

    it('returns 400 when prompt is missing', async () => {
      await request(app.getHttpServer())
        .post(`/ai-artifact/${ARTIFACT_UUID}/regenerate`)
        .send({ mediaId: MEDIA_UUID })
        .expect(400);

      expect(mockService.regenerateAiArtifact).not.toHaveBeenCalled();
    });

    it('returns 400 when prompt is empty string', async () => {
      await request(app.getHttpServer())
        .post(`/ai-artifact/${ARTIFACT_UUID}/regenerate`)
        .send({ mediaId: MEDIA_UUID, prompt: '' })
        .expect(400);

      expect(mockService.regenerateAiArtifact).not.toHaveBeenCalled();
    });

    it('returns 400 when artifact id param is not a UUID', async () => {
      await request(app.getHttpServer())
        .post('/ai-artifact/not-a-uuid/regenerate')
        .send({ mediaId: MEDIA_UUID, prompt: 'prompt' })
        .expect(400);

      expect(mockService.regenerateAiArtifact).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────
  // POST /:id/revert-original
  // ─────────────────────────────────────────────
  describe('POST /:id/revert-original', () => {
    it('returns 201 and calls revertAiArtifactOriginal with correct args', async () => {
      const response = await request(app.getHttpServer())
        .post(`/ai-artifact/${ARTIFACT_UUID}/revert-original`)
        .send({ mediaId: MEDIA_UUID })
        .expect(201);

      expect(response.body).toEqual(fakeArtifact);
      expect(mockService.revertAiArtifactOriginal).toHaveBeenCalledWith(
        ARTIFACT_UUID,
        MEDIA_UUID,
      );
    });

    it('returns 400 when mediaId is missing', async () => {
      await request(app.getHttpServer())
        .post(`/ai-artifact/${ARTIFACT_UUID}/revert-original`)
        .send({})
        .expect(400);

      expect(mockService.revertAiArtifactOriginal).not.toHaveBeenCalled();
    });

    it('returns 400 when mediaId is not a UUID', async () => {
      await request(app.getHttpServer())
        .post(`/ai-artifact/${ARTIFACT_UUID}/revert-original`)
        .send({ mediaId: 'not-a-uuid' })
        .expect(400);

      expect(mockService.revertAiArtifactOriginal).not.toHaveBeenCalled();
    });

    it('returns 400 when artifact id param is not a UUID', async () => {
      await request(app.getHttpServer())
        .post('/ai-artifact/not-a-uuid/revert-original')
        .send({ mediaId: MEDIA_UUID })
        .expect(400);

      expect(mockService.revertAiArtifactOriginal).not.toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────
  // POST /:id/revert-previous
  // ─────────────────────────────────────────────
  describe('POST /:id/revert-previous', () => {
    it('returns 201 and calls revertAiArtifactPrevious with correct args', async () => {
      const response = await request(app.getHttpServer())
        .post(`/ai-artifact/${ARTIFACT_UUID}/revert-previous`)
        .send({ mediaId: MEDIA_UUID })
        .expect(201);

      expect(response.body).toEqual(fakeArtifact);
      expect(mockService.revertAiArtifactPrevious).toHaveBeenCalledWith(
        ARTIFACT_UUID,
        MEDIA_UUID,
      );
    });

    it('returns 400 when mediaId is missing', async () => {
      await request(app.getHttpServer())
        .post(`/ai-artifact/${ARTIFACT_UUID}/revert-previous`)
        .send({})
        .expect(400);

      expect(mockService.revertAiArtifactPrevious).not.toHaveBeenCalled();
    });

    it('returns 400 when mediaId is not a UUID', async () => {
      await request(app.getHttpServer())
        .post(`/ai-artifact/${ARTIFACT_UUID}/revert-previous`)
        .send({ mediaId: 'not-a-uuid' })
        .expect(400);

      expect(mockService.revertAiArtifactPrevious).not.toHaveBeenCalled();
    });

    it('returns 400 when artifact id param is not a UUID', async () => {
      await request(app.getHttpServer())
        .post('/ai-artifact/not-a-uuid/revert-previous')
        .send({ mediaId: MEDIA_UUID })
        .expect(400);

      expect(mockService.revertAiArtifactPrevious).not.toHaveBeenCalled();
    });
  });
});
