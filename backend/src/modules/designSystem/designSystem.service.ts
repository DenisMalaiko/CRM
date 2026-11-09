import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { DESIGN_SYSTEM_PRESETS } from './designSystem.presets';
import {
  CreateDesignSystemDto,
  UpdateDesignSystemDto,
} from './dto/designSystem.dto';

@Injectable()
export class DesignSystemService {
  constructor(private readonly prisma: PrismaService) {}

  async getPresets() {
    const existing = await this.prisma.designSystem.findMany({
      where: { isPreset: true, businessId: null },
      orderBy: { createdAt: 'asc' },
    });

    if (existing.length === 0) {
      await this.seedPresets();
      return this.prisma.designSystem.findMany({
        where: { isPreset: true, businessId: null },
        orderBy: { createdAt: 'asc' },
      });
    }

    return existing;
  }

  async getByBusinessId(businessId: string, agencyId: string) {
    await this.verifyBusinessOwnership(businessId, agencyId);

    return this.prisma.designSystem.findMany({
      where: { businessId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getById(id: string, agencyId: string) {
    const ds = await this.prisma.designSystem.findUnique({ where: { id } });
    if (!ds) throw new NotFoundException('Design system not found');

    if (ds.isPreset) return ds;

    if (ds.businessId) {
      await this.verifyBusinessOwnership(ds.businessId, agencyId);
    }

    return ds;
  }

  async duplicate(id: string, businessId: string, agencyId: string) {
    await this.verifyBusinessOwnership(businessId, agencyId);

    const source = await this.prisma.designSystem.findUnique({ where: { id } });
    if (!source) throw new NotFoundException('Design system not found');

    return this.prisma.designSystem.create({
      data: {
        name: `${source.name} (Copy)`,
        businessId,
        source: 'MANUAL',
        isPreset: false,
        colors: source.colors ?? {},
        gradients: source.gradients ?? [],
        typography: source.typography ?? {},
        radius: source.radius,
        border: source.border ?? {},
        shadow: source.shadow ?? {},
        spacing: source.spacing ?? {},
        brandElements: source.brandElements ?? {},
        composition: source.composition ?? {},
        scene: source.scene ?? {},
      },
    });
  }

  async create(dto: CreateDesignSystemDto, agencyId: string) {
    await this.verifyBusinessOwnership(dto.businessId, agencyId);

    return this.prisma.designSystem.create({
      data: {
        name: dto.name,
        businessId: dto.businessId,
        source: 'MANUAL',
        isPreset: false,
        colors: dto.colors ?? {},
        gradients: dto.gradients ?? [],
        typography: dto.typography ?? {},
        radius: dto.radius ?? '12px',
        border: dto.border ?? {},
        shadow: dto.shadow ?? {},
        spacing: dto.spacing ?? {},
        brandElements: dto.brandElements ?? {},
        composition: dto.composition ?? {},
        scene: dto.scene ?? {},
      },
    });
  }

  async update(id: string, agencyId: string, dto: UpdateDesignSystemDto) {
    const ds = await this.prisma.designSystem.findUnique({ where: { id } });
    if (!ds) throw new NotFoundException('Design system not found');

    if (ds.isPreset) {
      throw new ForbiddenException('Cannot edit a preset design system');
    }

    if (ds.businessId) {
      await this.verifyBusinessOwnership(ds.businessId, agencyId);
    }

    const data: Partial<UpdateDesignSystemDto> = {};
    if (dto.name !== undefined) data.name = dto.name;
    if (dto.colors !== undefined) data.colors = dto.colors;
    if (dto.gradients !== undefined) data.gradients = dto.gradients;
    if (dto.typography !== undefined) data.typography = dto.typography;
    if (dto.radius !== undefined) data.radius = dto.radius;
    if (dto.border !== undefined) data.border = dto.border;
    if (dto.shadow !== undefined) data.shadow = dto.shadow;
    if (dto.spacing !== undefined) data.spacing = dto.spacing;
    if (dto.brandElements !== undefined) data.brandElements = dto.brandElements;
    if (dto.composition !== undefined) data.composition = dto.composition;
    if (dto.scene !== undefined) data.scene = dto.scene;

    return this.prisma.designSystem.update({
      where: { id },
      data,
    });
  }

  async remove(id: string, agencyId: string) {
    const ds = await this.prisma.designSystem.findUnique({ where: { id } });
    if (!ds) throw new NotFoundException('Design system not found');

    if (ds.isPreset) {
      throw new ForbiddenException('Cannot delete a preset design system');
    }

    if (ds.businessId) {
      await this.verifyBusinessOwnership(ds.businessId, agencyId);
    }

    return this.prisma.designSystem.delete({ where: { id } });
  }

  private async verifyBusinessOwnership(businessId: string, agencyId: string) {
    const business = await this.prisma.business.findUnique({
      where: { id: businessId, agencyId },
      select: { id: true },
    });

    if (!business) {
      throw new ForbiddenException('Business not found or access denied');
    }
  }

  private async seedPresets() {
    const data = DESIGN_SYSTEM_PRESETS.map((preset) => ({
      name: preset.name,
      businessId: null,
      source: preset.source as any,
      isPreset: true,
      colors: preset.colors as any,
      gradients: preset.gradients as any,
      typography: preset.typography as any,
      radius: preset.radius,
      border: preset.border as any,
      shadow: preset.shadow as any,
      spacing: preset.spacing as any,
      brandElements: preset.brandElements as any,
      composition: preset.composition as any,
      scene: preset.scene as any,
    }));

    await this.prisma.designSystem.createMany({ data });
  }
}
