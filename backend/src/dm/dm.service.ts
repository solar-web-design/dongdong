import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendDmDto } from './dto/send-dm.dto';
import { QueryDmDto } from './dto/query-dm.dto';

@Injectable()
export class DmService {
  constructor(private prisma: PrismaService) {}

  async getConversations(userId: string) {
    // Get all unique conversation partners
    const sent = await this.prisma.directMessage.findMany({
      where: { senderId: userId },
      select: { receiverId: true },
      distinct: ['receiverId'],
    });
    const received = await this.prisma.directMessage.findMany({
      where: { receiverId: userId },
      select: { senderId: true },
      distinct: ['senderId'],
    });

    const partnerIds = [
      ...new Set([
        ...sent.map((s) => s.receiverId),
        ...received.map((r) => r.senderId),
      ]),
    ];

    const conversations = await Promise.all(
      partnerIds.map(async (partnerId) => {
        const [user, lastMessage, unreadCount] = await Promise.all([
          this.prisma.user.findUnique({
            where: { id: partnerId },
            select: { id: true, name: true, profileImage: true },
          }),
          this.prisma.directMessage.findFirst({
            where: {
              OR: [
                { senderId: userId, receiverId: partnerId },
                { senderId: partnerId, receiverId: userId },
              ],
            },
            orderBy: { createdAt: 'desc' },
          }),
          this.prisma.directMessage.count({
            where: {
              senderId: partnerId,
              receiverId: userId,
              isRead: false,
            },
          }),
        ]);
        return { user, lastMessage, unreadCount };
      }),
    );

    // Sort by last message time
    conversations.sort(
      (a, b) =>
        (b.lastMessage?.createdAt.getTime() || 0) -
        (a.lastMessage?.createdAt.getTime() || 0),
    );

    return { data: conversations };
  }

  async getMessages(userId: string, partnerId: string, query: QueryDmDto) {
    await this.verifyUserExists(partnerId);

    const { cursor, limit = 50 } = query;
    const messages = await this.prisma.directMessage.findMany({
      where: {
        OR: [
          { senderId: userId, receiverId: partnerId },
          { senderId: partnerId, receiverId: userId },
        ],
        ...(cursor && { createdAt: { lt: new Date(cursor) } }),
      },
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
      include: { sender: { select: { id: true, name: true, profileImage: true } } },
    });

    const hasMore = messages.length > limit;
    const data = hasMore ? messages.slice(0, limit) : messages;

    return {
      data,
      nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
    };
  }

  async sendMessage(senderId: string, receiverId: string, dto: SendDmDto) {
    await this.verifyUserExists(receiverId);

    return this.prisma.directMessage.create({
      data: {
        content: dto.content,
        senderId,
        receiverId,
      },
    });
  }

  async markAsRead(userId: string, partnerId: string) {
    await this.prisma.directMessage.updateMany({
      where: {
        senderId: partnerId,
        receiverId: userId,
        isRead: false,
      },
      data: { isRead: true },
    });
    return { message: '읽음 처리되었습니다' };
  }

  private async verifyUserExists(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다');
    return user;
  }
}
