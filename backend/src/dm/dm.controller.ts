import {
  Controller,
  Get,
  Post,
  Delete,
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

  @Get('received')
  getReceivedLetters(
    @CurrentUser('id') userId: string,
    @Query() query: QueryDmDto,
  ) {
    return this.dmService.getReceivedLetters(userId, query);
  }

  @Get('sent')
  getSentLetters(
    @CurrentUser('id') userId: string,
    @Query() query: QueryDmDto,
  ) {
    return this.dmService.getSentLetters(userId, query);
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser('id') userId: string) {
    return this.dmService.getUnreadCount(userId);
  }

  @Get(':letterId')
  getLetter(
    @CurrentUser('id') userId: string,
    @Param('letterId') letterId: string,
  ) {
    return this.dmService.getLetter(userId, letterId);
  }

  @Delete(':letterId')
  deleteLetter(
    @CurrentUser('id') userId: string,
    @Param('letterId') letterId: string,
  ) {
    return this.dmService.deleteLetter(userId, letterId);
  }

  @Post(':userId')
  sendLetter(
    @CurrentUser('id') myId: string,
    @Param('userId') receiverId: string,
    @Body() dto: SendDmDto,
  ) {
    return this.dmService.sendLetter(myId, receiverId, dto);
  }
}
