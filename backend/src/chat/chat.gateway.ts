import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ChatService } from './chat.service';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'], credentials: true },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Set<string>>();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private chatService: ChatService,
    private notificationsService: NotificationsService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Try auth token, authorization header, then cookie
      let token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        const cookieHeader = client.handshake.headers?.cookie;
        if (cookieHeader) {
          const match = cookieHeader.match(/(?:^|;\s*)accessToken=([^;]*)/);
          if (match) token = match[1];
        }
      }

      if (!token) {
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      client.data.userId = payload.sub;

      const sockets = this.userSockets.get(payload.sub) || new Set();
      sockets.add(client.id);
      this.userSockets.set(payload.sub, sockets);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      const sockets = this.userSockets.get(userId);
      if (sockets) {
        sockets.delete(client.id);
        if (sockets.size === 0) this.userSockets.delete(userId);
      }
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    if (!roomId || typeof roomId !== 'string') return;
    client.join(roomId);
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomId: string,
  ) {
    if (!roomId || typeof roomId !== 'string') return;
    client.leave(roomId);
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; content: string; images?: string[] },
  ) {
    const userId = client.data.userId;
    if (!userId) return;

    // Validate input: roomId and content must be non-empty strings within length limits
    if (
      !data?.roomId ||
      typeof data.roomId !== 'string' ||
      !data?.content ||
      typeof data.content !== 'string' ||
      data.content.length > 5000
    ) {
      client.emit('error', { message: '잘못된 메시지 형식입니다' });
      return;
    }

    // Validate images array if provided
    if (data.images !== undefined) {
      if (!Array.isArray(data.images) || data.images.length > 10 || data.images.some(img => typeof img !== 'string')) {
        client.emit('error', { message: '잘못된 이미지 형식입니다' });
        return;
      }
    }

    try {
      const message = await this.chatService.sendMessage(
        data.roomId,
        userId,
        data.content,
        data.images,
      );

      this.server.to(data.roomId).emit('new_message', message);

      // Create notifications for offline members
      const members = await this.prisma.chatRoomMember.findMany({
        where: { chatRoomId: data.roomId, userId: { not: userId } },
        select: { userId: true },
      });
      const senderName = message.sender?.name || '알 수 없음';
      for (const member of members) {
        if (!this.userSockets.has(member.userId)) {
          this.notificationsService.create(
            member.userId,
            'CHAT',
            `${senderName}님의 메시지`,
            data.content.length > 50 ? data.content.slice(0, 50) + '...' : data.content,
            `/chat/${data.roomId}`,
          ).catch(() => {});
        }
      }
    } catch {
      client.emit('error', { message: '메시지 전송에 실패했습니다' });
    }
  }

  notifyNewRoom(room: Record<string, unknown>, memberIds: string[]) {
    for (const memberId of memberIds) {
      const sockets = this.userSockets.get(memberId);
      if (sockets) {
        for (const socketId of sockets) {
          this.server.to(socketId).emit('new_room', room);
        }
      }
    }
  }

  broadcastPostDeleted(postId: string) {
    this.server.emit('post_deleted', { postId });
  }

  broadcastPostCreated(postId: string) {
    this.server.emit('post_created', { postId });
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const userId = client.data.userId;
    if (!userId || !data?.roomId || typeof data.roomId !== 'string') return;
    client.to(data.roomId).emit('typing', { roomId: data.roomId, userId });
  }

  @SubscribeMessage('read_messages')
  async handleReadMessages(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const userId = client.data.userId;
    if (!userId || !data?.roomId || typeof data.roomId !== 'string') return;
    try {
      await this.chatService.markAsRead(data.roomId, userId);
    } catch {
      // Ignore - user may not be a member
    }
  }
}
