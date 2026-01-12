import {ConflictException, Injectable, InternalServerErrorException, NotFoundException} from "@nestjs/common";
import {PrismaService} from "../prisma/prisma.service";
import {TAudience, TAudienceCreate} from "./entity/audience.entity";

@Injectable()
export class AudienceService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getAudiences(businessId: string): Promise<ApiResponse<TAudience[]>> {
    const audiences: TAudience[] = await this.prisma.targetAudience.findMany({
      where: { businessId: businessId },
    });

    return {
      statusCode: 200,
      message: "Profiles has been got!",
      data: audiences,
    };
  }

  async createAudience(body: TAudienceCreate) {
    const audience: any = await this.prisma.targetAudience.create({
      data: body
    });

    return {
      statusCode: 200,
      message: "Profile has been created!",
      data: audience,
    }
  }

  async updateAudience(id: string, body: TAudienceCreate) {
    if (!id) {
      throw new NotFoundException('Audience ID is required');
    }

    try {
      const updated = await this.prisma.targetAudience.update({
        where: {id},
        data: {
          name: body.name,
          ageRange: body.ageRange,
          gender: body.gender,
          geo: body.geo,
          pains: body.pains,
          desires: body.desires,
          triggers: body.triggers,
          incomeLevel: body.incomeLevel,
        }
      });

      return {
        statusCode: 200,
        message: 'Audience has been updated!',
        data: updated,
      };
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Audience with ID ${id} not found`);
      }

      throw new InternalServerErrorException('Failed to update audience');
    }
  }

  async deleteAudience(id: string) {
    return this.prisma.$transaction(async (tx) => {
      try {
        if (!id) throw new NotFoundException('Audience ID is required');

        const deleted = await tx.targetAudience.delete({
          where: { id },
        });

        return {
          statusCode: 200,
          message: 'Audience has been deleted!',
          data: deleted,
        };
      } catch (err: any) {

        if (err.code === 'P2025') {
          throw new NotFoundException(`Audience with ID ${id} not found`);
        }

        if (err instanceof ConflictException) {
          throw err;
        }

        throw new InternalServerErrorException('Failed to delete audience');
      }
    });
  }
}