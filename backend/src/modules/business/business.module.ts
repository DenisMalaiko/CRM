import { Module } from '@nestjs/common';
import { BusinessController } from './business.controller';
import { BusinessService } from './business.service';
import { AuthModule } from '../auth/auth.module';
import { InstagramModule } from '../instagram/instagram.module';
import { FacebookModule } from '../facebook/facebook.module';
import { AiModule } from '../ai/ai.module';
import { DesignSystemModule } from '../designSystem/designSystem.module';

@Module({
  imports: [AuthModule, InstagramModule, FacebookModule, AiModule, DesignSystemModule],
  controllers: [BusinessController],
  providers: [BusinessService],
})
export class BusinessModule {}
