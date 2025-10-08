import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
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

      throw new InternalServerErrorException('Failed to delete product');
    }
  }

  async deleteProduct(id: string) {
    if (!id) {
      throw new NotFoundException('Product ID is required');
    }

    try {
      const deleted = await this.prisma.product.delete({
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

      throw new InternalServerErrorException('Failed to delete product');
    }
  }
}