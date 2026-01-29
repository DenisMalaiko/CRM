import { ConflictException, Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TPrompt, TPromptCreate } from './entities/prompt.entity';


@Injectable()
export class PromptService {
  constructor(
    private readonly prisma: PrismaService
  ) {}

  async getPrompts(businessId: string): Promise<ApiResponse<TPrompt[]>> {
    const prompts = await this.prisma.prompt.findMany({
      where: { businessId: businessId },
    })

    return {
      statusCode: 200,
      message: "Profiles has been got!",
      data: prompts,
    };
  }

  async createPrompt(body: TPromptCreate) {
    const prompt: any = await this.prisma.prompt.create({
      data: body
    });

    return {
      statusCode: 200,
      message: "Prompt has been created!",
      data: prompt,
    }
  }

  async updatePrompt(id: string, body: TPromptCreate) {
    if (!id) {
      throw new NotFoundException('Prompt ID is required');
    }

    try {
      const updated = await this.prisma.prompt.update({
        where: {id},
        data: {
          name: body.name,
          purpose: body.purpose,
          text: body.text,
          isActive: body.isActive,
        }
      });

      return {
        statusCode: 200,
        message: 'Prompt has been updated!',
        data: updated,
      };
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Prompt with ID ${id} not found`);
      }

      throw new InternalServerErrorException('Failed to update prompt');
    }
  }

  async deletePrompt(id: string) {
    return this.prisma.$transaction(async (tx) => {
      try {
        if (!id) throw new NotFoundException('Prompt ID is required');

        const deleted = await tx.prompt.delete({
          where: { id },
        });

        return {
          statusCode: 200,
          message: 'Prompt has been deleted!',
          data: deleted,
        };
      } catch (err: any) {

        if (err.code === 'P2025') {
          throw new NotFoundException(`Prompt with ID ${id} not found`);
        }

        if (err instanceof ConflictException) {
          throw err;
        }

        throw new InternalServerErrorException('Failed to delete prompt');
      }
    })
  }
}
