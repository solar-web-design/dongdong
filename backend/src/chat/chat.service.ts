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

    // DM은 정확히 2명만 허용
    if (dto.type === 'DM' && allMemberIds.length !== 2) {
      throw new ForbiddenException('DM은 상대방 1명만 선택할 수 있습니다');
    }

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

    // Enrich messages with sender info
    const senderIds = [...new Set(messages.map((m) => m.senderId))];
    const senders = await this.prisma.user.findMany({
      where: { id: { in: senderIds } },
      select: { id: true, name: true, profileImage: true },
    });
    const senderMap = new Map(senders.map((s) => [s.id, s]));
    const enrichedMessages = messages.map((m) => ({
      ...m,
      sender: senderMap.get(m.senderId) || null,
    }));

    const hasMore = enrichedMessages.length > limit;
    const data = hasMore ? enrichedMessages.slice(0, limit) : enrichedMessages;

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

    const sender = await this.prisma.user.findUnique({
      where: { id: senderId },
      select: { id: true, name: true, profileImage: true },
    });

    const enrichedMessage = { ...message, sender };

    await this.prisma.chatRoom.update({
      where: { id: roomId },
      data: { updatedAt: new Date() },
    });

    return enrichedMessage;
  }

  async leaveRoom(roomId: string, userId: string) {
    await this.verifyMembership(roomId, userId);

    await this.prisma.chatRoomMember.delete({
      where: { chatRoomId_userId: { chatRoomId: roomId, userId } },
    });

    // 남은 멤버가 없으면 채팅방과 메시지 삭제
    const remaining = await this.prisma.chatRoomMember.count({
      where: { chatRoomId: roomId },
    });

    if (remaining === 0) {
      await this.prisma.chatMessage.deleteMany({ where: { chatRoomId: roomId } });
      await this.prisma.chatRoom.delete({ where: { id: roomId } });
    }
  }

  async markAsRead(roomId: string, userId: string) {
    await this.prisma.chatRoomMember.updateMany({
      where: { chatRoomId: roomId, userId },
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
