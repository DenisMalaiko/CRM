import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  BeforeApplicationShutdown
} from '@nestjs/common';
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy, BeforeApplicationShutdown
{
  async onModuleInit() {
    await this.$connect();
  }

  async beforeApplicationShutdown() {
    await this.$disconnect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}