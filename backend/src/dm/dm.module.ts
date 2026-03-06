import { Module } from '@nestjs/common';
import { DmService } from './dm.service';
import { DmController } from './dm.controller';

@Module({
  controllers: [DmController],
  providers: [DmService],
  exports: [DmService],
})
export class DmModule {}
