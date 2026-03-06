import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { QueryMessagesDto } from './dto/query-messages.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async getRooms(userId: string) {
    const memberships = await this.prisma.chatRoomMember.findMany({
      where: { userId },
      include: {
        chatRoom: {
          include: {
            members: {
              include: {
                user: { select: { id: true, name: true, profileImage: true } },
              },
            },
            messages: {
              take: 1,
              orderBy: { createdAt: 'desc' },
            },
          },
        },
      },
      orderBy: { chatRoom: { updatedAt: 'desc' } },
    });

    return {
      data: memberships.map((m) => {
        const unreadCount = 0; // Will be computed with lastReadAt
        return {
          ...m.chatRoom,
          lastMessage: m.chatRoom.messages[0] || null,
          unreadCount,
          messages: undefined,
        };
      }),
    };
  }

  async createRoom(userId: string, dto: CreateRoomDto) {
    const allMemberIds = [...new Set([userId, ...dto.memberIds])];

    const room = await this.prisma.chatRoom.create({
      data: {
        name: dto.name,
        type: dto.type,
        members: {
          create: allMemberIds.map((id) => ({ userId: id })),
        },
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, name: true, profileImage: true } },
          },
        },
      },
    });

    return room;
  }

  async getMessages(roomId: string, userId: string, query: QueryMessagesDto) {
    await this.verifyMembership(roomId, userId);

    const { cursor, limit = 50 } = query;
    const messages = await this.prisma.chatMessage.findMany({
      where: {
        chatRoomId: roomId,
        ...(cursor && { createdAt: { lt: new Date(cursor) } }),
      },
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
    });

    const hasMore = messages.length > limit;
    const data = hasMore ? messages.slice(0, limit) : messages;

    return {
      data,
      nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
    };
  }

  async sendMessage(
    roomId: string,
    senderId: string,
    content: string,
    images?: string[],
  ) {
    await this.verifyMembership(roomId, senderId);

    const message = await this.prisma.chatMessage.create({
      data: { chatRoomId: roomId, senderId, content, images: images || [] },
    });

    await this.prisma.chatRoom.update({
      where: { id: roomId },
      data: { updatedAt: new Date() },
    });

    return message;
  }

  async markAsRead(roomId: string, userId: string) {
    await this.prisma.chatRoomMember.update({
      where: { chatRoomId_userId: { chatRoomId: roomId, userId } },
      data: { lastReadAt: new Date() },
    });
  }

  private async verifyMembership(roomId: string, userId: string) {
    const member = await this.prisma.chatRoomMember.findUnique({
      where: { chatRoomId_userId: { chatRoomId: roomId, userId } },
    });
    if (!member) {
      throw new ForbiddenException('채팅방 멤버가 아닙니다');
    }
    return member;
  }
}
