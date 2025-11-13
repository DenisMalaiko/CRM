import {Body, Controller, Delete, Get, Param, Patch, Post, Res, UseGuards } from '@nestjs/common';
import { ClientsService } from "./clients.service";
import {ProductDto} from "../products/dto/product.dto";
import {ClientDto} from "./dto/client.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @UseGuards(JwtAuthGuard)
  @Get("/:id")
  async getClients(@Res() res: any, @Param() params: any) {
    const businessId = params.id;

    if(!businessId) return res.json([]);

    const response = await this.clientsService.getClients(businessId);

    return res.json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Post("/create")
  async createClient(@Body() body: any, @Res() res: any) {
    const response = await this.clientsService.createClient(body);

    return res.json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Patch("/update/:id")
  async updateProduct(@Param("id") id: string, @Body() body: ClientDto, @Res() res: any) {
    const response = await this.clientsService.updateClient(id, body);

    return res.json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Delete("/delete/:id")
  async deleteProduct(@Param("id") id: string, @Res() res: any) {
    const response = await this.clientsService.deleteClient(id);

    return res.json(response);
  }
}