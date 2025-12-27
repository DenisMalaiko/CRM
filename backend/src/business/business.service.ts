import { Injectable, InternalServerErrorException, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import { TBusiness, TBusinessCreate } from "./entities/business.entity";

@Injectable()
export class BusinessService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getBusinesses(agencyId: string): Promise<ApiResponse<TBusiness[]>> {
    if(!agencyId) throw new BadRequestException('Agency ID is required!')

    const businesses: TBusiness[] = await this.prisma.business.findMany({
      where: { agencyId: agencyId },
      select: {
        id: true,
        agencyId: true,
        name: true,
        website: true,
        industry: true,
        status: true,
      }
    });

    if (!businesses) {
      throw new NotFoundException('Businesses not found!');
    }

    return {
      statusCode: 200,
      message: "Businesses retrieved successfully!",
      data: businesses,
    };
  }

  async getBusiness(id: string) {
    const business = await this.prisma.business.findUnique({
      where: { id },
      select: {
        id: true,
        agencyId: true,
        name: true,
        website: true,
        industry: true,
        status: true,
      }
    });

    return {
      statusCode: 200,
      message: "Business has been got!",
      data: business,
    };
  }

  async createBusiness(body: TBusinessCreate): Promise<ApiResponse<TBusiness>> {
    const existingBusiness = await this.prisma.business.findFirst({
      where: {
        agencyId: body.agencyId,
        name: body.name,
        website: body.website,
      },
      select: { id: true },
    });

    if (existingBusiness) {
      throw new ConflictException('Business already exists!');
    }

    const business: TBusiness = await this.prisma.business.create({
      data: body,
      select: {
        id: true,
        agencyId: true,
        name: true,
        website: true,
        industry: true,
        status: true,
      },
    });

    return {
      statusCode: 201,
      message: "Business has been created!",
      data: business,
    };
  }

  async updateBusiness(id: string, body: TBusinessCreate): Promise<ApiResponse<TBusiness>> {
    if (!id) throw new NotFoundException('Business ID is required');

    try {
      const updated = await this.prisma.business.update({
        where: { id },
        data: body,
        select: {
          id: true,
          agencyId: true,
          name: true,
          website: true,
          industry: true,
          status: true,
        },
      });

      return {
        statusCode: 200,
        message: 'Business has been updated!',
        data: updated,
      };
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Business with ID ${id} not found`);
      }

      throw new InternalServerErrorException('Failed to update client');
    }
  }

  async deleteBusiness(id: string) {
    return this.prisma.$transaction(async (tx) => {
      try {
        if (!id) throw new NotFoundException('Business ID is required');

        const deleted = await tx.business.delete({
          where: { id },
        });

        return {
          statusCode: 200,
          message: 'Business has been deleted!',
          data: deleted,
        };
      } catch (err: any) {
        if (err.code === 'P2025') {
          throw new NotFoundException(`Business with ID ${id} not found`);
        }

        if (err instanceof ConflictException) {
          throw err;
        }

        throw new InternalServerErrorException('Failed to delete client');
      }
    })
  }
}