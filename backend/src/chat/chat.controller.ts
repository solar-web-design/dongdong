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
import { ChatService } from './chat.service';
import { ChatGateway } from './chat.gateway';
import { CreateRoomDto } from './dto/create-room.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(
    private chatService: ChatService,
    private chatGateway: ChatGateway,
    private notificationsService: NotificationsService,
    private prisma: PrismaService,
  ) {}

  @Get('rooms')
  getRooms(@CurrentUser('id') userId: string) {
    return this.chatService.getRooms(userId);
  }

  @Post('rooms')
  async createRoom(@CurrentUser('id') userId: string, @Body() dto: CreateRoomDto) {
    const room = await this.chatService.createRoom(userId, dto);
    const memberIds = room.members.map((m: { userId: string }) => m.userId);
    this.chatGateway.notifyNewRoom(room as unknown as Record<string, unknown>, memberIds);

    // 상대방에게 채팅방 초대 알림 생성
    const creator = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });
    const creatorName = creator?.name || '알 수 없음';
    for (const memberId of memberIds) {
      if (memberId !== userId) {
        this.notificationsService.create(
          memberId,
          'CHAT',
          `${creatorName}님이 채팅을 시작했습니다`,
          room.name || '새 채팅방',
          `/chat/${room.id}`,
        ).catch(() => {});
      }
    }

    return room;
  }

  @Delete('rooms/:id/leave')
  async leaveRoom(@Param('id') id: string, @CurrentUser('id') userId: string) {
    await this.chatService.leaveRoom(id, userId);
    return { message: '채팅방을 나갔습니다' };
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
