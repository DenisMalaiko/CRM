import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';

import { DesignSystemService } from './designSystem.service';
import { PrismaService } from '../../core/prisma/prisma.service';
import { DESIGN_SYSTEM_PRESETS } from './designSystem.presets';

const BUSINESS_ID = 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
const OTHER_BUSINESS_ID = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
const RECORD_ID = 'cccccccc-cccc-cccc-cccc-cccccccccccc';

const makeDs = (overrides: Record<string, unknown> = {}) => ({
  id: RECORD_ID,
  name: 'Test System',
  businessId: BUSINESS_ID,
  source: 'MANUAL',
  isPreset: false,
  colors: {},
  gradients: [],
  typography: {},
  radius: '12px',
  border: {},
  shadow: {},
  spacing: {},
  brandElements: {},
  composition: {},
  scene: {},
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

describe('DesignSystemService', () => {
  let module: TestingModule;
  let service: DesignSystemService;
  let prisma: {
    designSystem: {
      findMany: jest.Mock;
      findUnique: jest.Mock;
      create: jest.Mock;
      createMany: jest.Mock;
      update: jest.Mock;
      delete: jest.Mock;
    };
  };

  beforeAll(async () => {
    prisma = {
      designSystem: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        createMany: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    module = await Test.createTestingModule({
      providers: [
        DesignSystemService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<DesignSystemService>(DesignSystemService);
  });

  afterAll(async () => {
    await module.close();
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ─────────────────────────────────────────────
  // getPresets
  // ─────────────────────────────────────────────
  describe('getPresets', () => {
    it('returns existing presets when they are already seeded', async () => {
      const seeded = DESIGN_SYSTEM_PRESETS.slice(0, 2).map((p, i) =>
        makeDs({
          id: `id-${i}`,
          name: p.name,
          isPreset: true,
          businessId: null,
        }),
      );
      prisma.designSystem.findMany.mockResolvedValue(seeded);

      const result = await service.getPresets();

      expect(prisma.designSystem.findMany).toHaveBeenCalledTimes(1);
      expect(prisma.designSystem.createMany).not.toHaveBeenCalled();
      expect(result).toEqual(seeded);
    });

    it('seeds presets and returns them when the table is empty', async () => {
      const afterSeed = DESIGN_SYSTEM_PRESETS.map((p, i) =>
        makeDs({
          id: `id-${i}`,
          name: p.name,
          isPreset: true,
          businessId: null,
        }),
      );

      prisma.designSystem.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce(afterSeed);
      prisma.designSystem.createMany.mockResolvedValue({
        count: afterSeed.length,
      });

      const result = await service.getPresets();

      expect(prisma.designSystem.createMany).toHaveBeenCalledTimes(1);
      expect(prisma.designSystem.findMany).toHaveBeenCalledTimes(2);
      expect(result).toEqual(afterSeed);
    });

    it('seeds the correct number of preset records', async () => {
      prisma.designSystem.findMany
        .mockResolvedValueOnce([])
        .mockResolvedValueOnce([]);
      prisma.designSystem.createMany.mockResolvedValue({
        count: DESIGN_SYSTEM_PRESETS.length,
      });

      await service.getPresets();

      const { data } = prisma.designSystem.createMany.mock.calls[0][0];
      expect(data).toHaveLength(DESIGN_SYSTEM_PRESETS.length);
      data.forEach((row: Record<string, unknown>) => {
        expect(row.isPreset).toBe(true);
        expect(row.businessId).toBeNull();
      });
    });
  });

  // ─────────────────────────────────────────────
  // getByBusinessId
  // ─────────────────────────────────────────────
  describe('getByBusinessId', () => {
    it('returns design systems scoped to the given businessId', async () => {
      const records = [makeDs(), makeDs({ id: 'id-2', name: 'Second' })];
      prisma.designSystem.findMany.mockResolvedValue(records);

      const result = await service.getByBusinessId(BUSINESS_ID);

      expect(prisma.designSystem.findMany).toHaveBeenCalledWith(
        expect.objectContaining({ where: { businessId: BUSINESS_ID } }),
      );
      expect(result).toEqual(records);
    });

    it('returns empty array when the business has no design systems', async () => {
      prisma.designSystem.findMany.mockResolvedValue([]);

      const result = await service.getByBusinessId(OTHER_BUSINESS_ID);

      expect(result).toEqual([]);
    });

    it('does not return records belonging to a different business', async () => {
      const ownRecord = makeDs();
      prisma.designSystem.findMany.mockImplementation(
        async ({ where }: { where: { businessId: string } }) =>
          where.businessId === BUSINESS_ID ? [ownRecord] : [],
      );

      const ownResult = await service.getByBusinessId(BUSINESS_ID);
      const otherResult = await service.getByBusinessId(OTHER_BUSINESS_ID);

      expect(ownResult).toHaveLength(1);
      expect(otherResult).toHaveLength(0);
    });
  });

  // ─────────────────────────────────────────────
  // getById
  // ─────────────────────────────────────────────
  describe('getById', () => {
    it('returns the design system when found', async () => {
      const record = makeDs();
      prisma.designSystem.findUnique.mockResolvedValue(record);

      const result = await service.getById(RECORD_ID);

      expect(prisma.designSystem.findUnique).toHaveBeenCalledWith({
        where: { id: RECORD_ID },
      });
      expect(result).toEqual(record);
    });

    it('throws NotFoundException when the record does not exist', async () => {
      prisma.designSystem.findUnique.mockResolvedValue(null);

      await expect(service.getById('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─────────────────────────────────────────────
  // duplicate
  // ─────────────────────────────────────────────
  describe('duplicate', () => {
    it('creates a copy with "(Copy)" appended to the name', async () => {
      const source = makeDs({
        name: 'Ocean Blue',
        isPreset: true,
        businessId: null,
      });
      const created = makeDs({
        id: 'new-id',
        name: 'Ocean Blue (Copy)',
        businessId: BUSINESS_ID,
      });

      prisma.designSystem.findUnique.mockResolvedValue(source);
      prisma.designSystem.create.mockResolvedValue(created);

      const result = await service.duplicate(RECORD_ID, BUSINESS_ID);

      const { data } = prisma.designSystem.create.mock.calls[0][0];
      expect(data.name).toBe('Ocean Blue (Copy)');
      expect(result.name).toBe('Ocean Blue (Copy)');
    });

    it('sets isPreset=false and source=MANUAL on the duplicate', async () => {
      const source = makeDs({
        isPreset: true,
        source: 'PRESET',
        businessId: null,
      });
      prisma.designSystem.findUnique.mockResolvedValue(source);
      prisma.designSystem.create.mockResolvedValue(makeDs());

      await service.duplicate(RECORD_ID, BUSINESS_ID);

      const { data } = prisma.designSystem.create.mock.calls[0][0];
      expect(data.isPreset).toBe(false);
      expect(data.source).toBe('MANUAL');
    });

    it('assigns the new businessId to the duplicate', async () => {
      const source = makeDs({ isPreset: true, businessId: null });
      prisma.designSystem.findUnique.mockResolvedValue(source);
      prisma.designSystem.create.mockResolvedValue(
        makeDs({ businessId: BUSINESS_ID }),
      );

      await service.duplicate(RECORD_ID, BUSINESS_ID);

      const { data } = prisma.designSystem.create.mock.calls[0][0];
      expect(data.businessId).toBe(BUSINESS_ID);
    });

    it('throws NotFoundException when the source does not exist', async () => {
      prisma.designSystem.findUnique.mockResolvedValue(null);

      await expect(service.duplicate('ghost-id', BUSINESS_ID)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  // ─────────────────────────────────────────────
  // create
  // ─────────────────────────────────────────────
  describe('create', () => {
    it('creates a design system with provided name and businessId', async () => {
      const created = makeDs({ name: 'My System' });
      prisma.designSystem.create.mockResolvedValue(created);

      const result = await service.create({
        name: 'My System',
        businessId: BUSINESS_ID,
      });

      const { data } = prisma.designSystem.create.mock.calls[0][0];
      expect(data.name).toBe('My System');
      expect(data.businessId).toBe(BUSINESS_ID);
      expect(result).toEqual(created);
    });

    it('always sets isPreset=false and source=MANUAL', async () => {
      prisma.designSystem.create.mockResolvedValue(makeDs());

      await service.create({ name: 'X', businessId: BUSINESS_ID });

      const { data } = prisma.designSystem.create.mock.calls[0][0];
      expect(data.isPreset).toBe(false);
      expect(data.source).toBe('MANUAL');
    });

    it('applies defaults when optional fields are not provided', async () => {
      prisma.designSystem.create.mockResolvedValue(makeDs());

      await service.create({ name: 'X', businessId: BUSINESS_ID });

      const { data } = prisma.designSystem.create.mock.calls[0][0];
      expect(data.colors).toEqual({});
      expect(data.gradients).toEqual([]);
      expect(data.radius).toBe('12px');
    });

    it('uses provided optional fields over defaults', async () => {
      const colors = { background: '#000', foreground: '#fff' };
      prisma.designSystem.create.mockResolvedValue(makeDs({ colors }));

      await service.create({
        name: 'X',
        businessId: BUSINESS_ID,
        colors,
        radius: '4px',
      });

      const { data } = prisma.designSystem.create.mock.calls[0][0];
      expect(data.colors).toEqual(colors);
      expect(data.radius).toBe('4px');
    });
  });

  // ─────────────────────────────────────────────
  // update
  // ─────────────────────────────────────────────
  describe('update', () => {
    it('updates the allowed fields and returns the updated record', async () => {
      const existing = makeDs();
      const updated = makeDs({ name: 'Renamed' });
      prisma.designSystem.findUnique.mockResolvedValue(existing);
      prisma.designSystem.update.mockResolvedValue(updated);

      const result = await service.update(RECORD_ID, BUSINESS_ID, {
        name: 'Renamed',
      });

      expect(prisma.designSystem.update).toHaveBeenCalledWith({
        where: { id: RECORD_ID },
        data: { name: 'Renamed' },
      });
      expect(result).toEqual(updated);
    });

    it('only includes defined fields in the update payload', async () => {
      prisma.designSystem.findUnique.mockResolvedValue(makeDs());
      prisma.designSystem.update.mockResolvedValue(makeDs());

      await service.update(RECORD_ID, BUSINESS_ID, { name: 'New Name' });

      const { data } = prisma.designSystem.update.mock.calls[0][0];
      expect(Object.keys(data)).toEqual(['name']);
    });

    it('throws ForbiddenException when the target is a preset', async () => {
      prisma.designSystem.findUnique.mockResolvedValue(
        makeDs({ isPreset: true, businessId: null }),
      );

      await expect(
        service.update(RECORD_ID, BUSINESS_ID, { name: 'Hack' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws ForbiddenException when businessId does not match', async () => {
      prisma.designSystem.findUnique.mockResolvedValue(
        makeDs({ businessId: OTHER_BUSINESS_ID }),
      );

      await expect(
        service.update(RECORD_ID, BUSINESS_ID, { name: 'Hack' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('throws NotFoundException when the record does not exist', async () => {
      prisma.designSystem.findUnique.mockResolvedValue(null);

      await expect(
        service.update('ghost-id', BUSINESS_ID, { name: 'X' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  // ─────────────────────────────────────────────
  // remove
  // ─────────────────────────────────────────────
  describe('remove', () => {
    it('deletes the record and returns the deleted entity', async () => {
      const record = makeDs();
      prisma.designSystem.findUnique.mockResolvedValue(record);
      prisma.designSystem.delete.mockResolvedValue(record);

      const result = await service.remove(RECORD_ID, BUSINESS_ID);

      expect(prisma.designSystem.delete).toHaveBeenCalledWith({
        where: { id: RECORD_ID },
      });
      expect(result).toEqual(record);
    });

    it('throws ForbiddenException when the target is a preset', async () => {
      prisma.designSystem.findUnique.mockResolvedValue(
        makeDs({ isPreset: true, businessId: null }),
      );

      await expect(service.remove(RECORD_ID, BUSINESS_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws ForbiddenException when businessId does not match', async () => {
      prisma.designSystem.findUnique.mockResolvedValue(
        makeDs({ businessId: OTHER_BUSINESS_ID }),
      );

      await expect(service.remove(RECORD_ID, BUSINESS_ID)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('throws NotFoundException when the record does not exist', async () => {
      prisma.designSystem.findUnique.mockResolvedValue(null);

      await expect(service.remove('ghost-id', BUSINESS_ID)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('does not call delete when the guard check fails', async () => {
      prisma.designSystem.findUnique.mockResolvedValue(
        makeDs({ isPreset: true, businessId: null }),
      );

      await expect(service.remove(RECORD_ID, BUSINESS_ID)).rejects.toThrow(
        ForbiddenException,
      );

      expect(prisma.designSystem.delete).not.toHaveBeenCalled();
    });
  });
});
