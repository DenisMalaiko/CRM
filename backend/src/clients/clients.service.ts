import {Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import { Client, ClientResponse } from "./entities/clients.entity";
import {Product} from "../products/entities/product.entity";

@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getClients(businessId: string) {
    const clients = await this.prisma.client.findMany({
      where: { businessId: businessId },
      select: { id: true, businessId: true, firstName: true, lastName: true, email: true, phoneNumber: true, address: true, role: true, isActive: true }
    });

    return {
      statusCode: 200,
      message: "Clients has been got!",
      data: clients,
    };
  }

  async createClient(body: Client) {
    const client: ClientResponse = await this.prisma.client.create({
      data: {
        businessId: body.businessId,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phoneNumber: body.phoneNumber,
        address: body.address,
        role: body.role,
        isActive: body.isActive,
      }
    });

    return {
      statusCode: 200,
      message: "Client has been created!",
      data: client,
    };
  }

  async updateClient(id: string, body: Client) {
    if (!id) {
      throw new NotFoundException('Client ID is required');
    }

    try {
      const updated = await this.prisma.client.update({
        where: {id},
        data: {
          businessId: body.businessId,
          firstName: body.firstName,
          lastName: body.lastName,
          email: body.email,
          phoneNumber: body.phoneNumber,
          address: body.address,
          role: body.role,
          isActive: body.isActive,
        }
      });

      return {
        statusCode: 200,
        message: 'Client has been updated!',
        data: updated,
      };
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      throw new InternalServerErrorException('Failed to update client');
    }
  }

  async deleteClient(id: string) {
    if (!id) {
      throw new NotFoundException('Client ID is required');
    }

    try {
      const deleted = await this.prisma.client.delete({
        where: { id },
      });

      return {
        statusCode: 200,
        message: 'Client has been deleted!',
        data: deleted,
      };
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Client with ID ${id} not found`);
      }

      throw new InternalServerErrorException('Failed to delete client');
    }
  }
}