import { Controller, Post, Get, Patch, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ProductIdParamDto, CreateProductDto, UpdateProductDto } from "./dto/product.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";
import { ProductsService } from './products.service';
import { ResponseMessage } from "../common/decorators/response-message.decorator";

@UseGuards(JwtAuthGuard)
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get("/:id")
  @ResponseMessage('Products has been got!')
  async getProducts(@Param() { id }: ProductIdParamDto) {
    return await this.productsService.getProducts(id);
  }

  @Post()
  @ResponseMessage('Product has been created!')
  createProduct(@Body() body: CreateProductDto) {
    return this.productsService.createProduct(body);
  }

  @Patch("/:id")
  @ResponseMessage('Product has been updated!')
  updateProduct(@Param() { id } : ProductIdParamDto, @Body() body: UpdateProductDto) {
    return this.productsService.updateProduct(id, body);
  }

  @Delete("/:id")
  @ResponseMessage('Product has been deleted!')
  deleteProduct(@Param() { id }: ProductIdParamDto) {
    return this.productsService.deleteProduct(id);
  }
}
