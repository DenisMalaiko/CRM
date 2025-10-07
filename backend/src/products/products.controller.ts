import { Controller, Post, Get, Delete, Body, Req, Res, Param } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductDto } from "./dto/product.dto";

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post("/createProduct")
  async createProduct(@Body() body: ProductDto, @Res() res: any) {
    const response = await this.productsService.createProduct(body);

    return res.json(response);
  }

  @Get("/getProducts")
  async getProducts(@Res() res: any) {
    const response = await this.productsService.getProducts();

    return res.json(response);
  }

  @Delete("/deleteProduct/:id")
  async deleteProduct(@Param("id") id: string, @Res() res: any) {
    console.log('DELETE PRODUCT ID:', id);
    const response = await this.productsService.deleteProduct(id);

    return res.json(response);
  }
}
