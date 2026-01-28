import {ConflictException, Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AiArtifactService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getAiArtifacts(businessId: string) {
    const artifacts = await this.prisma.aIArtifact.findMany({
      where: { businessId: businessId },
      include: {
        products: { include: { product: true } },
      }
    });

    return {
      statusCode: 200,
      message: "AI Artifacts has been got!",
      data: artifacts,
    };
  }

  async updateAiArtifact(id: string, body: any) {
    if (!id) {
      throw new NotFoundException('Artifact ID is required');
    }

    try {
      const updated = await this.prisma.aIArtifact.update({
        where: {id},
        data: {
          type: body.type,
          outputJson: body.outputJson,
          status: body.status,
        }
      });

      return {
        statusCode: 200,
        message: 'Artifact has been updated!',
        data: updated,
      };
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Artifact with ID ${id} not found`);
      }

      throw new InternalServerErrorException('Failed to update artifact');
    }
  }

  async deleteAiArtifact(id: string) {
    return this.prisma.$transaction(async (tx) => {
      try {
        if (!id) throw new NotFoundException('Artifact ID is required');

        const deleted = await tx.aIArtifact.delete({
          where: { id },
        });

        return {
          statusCode: 200,
          message: 'Artifact has been deleted!',
          data: deleted,
        };
      } catch (err: any) {
        if (err.code === 'P2025') {
          throw new NotFoundException(`Artifact with ID ${id} not found`);
        }

        if (err instanceof ConflictException) {
          throw err;
        }

        throw new InternalServerErrorException('Failed to delete artifact');
      }
    })
  }
}