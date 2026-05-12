import { Module } from '@nestjs/common';
import { TiktokService } from "./tiktok.service";
import { ApifyModule } from "../apify/apify.module";

@Module({
  imports: [ApifyModule],
  providers: [TiktokService],
  exports: [TiktokService],
})
export class TiktokModule {}
