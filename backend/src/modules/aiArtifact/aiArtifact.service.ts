import { Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { StorageUrlService } from "../../core/storage/storage-url.service";
import { AIArtifactBase } from "./entities/aiArtifact.entity";

@Injectable()
export class AiArtifactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageUrlService: StorageUrlService
  ) {}

  async getAiArtifacts(businessId: string): Promise<AIArtifactBase[]> {
    const artifacts = await this.prisma.aIArtifact.findMany({
      where: { businessId: businessId },
      include: {
        products: { include: { product: true } },
      }
    });

    return artifacts.map((artifact) => {
      return {
        ...artifact,
        imageUrl: artifact.imageUrl ? this.storageUrlService.getPublicUrl(artifact.imageUrl) : null,
      }
    })
  }

  async updateAiArtifact(id: string, body: any): Promise<AIArtifactBase> {
    if (!id) throw new NotFoundException('Artifact ID is required');

    try {
      return await this.prisma.aIArtifact.update({
        where: {id},
        data: {
          type: body.type,
          outputJson: body.outputJson,
          status: body.status,
        },
        include: {
          products: { include: { product: true } },
        }
      });
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Artifact with ID ${id} not found`);
      }

      throw new InternalServerErrorException('Failed to update artifact');
    }
  }

  async deleteAiArtifact(id: string) {
    try {
      return await this.prisma.aIArtifact.delete({ where: { id } });
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Artifact with ID ${id} not found`);
      }
      throw err;
    }
  }
}