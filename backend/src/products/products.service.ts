import { Injectable, NotFoundException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Product, ProductResponse } from "./entities/product.entity";
import { OrderStatusUI } from "../enums/OrderStatus";
import {Order, OrderResponse} from "../orders/entities/order.entity";
import { OpenAIEmbeddings } from "@langchain/openai";
import { Prisma } from '../../generated/prisma';


@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getProducts(businessId: string) {
    const products = await this.prisma.product.findMany({
      where: { businessId: businessId },
    });

    return {
      statusCode: 200,
      message: "Products has been got!",
      data: products,
    };
  }

  async createProduct(body: Product) {
    const text = `${body.name} ${body.description}`;
    const embeddingModel = new OpenAIEmbeddings({ model: "text-embedding-3-small" });
    const embedding: any = await embeddingModel.embedQuery(text);

    const product: ProductResponse = await this.prisma.product.create({
      data: {
        ...body,
      }
    });

    await this.prisma.$executeRawUnsafe(
      `UPDATE "Product" SET embedding = $1 WHERE id = $2`,
      embedding,
      product.id,
    );

    return {
      statusCode: 200,
      message: "Product has been created!",
      data: product,
    };
  }

  async updateProduct(id: string, body: Product) {
    if (!id) {
      throw new NotFoundException('Product ID is required');
    }

    try {
      const updated = await this.prisma.product.update({
        where: {id},
        data: {
          name: body.name,
          description: body.description,
          sku: body.sku,
          price: body.price,
          stock: body.stock,
          category: body.category,
          status: body.status,
          businessId: body?.businessId
        }
      });

      return {
        statusCode: 200,
        message: 'Product has been updated!',
        data: updated,
      };
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      throw new InternalServerErrorException('Failed to update product');
    }
  }

  async deleteProduct(id: string) {
    return this.prisma.$transaction(async (tx) => {
      try {
        if (!id) throw new NotFoundException('Product ID is required');

        // Get Orders By Product ID
        const orders = await tx.order.findMany({
          where: { productId: id },
          select: {
            id: true,
            status: true,
          }
        });

        // Check if product is in use
        const isProductUse: boolean = orders.some((order: OrderResponse) => {
          if (!order.status) return false;
          const status = order.status as OrderStatusUI;
          return ![OrderStatusUI.Cancelled, OrderStatusUI.Completed].includes(status);
        });

        if(isProductUse) {
          throw new ConflictException('Product is in use! Please complete or cancel all orders before deleting the product.');
        }

        // Delete Orders By Product ID
        await tx.order.deleteMany({ where: { productId: id } });

        // Delete Product
        const deleted = await tx.product.delete({
          where: { id },
        });

        return {
          statusCode: 200,
          message: 'Product has been deleted!',
          data: deleted,
        };
      } catch (err: any) {

        if (err.code === 'P2025') {
          throw new NotFoundException(`Product with ID ${id} not found`);
        }

        if (err instanceof ConflictException) {
          throw err;
        }

        throw new InternalServerErrorException('Failed to delete product');
      }
    });
  }
}