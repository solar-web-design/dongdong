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

@WebSocketGateway({
  namespace: '/chat',
  cors: { origin: process.env.CORS_ORIGIN || 'http://localhost:3000' },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, Set<string>>();

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private chatService: ChatService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers?.authorization?.replace('Bearer ', '');

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

    const message = await this.chatService.sendMessage(
      data.roomId,
      userId,
      data.content,
      data.images,
    );

    this.server.to(data.roomId).emit('new_message', message);
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
    await this.chatService.markAsRead(data.roomId, userId);
  }
}
