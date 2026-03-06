import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { DmService } from './dm.service';
import { SendDmDto } from './dto/send-dm.dto';
import { QueryDmDto } from './dto/query-dm.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('dm')
@UseGuards(JwtAuthGuard)
export class DmController {
  constructor(private dmService: DmService) {}

  @Get()
  getConversations(@CurrentUser('id') userId: string) {
    return this.dmService.getConversations(userId);
  }

  @Get(':userId')
  getMessages(
    @CurrentUser('id') myId: string,
    @Param('userId') partnerId: string,
    @Query() query: QueryDmDto,
  ) {
    return this.dmService.getMessages(myId, partnerId, query);
  }

  @Post(':userId')
  sendMessage(
    @CurrentUser('id') myId: string,
    @Param('userId') receiverId: string,
    @Body() dto: SendDmDto,
  ) {
    return this.dmService.sendMessage(myId, receiverId, dto);
  }

  @Patch(':userId/read')
  markAsRead(
    @CurrentUser('id') myId: string,
    @Param('userId') partnerId: string,
  ) {
    return this.dmService.markAsRead(myId, partnerId);
  }
}
