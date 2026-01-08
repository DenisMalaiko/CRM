import { Controller, Post, Get, Patch, Delete, Body, Req, Res, Param, UseGuards } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductDto } from "./dto/product.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { TProductCreate } from "./entities/product.entity";

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @UseGuards(JwtAuthGuard)
  @Get("/:id")
  async getProducts(@Param() params: any, @Res() res: any) {
    const businessId = params.id;
    if(!businessId) return res.json([]);
    const response = await this.productsService.getProducts(businessId);
    return res.json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Post("/create")
  async createProduct(@Body() body: TProductCreate, @Res() res: any) {
    const response = await this.productsService.createProduct(body);
    return res.json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("/update/:id")
  async updateProduct(@Param("id") id: string, @Body() body: TProductCreate, @Res() res: any) {
    const response = await this.productsService.updateProduct(id, body);
    return res.json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Delete("/delete/:id")
  async deleteProduct(@Param("id") id: string, @Res() res: any) {
    const response = await this.productsService.deleteProduct(id);
    return res.json(response);
  }
}
