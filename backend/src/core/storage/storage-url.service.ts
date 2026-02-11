import { Injectable } from "@nestjs/common";
import * as process from "node:process";

@Injectable()
export class StorageUrlService {
  private readonly baseUrl = process.env.ASSETS_BASE_URL!;

  getPublicUrl(key: string) {
    return `${this.baseUrl}/${key}`;
  }
}