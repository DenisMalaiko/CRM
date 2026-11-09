import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../../core/prisma/prisma.module';
import { DesignSystemController } from './designSystem.controller';
import { DesignSystemService } from './designSystem.service';

@Module({
  imports: [AuthModule, PrismaModule],
  controllers: [DesignSystemController],
  providers: [DesignSystemService],
  exports: [DesignSystemService],
})
export class DesignSystemModule {}
