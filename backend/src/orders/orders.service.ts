import {Injectable, InternalServerErrorException, NotFoundException} from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import { Order, OrderResponse } from "./entities/order.entity";
import { PaymentMethodToPrisma } from "../enums/PaymentMethod";
import { PaymentsStatusToPrisma, PaymentsStatusUI } from "../enums/PaymentsStatus";
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
        quantity: true,
        status: true,
        productId: true,
        clientId: true,
        paymentStatus: true,
        paymentMethod: true,
        client: true,
        product: true,
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
    return this.prisma.$transaction(async (tx) => {

      try {
        const product = await tx.product.findUnique({
          where: { id: body.productId },
        });

        if (!product) throw new Error("Product not found");
        if (product.stock - product.reserved < body.quantity) throw new Error("Not enough stock available");

        switch (body.paymentStatus) {
          case PaymentsStatusUI.Paid:
            await tx.product.update({
              where: { id: product.id },
              data: { stock: { decrement: body.quantity } },
            });
            break;

          case PaymentsStatusUI.Unpaid:
            await tx.product.update({
              where: { id: product.id },
              data: {
                stock: { decrement: body.quantity },
                reserved: { increment: body.quantity }
              },
            });
            break;
        }

        const order: OrderResponse = await tx.order.create({
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
      }  catch (err: any) {
        throw new InternalServerErrorException('Failed to create Order');
      }
    })
  }

  async updateOrder(id: string, body: Order) {
    return this.prisma.$transaction(async (tx) => {
      try {
        if (!id) throw new NotFoundException('Order ID is required');

        const product = await tx.product.findUnique({
          where: { id: body.productId },
        });

        if (!product) throw new Error("Product not found");
        if (product.stock - product.reserved < body.quantity) throw new Error("Not enough stock available");

        switch (body.paymentStatus) {
          case PaymentsStatusUI.Paid:
            await tx.product.update({
              where: { id: product.id },
              data: {
                reserved: { decrement: body.quantity }
              },
            });
            break;
        }

        const updated: OrderResponse = await this.prisma.order.update({
          where: {id},
          data: {
            total: body.total,
            status: OrderStatusToPrisma[body.status],
            paymentStatus: PaymentsStatusToPrisma[body.paymentStatus],
            paymentMethod: PaymentMethodToPrisma[body.paymentMethod],
            productId: body.productId,
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

        throw new InternalServerErrorException('Failed to update Order');
      }
    });
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