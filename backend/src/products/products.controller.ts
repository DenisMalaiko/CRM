import { Controller, Post, Get, Body, Req, Res } from '@nestjs/common';
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
}
