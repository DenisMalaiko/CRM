import {Injectable, InternalServerErrorException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import { Client, ClientResponse } from "./entities/clients.entity";
import { OrderStatusUI } from "../enums/OrderStatus";
import { Order, OrderResponse } from "../orders/entities/order.entity";
import { PaymentsStatusUI } from "../enums/PaymentsStatus";

@Injectable()
export class ClientsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getClients(businessId: string) {
    const clients = await this.prisma.client.findMany({
      where: { businessId: businessId },
      select: { id: true, businessId: true, firstName: true, lastName: true, email: true, countryCode: true, phoneNumber: true, address: true, role: true, isActive: true, createdAt: true, updatedAt: true }
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

        // Get Orders By Product ID
        const orders = await tx.order.findMany({
          where: { clientId: id },
          select: {
            id: true,
            status: true,
            paymentStatus: true,
            productId: true,
            quantity: true,
          }
        });

        if (!orders.length) {
          const deleted = await tx.client.delete({ where: { id } });
          return {
            statusCode: 200,
            message: 'Client has been deleted!',
            data: deleted,
          };
        }

        // Check if orders is in use
        const hasActiveOrders = orders.some((order) => {
          if (!order.status) return false;
          const status = order.status as OrderStatusUI;
          return ![OrderStatusUI.Cancelled, OrderStatusUI.Completed].includes(status);
        });

        if (hasActiveOrders) {
          throw new ConflictException(
            'Client is in use! Please complete or cancel all orders before deleting the client.'
          );
        }

        const cancelledUnpaidOrders = orders.filter(
          (order) =>
            order.status === OrderStatusUI.Cancelled &&
            order.paymentStatus === PaymentsStatusUI.Unpaid
        );

        for (const order of cancelledUnpaidOrders) {
          if (!order.productId || !order.quantity) continue;

          await tx.product.update({
            where: { id: order.productId },
            data: {
              reserved: { decrement: order.quantity },
              stock: { increment: order.quantity },
            },
          });
        }

        // Delete Orders By Client ID
        await tx.order.deleteMany({ where: { clientId: id } });

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