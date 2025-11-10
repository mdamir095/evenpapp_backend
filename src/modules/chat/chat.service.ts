import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Message } from './entity/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { ReplyMessageDto } from './dto/reply-message.dto';
import { ObjectId } from 'mongodb';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message, 'mongo')
    private readonly messageRepo: MongoRepository<Message>,
  ) {}

  async createMessage(senderId: string, createMessageDto: CreateMessageDto): Promise<Message> {
    const message = this.messageRepo.create({
      senderId,
      receiverId: createMessageDto.receiverId,
      message: createMessageDto.message,
      messageType: createMessageDto.messageType || 'text',
      attachmentUrl: createMessageDto.attachmentUrl,
      isRead: false,
      isDeleted: false,
    });

    return await this.messageRepo.save(message);
  }

  async replyToMessage(senderId: string, replyDto: ReplyMessageDto): Promise<Message> {
    // Find the original message
    const originalMessage = await this.messageRepo.findOne({
      where: { _id: new ObjectId(replyDto.messageId), isDeleted: false } as any,
    });

    if (!originalMessage) {
      throw new NotFoundException('Original message not found');
    }

    // Create reply message - receiver is the original sender
    const replyMessage = this.messageRepo.create({
      senderId,
      receiverId: originalMessage.senderId,
      message: replyDto.message,
      messageType: replyDto.messageType || 'text',
      attachmentUrl: replyDto.attachmentUrl,
      isRead: false,
      isDeleted: false,
    });

    return await this.messageRepo.save(replyMessage);
  }

  async getMessages(userId: string, otherUserId?: string, page: number = 1, limit: number = 50): Promise<{ data: Message[]; total: number; page: number; limit: number }> {
    const where: any = {
      isDeleted: false,
      $or: [
        { senderId: userId },
        { receiverId: userId },
      ],
    };

    // If otherUserId is provided, filter messages between these two users
    if (otherUserId) {
      where.$or = [
        { senderId: userId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: userId },
      ];
    }

    const [data, total] = await this.messageRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' as any },
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async getUnreadMessages(userId: string): Promise<Message[]> {
    return await this.messageRepo.find({
      where: {
        receiverId: userId,
        isRead: false,
        isDeleted: false,
      } as any,
      order: { createdAt: 'DESC' as any },
    });
  }

  async markAsRead(messageId: string, userId: string): Promise<Message> {
    const message = await this.messageRepo.findOne({
      where: { _id: new ObjectId(messageId), receiverId: userId, isDeleted: false } as any,
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    message.isRead = true;
    message.readAt = new Date();

    return await this.messageRepo.save(message);
  }

  async markAllAsRead(userId: string, senderId?: string): Promise<{ count: number }> {
    const where: any = {
      receiverId: userId,
      isRead: false,
      isDeleted: false,
    };

    if (senderId) {
      where.senderId = senderId;
    }

    const messages = await this.messageRepo.find({ where });
    
    if (messages.length > 0) {
      const now = new Date();
      await Promise.all(
        messages.map((msg) => {
          msg.isRead = true;
          msg.readAt = now;
          return this.messageRepo.save(msg);
        }),
      );
    }

    return { count: messages.length };
  }

  async getConversations(userId: string): Promise<any[]> {
    // Get all unique users that the current user has conversations with
    const sentMessages = await this.messageRepo.find({
      where: { senderId: userId, isDeleted: false } as any,
      select: ['receiverId'],
    });

    const receivedMessages = await this.messageRepo.find({
      where: { receiverId: userId, isDeleted: false } as any,
      select: ['senderId'],
    });

    const userIds = new Set<string>();
    sentMessages.forEach((msg) => userIds.add(msg.receiverId));
    receivedMessages.forEach((msg) => userIds.add(msg.senderId));

    // Get last message for each conversation
    const conversations = await Promise.all(
      Array.from(userIds).map(async (otherUserId) => {
        const lastMessage = await this.messageRepo.findOne({
          where: {
            isDeleted: false,
            $or: [
              { senderId: userId, receiverId: otherUserId },
              { senderId: otherUserId, receiverId: userId },
            ],
          } as any,
          order: { createdAt: 'DESC' as any },
        });

        const unreadCount = await this.messageRepo.count({
          where: {
            senderId: otherUserId,
            receiverId: userId,
            isRead: false,
            isDeleted: false,
          } as any,
        });

        return {
          userId: otherUserId,
          lastMessage: lastMessage ? {
            id: lastMessage.id,
            message: lastMessage.message,
            createdAt: lastMessage.createdAt,
            senderId: lastMessage.senderId,
          } : null,
          unreadCount,
        };
      }),
    );

    return conversations.sort((a, b) => {
      if (!a.lastMessage) return 1;
      if (!b.lastMessage) return -1;
      return new Date(b.lastMessage.createdAt).getTime() - new Date(a.lastMessage.createdAt).getTime();
    });
  }
}


