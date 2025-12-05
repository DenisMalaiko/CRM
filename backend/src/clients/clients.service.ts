import {Injectable, InternalServerErrorException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import { Client, ClientResponse } from "./entities/clients.entity";

@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getClients(agencyId: string) {
    const clients = await this.prisma.client.findMany({
      where: { agencyId: agencyId },
      select: { id: true, agencyId: true, firstName: true, lastName: true, email: true, countryCode: true, phoneNumber: true, address: true, role: true, isActive: true, createdAt: true, updatedAt: true }
    });

    return {
      statusCode: 200,
      message: "Clients has been got!",
      data: clients,
    };
  }

  async createClient(body: Client) {
    const client: ClientResponse = await this.prisma.client.create({
      data: { ...body }
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
        data: { ...body }
      });

      return {
        statusCode: 200,
        message: 'Client has been updated!',
        data: updated,
      };
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Client with ID ${id} not found`);
      }

      throw new InternalServerErrorException('Failed to update client');
    }
  }

  async deleteClient(id: string) {
    return this.prisma.$transaction(async (tx) => {
      try {
        if (!id) throw new NotFoundException('Client ID is required');

        // Delete Client
        const deleted = await tx.client.delete({
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

        if (err instanceof ConflictException) {
          throw err;
        }

        throw new InternalServerErrorException('Failed to delete client');
      }
    })
  }
}