import {Body, Controller, Delete, Get, Param, Patch, Post, Res, UseGuards} from '@nestjs/common';
import { OrdersService } from "./orders.service";
import { OrderDto } from "./dto/order.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Get("/:id")
  async getClients(@Res() res: any, @Param() params: any) {
    const businessId = params.id;

    if(!businessId) return res.json([]);

    const response = await this.ordersService.getOrders(businessId);

    return res.json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Post("/create")
  async createOrder(@Body() body: any, @Res() res: any) {
    const response = await this.ordersService.createOrder(body);

    return res.json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("/update/:id")
  async updateOrder(@Param("id") id: string, @Body() body: OrderDto, @Res() res: any) {
    const response = await this.ordersService.updateOrder(id, body);

    return res.json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Delete("/delete/:id")
  async deleteOrder(@Param("id") id: string, @Res() res: any) {
    const response = await this.ordersService.deleteOrder(id);

    return res.json(response);
  }
}