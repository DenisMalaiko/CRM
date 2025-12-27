import {Body, Controller, Delete, Get, Param, Patch, Post, Res, UseGuards } from '@nestjs/common';
import { ClientsService } from "./clients.service";
import {ProductDto} from "../products/dto/product.dto";
import {ClientDto} from "./dto/client.dto";
import { JwtAuthGuard } from "../guards/jwt-auth.guard";

@Controller('business')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @UseGuards(JwtAuthGuard)
  @Get("/list/:id")
  async getClients(@Res() res: any, @Param() params: any) {
    const agencyId = params.id;

    if(!agencyId) return res.json([]);

    const response = await this.clientsService.getClients(agencyId);

    return res.json(response);
  }

  @UseGuards(JwtAuthGuard)
  @Get("/:id")
  async getClientById(@Res() res: any, @Param() params: any) {
    const clientId = params.id;

    if(!clientId) return res.json([]);

    const response = await this.clientsService.getClient(clientId);

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