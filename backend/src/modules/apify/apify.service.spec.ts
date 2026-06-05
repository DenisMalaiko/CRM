import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, Logger } from '@nestjs/common';
import { ApifyService } from './apify.service';

/**
 * We mock the entire apify-client module so no real HTTP calls are made.
 * Each test controls `call()` and `listItems()` independently.
 */
const mockListItems = jest.fn();
const mockCall = jest.fn();

jest.mock('apify-client', () => ({
  ApifyClient: jest.fn().mockImplementation(() => ({
    actor: jest.fn().mockReturnValue({ call: mockCall }),
    dataset: jest.fn().mockReturnValue({ listItems: mockListItems }),
  })),
}));

describe('ApifyService', () => {
  let module: TestingModule;
  let service: ApifyService;
  let loggerWarnSpy: jest.SpyInstance;

  beforeAll(async () => {
    module = await Test.createTestingModule({
      providers: [ApifyService],
    }).compile();

    service = module.get<ApifyService>(ApifyService);

    // Spy on the service's own logger instance
    loggerWarnSpy = jest
      .spyOn(Logger.prototype, 'warn')
      .mockImplementation(() => undefined);
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────────────────────
  // Empty dataset — the core observability change
  // ─────────────────────────────────────────────────────────────
  describe('runActor — empty dataset', () => {
    it('logs a warn and returns [] when dataset comes back empty despite SUCCEEDED status', async () => {
      mockCall.mockResolvedValue({
        id: 'run-001',
        status: 'SUCCEEDED',
        defaultDatasetId: 'ds-001',
      });
      mockListItems.mockResolvedValue({ items: [] });

      const result = await service.runActor('some~actor', { key: 'value' });

      expect(result).toEqual([]);
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('empty dataset'),
      );
    });

    it('includes the run id and actor name in the warn message', async () => {
      mockCall.mockResolvedValue({
        id: 'run-xyz',
        status: 'SUCCEEDED',
        defaultDatasetId: 'ds-xyz',
      });
      mockListItems.mockResolvedValue({ items: [] });

      await service.runActor('clockworks~tiktok-scraper', {});

      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('run-xyz'),
      );
      expect(loggerWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('clockworks~tiktok-scraper'),
      );
    });

    it('does NOT warn when items array is null/undefined — treats as non-array and returns []', async () => {
      mockCall.mockResolvedValue({
        id: 'run-002',
        status: 'SUCCEEDED',
        defaultDatasetId: 'ds-002',
      });
      // listItems returning a non-array triggers the same empty-branch
      mockListItems.mockResolvedValue({ items: null });

      const result = await service.runActor('some~actor', {});

      expect(result).toEqual([]);
      // The condition is `!Array.isArray(items) || items.length === 0`
      // so null also triggers warn
      expect(loggerWarnSpy).toHaveBeenCalled();
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Happy path — non-empty results must NOT warn
  // ─────────────────────────────────────────────────────────────
  describe('runActor — happy path', () => {
    it('returns items and does not warn when dataset has entries', async () => {
      const items = [{ id: '1', name: 'trending' }, { id: '2', name: 'viral' }];

      mockCall.mockResolvedValue({
        id: 'run-003',
        status: 'SUCCEEDED',
        defaultDatasetId: 'ds-003',
      });
      mockListItems.mockResolvedValue({ items });

      const result = await service.runActor('some~actor', {});

      expect(result).toEqual(items);
      expect(loggerWarnSpy).not.toHaveBeenCalled();
    });

    it('throws BadRequestException when first item has an error field (PAGE_PRIVATE)', async () => {
      mockCall.mockResolvedValue({
        id: 'run-004',
        status: 'SUCCEEDED',
        defaultDatasetId: 'ds-004',
      });
      mockListItems.mockResolvedValue({
        items: [{ error: true, errorCode: 'PAGE_PRIVATE' }],
      });

      await expect(service.runActor('some~actor', {})).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  // ─────────────────────────────────────────────────────────────
  // Non-SUCCEEDED run status
  // ─────────────────────────────────────────────────────────────
  describe('runActor — failed run', () => {
    it('throws BadRequestException when actor run status is FAILED', async () => {
      mockCall.mockResolvedValue({ id: 'run-005', status: 'FAILED', defaultDatasetId: 'ds-005' });

      await expect(service.runActor('some~actor', {})).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException when actor.call() rejects', async () => {
      mockCall.mockRejectedValue(new Error('Network timeout'));

      await expect(service.runActor('some~actor', {})).rejects.toThrow(
        BadRequestException,
      );
    });
  });
});
