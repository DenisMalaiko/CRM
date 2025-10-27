import {Body, Controller, Delete, Get, Param, Patch, Post, Res} from '@nestjs/common';
import { OrdersService } from "./orders.service";
import {ClientDto} from "../clients/dto/client.dto";

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}


  @Get("/:id")
  async getClients(@Res() res: any, @Param() params: any) {
    const businessId = params.id;

    if(!businessId) return res.json([]);

    const response = await this.ordersService.getOrders(businessId);

    return res.json(response);
  }

  @Post("/create")
  async createOrder(@Body() body: any, @Res() res: any) {
    const response = await this.ordersService.createOrder(body);

    return res.json(response);
  }

/*  @Patch("/update/:id")
  async updateOrder(@Param("id") id: string, @Body() body: ClientDto, @Res() res: any) {
    const response = await this.ordersService.updateOrder(id, body);

    return res.json(response);
  }

  @Delete("/delete/:id")
  async deleteOrder(@Param("id") id: string, @Res() res: any) {
    const response = await this.ordersService.deleteOrder(id);

    return res.json(response);
  }*/
}