import { Module } from '@nestjs/common';
import { PromptController } from './prompt.controller';
import { PromptService } from './prompt.service';
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [AuthModule],
  controllers: [PromptController],
  providers: [PromptService]
})
export class PromptModule {}
