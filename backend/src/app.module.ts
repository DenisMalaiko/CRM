import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { PrismaModule } from './prisma/prisma.module';
import { ProductsModule } from "./products/products.module";
import { AgencyModule } from "./agency/agency.module";
import { ClientsModule } from "./clients/clients.module";
import { AiManagerModule } from "./ai/manager/ai-manager.module";

@Module({
  imports: [
    AdminModule,
    AuthModule,
    AgencyModule,
    ProductsModule,
    ClientsModule,
    PrismaModule,
    AiManagerModule
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
