import { Module } from "@nestjs/common";
import { StorageUrlService } from "./storage-url.service";

@Module({
  providers: [StorageUrlService],
  exports: [StorageUrlService],
})
export class StorageModule {}