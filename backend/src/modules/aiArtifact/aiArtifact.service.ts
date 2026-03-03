import { Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import { PrismaService } from 'src/core/prisma/prisma.service';
import { S3Service } from 'src/core/s3/s3.service';
import { StorageUrlService } from "../../core/storage/storage-url.service";
import { AIArtifactBase } from "./entities/aiArtifact.entity";

@Injectable()
export class AiArtifactService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3Service: S3Service,
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
    const aIArtifact = await this.prisma.aIArtifact.findUnique({
      where: { id },
      select: { id: true, imageUrl: true },
    });

    if (!aIArtifact) {
      throw new Error('AI artifact not found');
    }

    if (aIArtifact.imageUrl) {
      await this.s3Service.delete(aIArtifact.imageUrl);
    }

    return await this.prisma.$transaction(async (tx) => {
      await tx.aIArtifact.delete({
        where: { id },
      });
    });
  }
}