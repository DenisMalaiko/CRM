import { Module } from '@nestjs/common';
import { InstagramService } from "./instagram.service";
import { ApifyModule } from "../apify/apify.module";

@Module({
  imports: [ApifyModule],
  providers: [InstagramService],
  exports: [InstagramService],
})
export class InstagramModule {}
