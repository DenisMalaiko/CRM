import {Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import { Order, OrderResponse } from "./entities/order.entity";
import { PaymentMethodToPrisma } from "../enums/PaymentMethod";
import { PaymentsStatusToPrisma } from "../enums/PaymentsStatus";
import { OrderStatusToPrisma } from "../enums/OrderStatus";

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getOrders(businessId: string) {
    const orders: OrderResponse[] = await this.prisma.order.findMany({
      where: { businessId: businessId },
      select: {
        id: true,
        businessId: true,
        total: true,
        status: true,
        productIds: true,
        clientId: true,
        paymentStatus: true,
        paymentMethod: true,
        client: true,
        products: true,
        createdAt: true,
        updatedAt: true,
        fulfilledAt: true,
        notes: true,
      }
    });

    return {
      statusCode: 200,
      message: "Orders has been got!",
      data: orders,
    };
  }

  async createOrder(body: Order) {
    const order: OrderResponse = await this.prisma.order.create({
      data: {
        ...body,
        status: OrderStatusToPrisma[body.status],
        paymentMethod: PaymentMethodToPrisma[body.paymentMethod],
        paymentStatus: PaymentsStatusToPrisma[body.paymentStatus],
      }
    });

    return {
      statusCode: 200,
      message: "Order has been created!",
      data: order,
    };
  }

  async updateOrder(id: string, body: Order) {
    if (!id) {
      throw new NotFoundException('Order ID is required');
    }

    try {
      const updated: OrderResponse = await this.prisma.order.update({
        where: {id},
        data: {
          total: body.total,
          status: OrderStatusToPrisma[body.status],
          paymentStatus: PaymentsStatusToPrisma[body.paymentStatus],
          paymentMethod: PaymentMethodToPrisma[body.paymentMethod],
          productIds: body.productIds,
          clientId: body.clientId,
          notes: body.notes,
          fulfilledAt: body.fulfilledAt
        }
      });

      return {
        statusCode: 200,
        message: 'Order has been updated!',
        data: updated,
      };
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      throw new InternalServerErrorException('Failed to update client');
    }
  }

  async deleteOrder(id: string) {
    if (!id) {
      throw new NotFoundException('Order ID is required');
    }


    try {
      const deleted = await this.prisma.order.delete({
        where: { id },
      });

      return {
        statusCode: 200,
        message: 'Order has been deleted!',
        data: deleted,
      };
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Order with ID ${id} not found`);
      }

      throw new InternalServerErrorException('Failed to delete order');
    }
  }
}