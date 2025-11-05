import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import { Order } from "./entities/order.entity";
import { PaymentMethodToPrisma } from "../enums/PaymentMethod";

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createOrder(body: Order) {
    console.log("-------------")
    console.log("Client ID: ", body)
    console.log("-------------")

    const order = await this.prisma.order.create({
      data: {
        ...body,
        paymentMethod: PaymentMethodToPrisma[body.paymentMethod],
      }
    });

    return {
      statusCode: 200,
      message: "Order has been created!",
      data: order,
    };
  }

  async getOrders(businessId: string) {
    const orders = await this.prisma.order.findMany({
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
        products: true
      }
    });

    return {
      statusCode: 200,
      message: "Orders has been got!",
      data: orders,
    };
  }
}