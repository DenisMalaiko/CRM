import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Product, ProductResponse } from "./entities/product.entity";

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async createProduct(body: Product) {
    const product: ProductResponse = await this.prisma.product.create({
      data: {
        name: body.name,
        description: body.description,
        sku: body.sku,
        price: body.price,
        stock: body.stock,
        category: body.category,
        status: body.status,
      }
    })

    return {
      statusCode: 200,
      message: "Product has been created!",
      data: product,
    };
  }

  async getProducts() {
    const products = await this.prisma.product.findMany();

    return {
      statusCode: 200,
      message: "Products has been got!",
      data: products,
    };
  }
}