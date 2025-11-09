import {Injectable, InternalServerErrorException, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import { Order, OrderResponse } from "./entities/order.entity";
import { PaymentMethodToPrisma } from "../enums/PaymentMethod";
import { PaymentsStatusToPrisma, PaymentsStatusUI } from "../enums/PaymentsStatus";
import { OrderStatusToPrisma, OrderStatusUI } from "../enums/OrderStatus";
import { ProductResponse } from "../products/entities/product.entity";

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

        // Check if order exists
        const existingOrder = await tx.order.findUnique({
          where: { id },
        });

        if (!existingOrder) throw new NotFoundException('Order not found');

        // Get Product
        const product = await tx.product.findUnique({
          where: { id: body.productId },
        });

        if (!product) throw new Error("Product not found");

        // Check if product is reserved
        const delta = body.quantity - existingOrder.quantity;
        if (delta > 0) {
          const availableStock = product.stock - product.reserved;
          if (availableStock < delta) {
            throw new Error('Not enough stock available');
          }
        }

        const prevStatus = existingOrder.paymentStatus as PaymentsStatusUI;
        const newStatus = body.paymentStatus as PaymentsStatusUI;

        if (
          newStatus === PaymentsStatusUI.Paid &&
          [PaymentsStatusUI.Unpaid, PaymentsStatusUI.Failed, PaymentsStatusUI.Refund].includes(prevStatus)
        ) {
          await tx.product.update({
            where: { id: product.id },
            data: {
              reserved: { decrement: body.quantity },
            },
          });
        }

        if (
          prevStatus === PaymentsStatusUI.Paid &&
          [PaymentsStatusUI.Unpaid, PaymentsStatusUI.Failed, PaymentsStatusUI.Refund].includes(newStatus)
        ) {
          await tx.product.update({
            where: { id: product.id },
            data: {
              reserved: { increment: body.quantity },
            },
          });
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

        console.log("ERROR ", err);

        if (err.code === 'P2025') {
          throw new NotFoundException(`Order with ID ${id} not found`);
        }

        throw new InternalServerErrorException('Failed to update Order');
      }
    });
  }

  async deleteOrder(id: string) {
    return this.prisma.$transaction(async (tx) => {
      try {
        if (!id) throw new NotFoundException('Order ID is required');

        const order: OrderResponse = await tx.order.findUniqueOrThrow({
          where: { id: id },
          select: {
            id: true,
            status: true,
            businessId: true,
            quantity: true,
            productId: true,
            paymentStatus: true,
          }
        });

        if (!order || !order.quantity) throw new ConflictException("Order not found");
        if (![OrderStatusUI.Completed, OrderStatusUI.Cancelled].includes(order?.status as OrderStatusUI)) throw new ConflictException("Order can't be deleted. Please complete or cancel the order first.");

        const product: ProductResponse = await tx.product.findUniqueOrThrow({
          where: { id: order.productId },
          select: {
            id: true,
            businessId: true,
            stock: true,
            reserved: true,
          }
        });

        if (!product) throw new Error('Product not found');

        if (product.stock == null || product.reserved == null) {
          throw new ConflictException('Invalid product data');
        }

        switch (order.paymentStatus) {
          case PaymentsStatusUI.Unpaid:
            await tx.product.update({
              where: { id: product.id },
              data: {
                reserved: { decrement: order.quantity },
                stock: { increment: order.quantity }
              },
            });
            break;
        }

        const deleted: OrderResponse = await this.prisma.order.delete({
          where: { id },
        });

        return {
          statusCode: 200,
          message: 'Order has been deleted!',
          data: deleted,
        };
      } catch (err: any) {
        console.log("ERROR ", err);

        if (err.code === 'P2025') {
          throw new NotFoundException(`Order with ID ${id} not found`);
        }

        if (err instanceof ConflictException) {
          throw err;
        }

        throw new InternalServerErrorException('Failed to delete order');
      }
    });
  }
}