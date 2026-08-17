import { Module } from '@nestjs/common';
import { BusinessController } from "./business.controller";
import { BusinessService } from "./business.service";
import { AuthModule } from "../auth/auth.module";
import { InstagramModule } from "../instagram/instagram.module";
import { FacebookModule } from "../facebook/facebook.module";

@Module({
  imports: [AuthModule, InstagramModule, FacebookModule],
  controllers: [BusinessController],
  providers: [BusinessService],
})
export class BusinessModule {}
