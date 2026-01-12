import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';

import { AdminModule } from './admin/admin.module';
import { AuthModule } from './auth/auth.module';
import { AgencyModule } from './agency/agency.module';
import { BusinessModule } from './business/business.module';
import { ProductsModule } from './products/products.module';
import { ProfilesModule } from "./profiles/profiles.module";
import { AudienceModule } from "./audience/audience.module";

@Module({
  imports: [
    PrismaModule,
    AdminModule,
    AuthModule,
    AgencyModule,
    BusinessModule,
    ProductsModule,
    ProfilesModule,
    AudienceModule
  ],
  controllers: [AppController],
  providers: [AppService],
})

export class AppModule {}
