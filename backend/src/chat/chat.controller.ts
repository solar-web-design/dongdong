import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('rooms')
  getRooms(@CurrentUser('id') userId: string) {
    return this.chatService.getRooms(userId);
  }

  @Post('rooms')
  createRoom(@CurrentUser('id') userId: string, @Body() dto: CreateRoomDto) {
    return this.chatService.createRoom(userId, dto);
  }

  @Get('rooms/:id/messages')
  getMessages(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Query() query: QueryMessagesDto,
  ) {
    return this.chatService.getMessages(id, userId, query);
  }
}
