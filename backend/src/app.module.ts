import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from "./products/products.module";
import { BusinessModule } from "./business/business.module";
import { ClientsModule } from "./clients/clients.module";
import { OrdersModule } from "./orders/orders.module";
import { AiManagerModule } from "./ai/manager/ai-manager.module";

@Module({
  imports: [
    AdminModule,
    AuthModule,
    BusinessModule,
    ProductsModule,
    ClientsModule,
    PrismaModule,
    OrdersModule,
    AiManagerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
