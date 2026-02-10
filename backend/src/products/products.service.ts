import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TProduct, TProductCreate, TProductUpdate } from "./entities/product.entity";
import { OpenAIEmbeddings } from "@langchain/openai";

@Injectable()
export class ProductsService {
  constructor(
    private readonly prisma: PrismaService,
  ) {}

  async getProducts(businessId: string): Promise<TProduct[]> {
    return await this.prisma.product.findMany({
      where: { businessId: businessId },
    });
  }

  async createProduct(body: TProductCreate): Promise<TProduct> {
    const text = `${body.name} ${body.description}`;
    const embeddingModel = new OpenAIEmbeddings({ model: "text-embedding-3-small" });
    const embedding: any = await embeddingModel.embedQuery(text);
    const product: TProduct = await this.prisma.product.create({
      data: { ...body }
    });

    await this.prisma.$executeRawUnsafe(
      `UPDATE "Product" SET embedding = $1 WHERE id = $2`,
      embedding,
      product.id,
    );

    return product;
  }

  async updateProduct(id: string, body: TProductUpdate): Promise<TProduct> {
    if (!id) throw new NotFoundException('Product ID is required');

    try {
      return await this.prisma.product.update({
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
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }

      throw new InternalServerErrorException('Failed to update product');
    }
  }

  async deleteProduct(id: string) {
    try {
      return await this.prisma.product.delete({ where: { id } });
    } catch (err: any) {
      if (err.code === 'P2025') {
        throw new NotFoundException(`Product with ID ${id} not found`);
      }
      throw err;
    }
  }
}