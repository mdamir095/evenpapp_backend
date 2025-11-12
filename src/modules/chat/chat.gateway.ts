import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';

@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private connectedUsers: Map<string, string> = new Map(); // socketId -> userId

  constructor(
    private readonly chatService: ChatService,
    private readonly jwtService: JwtService,
  ) {}

  async handleConnection(client: Socket) {
    try {
      // Extract token from handshake auth or query
      const token = client.handshake.auth?.token || client.handshake.query?.token;
      
      if (!token) {
        client.disconnect();
        return;
      }

      // Verify JWT token
      const payload = this.jwtService.verify(token as string);
      const userId = payload.id || payload.sub || payload._id;

      if (!userId) {
        client.disconnect();
        return;
      }

      // Store user connection
      this.connectedUsers.set(client.id, userId);
      client.data.userId = userId;

      // Join user's personal room
      client.join(`user_${userId}`);

      // Notify user is online
      client.broadcast.emit('userOnline', { userId });
    } catch (error) {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const userId = client.data.userId;
    if (userId) {
      this.connectedUsers.delete(client.id);
      client.broadcast.emit('userOffline', { userId });
    }
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() createMessageDto: CreateMessageDto,
    @ConnectedSocket() client: Socket,
  ) {
    try {
      const senderId = client.data.userId;
      
      if (!senderId) {
        return { error: 'Unauthorized' };
      }

      // Create message in database
      const message = await this.chatService.createMessage(senderId, createMessageDto);

      // Emit to receiver if online (using receiverId from message)
      this.server.to(`user_${message.receiverId}`).emit('newMessage', {
        id: message.id,
        senderId: message.senderId,
        receiverId: message.receiverId,
        bookingId: message.bookingId,
        message: message.message,
        messageType: message.messageType,
        attachmentUrl: message.attachmentUrl,
        createdAt: message.createdAt,
        isRead: message.isRead,
      });

      // Confirm to sender
      return {
        success: true,
        message: {
          id: message.id,
          senderId: message.senderId,
          receiverId: message.receiverId,
          bookingId: message.bookingId,
          message: message.message,
          messageType: message.messageType,
          attachmentUrl: message.attachmentUrl,
          createdAt: message.createdAt,
          isRead: message.isRead,
        },
      };
    } catch (error) {
      return { error: error.message };
    }
  }

  @SubscribeMessage('typing')
  async handleTyping(
    @MessageBody() data: { receiverId: string; isTyping: boolean },
    @ConnectedSocket() client: Socket,
  ) {
    const senderId = client.data.userId;
    if (senderId) {
      this.server.to(`user_${data.receiverId}`).emit('userTyping', {
        userId: senderId,
        isTyping: data.isTyping,
      });
    }
  }
}


