import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import * as process from "node:process";
import {AdminController} from "./admin.controller";
import {AdminService} from "./admin.service";

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: '5m' },
    })
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}