import {ConflictException, Injectable, InternalServerErrorException, NotFoundException} from "@nestjs/common";
import { PrismaService } from "../../src/prisma/prisma.service";
import { TPlatform, TPlatformCreate } from "./entity/platform.entity";

@Injectable()
export class PlatformService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getPlatforms(businessId: string): Promise<ApiResponse<TPlatform[]>> {
    const platforms: TPlatform[] = await this.prisma.platform.findMany({
      where: { businessId: businessId },
    });

    return {
      statusCode: 200,
      message: "Platforms has been got!",
      data: platforms,
    };
  }

  async createPlatform(body: TPlatformCreate) {
    const platform: any = await this.prisma.platform.create({
      data: body
    });

    return {
      statusCode: 200,
      message: "Platform has been created!",
      data: platform,
    }
  }

  async updatePlatform(id: string, body: TPlatformCreate) {
    if (!id) {
      throw new NotFoundException('Platform ID is required');
    }

    console.log("FORM: ", body)

    try {
      const updated = await this.prisma.platform.update({
        where: {id},
        data: {
          name: body.name,
          code: body.code,
          isActive: body.isActive,
        }
      });

      console.log("UPDATED: ", updated)

      return {
        statusCode: 200,
        message: 'Platform has been updated!',
        data: updated,
      };
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Platform with ID ${id} not found`);
      }

      throw new InternalServerErrorException('Failed to update platform');
    }
  }

  async deletePlatform(id: string) {
    return this.prisma.$transaction(async (tx) => {
      try {
        if (!id) throw new NotFoundException('Platform ID is required');

        const deleted = await tx.platform.delete({
          where: { id },
        });

        return {
          statusCode: 200,
          message: 'Platform has been deleted!',
          data: deleted,
        };
      } catch (err: any) {

        if (err.code === 'P2025') {
          throw new NotFoundException(`Platform with ID ${id} not found`);
        }

        if (err instanceof ConflictException) {
          throw err;
        }

        throw new InternalServerErrorException('Failed to delete platform');
      }
    });
  }
}