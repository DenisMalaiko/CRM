import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../core/prisma/prisma.service';
import { TPrompt, TPromptCreate, TPromptUpdate } from './entities/prompt.entity';

@Injectable()
export class PromptService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  async getPrompts(businessId: string): Promise<TPrompt[]> {
    return await this.prisma.prompt.findMany({
      where: { businessId: businessId },
    });
  }

  async createPrompt(body: TPromptCreate): Promise<TPrompt> {
    return await this.prisma.prompt.create({
      data: body
    });
  }

  async updatePrompt(id: string, body: TPromptUpdate): Promise<TPrompt> {
    if (!id) throw new NotFoundException('Prompt ID is required');

    try {
      return await this.prisma.prompt.update({
        where: {id},
        data: {
          name: body.name,
          purpose: body.purpose,
          text: body.text,
          isActive: body.isActive,
        }
      });
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Prompt with ID ${id} not found`);
      }

      throw new InternalServerErrorException('Failed to update prompt');
    }
  }

  async deletePrompt(id: string) {
    try {
      return await this.prisma.prompt.delete({ where: { id } });
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Prompt with ID ${id} not found`);
      }
      throw err;
    }
  }
}
