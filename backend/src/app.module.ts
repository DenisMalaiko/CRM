import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from "./products/products.module";
import { BusinessModule } from "./business/business.module";
import { ClientsModule } from "./clients/clients.module";

@Module({
  imports: [
    AdminModule,
    AuthModule,
    BusinessModule,
    ProductsModule,
    ClientsModule,
    PrismaModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
