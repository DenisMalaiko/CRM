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
    console.log("CREATE ORDER: ", body)
    console.log("METHOD ", PaymentMethodToPrisma[body.paymentMethod])

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
      }
    });

    return {
      statusCode: 200,
      message: "Orders has been got!",
      data: orders,
    };

    /*const clients = await this.prisma.order.findMany({
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
        notes: true,

        createdAt: true,
        client: true,
        products: true,
        business: true,
      }
    });

    return {
      statusCode: 200,
      message: "Clients has been got!",
      data: clients,
    };*/
  }
}