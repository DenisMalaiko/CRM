import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import { Client, ClientResponse } from "./entities/clients.entity";

@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getClients() {
    const clients = await this.prisma.client.findMany();

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
}