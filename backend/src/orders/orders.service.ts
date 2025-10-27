import { Injectable } from '@nestjs/common';
import { PrismaService } from "../prisma/prisma.service";
import {Business, BusinessResponse} from "../business/entities/business.entity";
import {BusinessIndustryToPrisma} from "../enums/BusinessIndustry";

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createOrder(body: Business) {
    console.log("CREATE ORDER: ", body)
/*    const business: BusinessResponse = await this.prisma.order.create({
      data: {
        name: body.name,
        industry: BusinessIndustryToPrisma[body.industry],
        tier: body.tier
      }
    });

    return {
      statusCode: 200,
      message: "Business has been created!",
      data: business,
    };*/
  }

  async getOrders(businessId: string) {
    const clients = await this.prisma.order.findMany({
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
    };
  }
}