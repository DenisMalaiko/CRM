import { Module } from '@nestjs/common';
import { FacebookService } from "./facebook.service";
import { ApifyModule } from "../apify/apify.module";

@Module({
  imports: [ApifyModule],
  providers: [FacebookService],
  exports: [FacebookService],
})
export class FacebookModule {}