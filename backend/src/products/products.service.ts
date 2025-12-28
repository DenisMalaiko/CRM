import { Injectable, NotFoundException, InternalServerErrorException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TProduct, TProductCreate } from "./entities/product.entity";
import { OpenAIEmbeddings } from "@langchain/openai";

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getProducts(businessId: string): Promise<ApiResponse<TProduct[]>> {
    const products = await this.prisma.product.findMany({
      where: { businessId: businessId },
    });

    return {
      statusCode: 200,
      message: "Products has been got!",
      data: products,
    };
  }

  async createProduct(body: TProductCreate) {
    const text = `${body.name} ${body.description}`;
    const embeddingModel = new OpenAIEmbeddings({ model: "text-embedding-3-small" });
    const embedding: any = await embeddingModel.embedQuery(text);

    const product: TProduct = await this.prisma.product.create({
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

  async updateProduct(id: string, body: TProductCreate) {
    if (!id) {
      throw new NotFoundException('Product ID is required');
    }

    try {
      const updated = await this.prisma.product.update({
        where: {id},
        data: {
          type: body.type,
          priceSegment: body.priceSegment,
          name: body.name,
          description: body.description,
          isActive: body.isActive,
          images: body.images,
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