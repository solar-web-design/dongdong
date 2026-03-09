import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { TenantService } from './tenant.service';
import { TenantController } from './tenant.controller';
import { TenantRequestService } from './tenant-request.service';
import { TenantRequestController } from './tenant-request.controller';

@Module({
  imports: [PrismaModule],
  controllers: [TenantController, TenantRequestController],
  providers: [TenantService, TenantRequestService],
  exports: [TenantService],
})
export class TenantModule {}
