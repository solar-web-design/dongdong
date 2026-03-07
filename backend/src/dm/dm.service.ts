import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendDmDto } from './dto/send-dm.dto';
import { QueryDmDto } from './dto/query-dm.dto';

@Injectable()
export class DmService {
  constructor(private prisma: PrismaService) {}

  async getReceivedLetters(userId: string, query: QueryDmDto) {
    const { cursor, limit = 20 } = query;
    const letters = await this.prisma.directMessage.findMany({
      where: {
        receiverId: userId,
        NOT: { senderId: userId },
        ...(cursor && { createdAt: { lt: new Date(cursor) } }),
      },
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, profileImage: true } },
        receiver: { select: { id: true, name: true, profileImage: true } },
      },
    });

    const hasMore = letters.length > limit;
    const data = hasMore ? letters.slice(0, limit) : letters;

    return {
      data,
      nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
    };
  }

  async getSentLetters(userId: string, query: QueryDmDto) {
    const { cursor, limit = 20 } = query;
    const letters = await this.prisma.directMessage.findMany({
      where: {
        senderId: userId,
        ...(cursor && { createdAt: { lt: new Date(cursor) } }),
      },
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, name: true, profileImage: true } },
        receiver: { select: { id: true, name: true, profileImage: true } },
      },
    });

    const hasMore = letters.length > limit;
    const data = hasMore ? letters.slice(0, limit) : letters;

    return {
      data,
      nextCursor: hasMore ? data[data.length - 1].createdAt.toISOString() : null,
    };
  }

  async getLetter(userId: string, letterId: string) {
    const letter = await this.prisma.directMessage.findUnique({
      where: { id: letterId },
      include: {
        sender: { select: { id: true, name: true, profileImage: true } },
        receiver: { select: { id: true, name: true, profileImage: true } },
      },
    });

    if (!letter) throw new NotFoundException('편지를 찾을 수 없습니다');
    if (letter.senderId !== userId && letter.receiverId !== userId) {
      throw new NotFoundException('편지를 찾을 수 없습니다');
    }

    // Mark as read if receiver is viewing
    if (letter.receiverId === userId && !letter.isRead) {
      await this.prisma.directMessage.update({
        where: { id: letterId },
        data: { isRead: true },
      });
      letter.isRead = true;
    }

    return letter;
  }

  async sendLetter(senderId: string, receiverId: string, dto: SendDmDto) {
    await this.verifyUserExists(receiverId);

    return this.prisma.directMessage.create({
      data: {
        title: dto.title,
        content: dto.content,
        senderId,
        receiverId,
      },
      include: {
        receiver: { select: { id: true, name: true, profileImage: true } },
      },
    });
  }

  async getUnreadCount(userId: string) {
    const count = await this.prisma.directMessage.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
    return { count };
  }

  async deleteLetter(userId: string, letterId: string) {
    const letter = await this.prisma.directMessage.findUnique({
      where: { id: letterId },
    });

    if (!letter) throw new NotFoundException('편지를 찾을 수 없습니다');
    if (letter.senderId !== userId && letter.receiverId !== userId) {
      throw new NotFoundException('편지를 찾을 수 없습니다');
    }

    await this.prisma.directMessage.delete({ where: { id: letterId } });
    return { message: '편지가 삭제되었습니다' };
  }

  private async verifyUserExists(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('사용자를 찾을 수 없습니다');
    return user;
  }
}
