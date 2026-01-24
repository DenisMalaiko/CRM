import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AiArtifactService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getAiArtifacts(businessId: string) {
    const artifacts = await this.prisma.aIArtifact.findMany({
      where: { businessId: businessId },
    });

    return {
      statusCode: 200,
      message: "AI Artifacts has been got!",
      data: artifacts,
    };
  }
}