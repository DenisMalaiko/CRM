import {Body, Controller, Get, Post, Res} from '@nestjs/common';
import { ClientsService } from "./clients.service";

@Controller('clients')
export class ClientsController {
  constructor(private readonly clientsService: ClientsService) {}

  @Get("/")
  async getClients(@Res() res: any) {
    const response = await this.clientsService.getClients();

    return res.json(response);
  }

  @Post("/create")
  async createClient(@Body() body: any, @Res() res: any) {
    const response = await this.clientsService.createClient(body);

    return res.json(response);
  }
}