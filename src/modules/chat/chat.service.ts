import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Message } from './entity/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { ReplyMessageDto } from './dto/reply-message.dto';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from '@modules/user/user.service';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message, 'mongo')
    private readonly messageRepo: MongoRepository<Message>,
    private readonly userService: UserService,
  ) {}

  /**
   * Start a new chat session between two users
   * This will:
   * 1. Generate a new unique chatId
   * 2. Mark all previous messages between these users as deleted (soft delete)
   * 3. Return the new chatId
   */
  async startChatSession(senderId: string, receiverId: string): Promise<{ chatId: string }> {
    // Generate new unique chat ID
    const chatId = `chat_${Date.now()}_${uuidv4().substring(0, 8)}`;

    // Mark all previous messages between these users as deleted (soft delete)
    // This ensures previous chat history is ignored
    await this.messageRepo.update(
      {
        $or: [
          { senderId, receiverId, isDeleted: false },
          { senderId: receiverId, receiverId: senderId, isDeleted: false },
        ],
      } as any,
      { isDeleted: true },
    );

    return { chatId };
  }

  async createMessage(senderId: string, createMessageDto: CreateMessageDto): Promise<Message> {
    // Verify chatId exists and is valid
    if (!createMessageDto.chatId || !createMessageDto.chatId.startsWith('chat_')) {
      throw new BadRequestException('Invalid chatId. Please start a new chat session first.');
    }

    const message = this.messageRepo.create({
      senderId,
      receiverId: createMessageDto.receiverId,
      chatId: createMessageDto.chatId,
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

    // Verify chatId matches the original message's chatId
    if (replyDto.chatId !== originalMessage.chatId) {
      throw new BadRequestException('chatId does not match the original message. Replies must be in the same chat session.');
    }

    // Create reply message - receiver is the original sender, use same chatId
    const replyMessage = this.messageRepo.create({
      senderId,
      receiverId: originalMessage.senderId,
      chatId: originalMessage.chatId, // Use same chatId as original message
      message: replyDto.message,
      messageType: replyDto.messageType || 'text',
      attachmentUrl: replyDto.attachmentUrl,
      isRead: false,
      isDeleted: false,
    });

    return await this.messageRepo.save(replyMessage);
  }

  /**
   * Get all messages for the current active chat session
   * Only returns messages for the specified chatId (current session)
   * Previous chat sessions are ignored
   * Returns formatted response with sender details
   */
  async getMessages(userId: string, chatId: string, page: number = 1, limit: number = 50): Promise<{ 
    data: Array<{
      text: string;
      isUser: boolean;
      senderName: string;
      avatarUrl: string | null;
      date: string;
    }>; 
    total: number; 
    page: number; 
    limit: number 
  }> {
    if (!chatId) {
      throw new BadRequestException('chatId is required. Please start a chat session first.');
    }

    // Only get messages for the current active chat session
    const where: any = {
      chatId,
      isDeleted: false,
      $or: [
        { senderId: userId },
        { receiverId: userId },
      ],
    };

    const [messages, total] = await this.messageRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'ASC' as any }, // ASC to show messages in chronological order
    });

    // Format messages with sender details
    const formattedMessages = await Promise.all(
      messages.map(async (message) => {
        // Determine if current user sent this message
        const isUser = message.senderId === userId;

        // Get sender details
        let senderName = 'Unknown';
        let avatarUrl: string | null = null;

        try {
          const sender = await this.userService.findById(message.senderId);
          if (sender) {
            senderName = `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || 'Unknown';
            avatarUrl = sender.profileImage || null;
          }
        } catch (error) {
          // If user not found, use default values
        }

        // Format date as "YYYY-MM-DD HH:mm:ss"
        const date = new Date(message.createdAt);
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        return {
          text: message.message,
          isUser,
          senderName,
          avatarUrl,
          date: formattedDate,
        };
      })
    );

    return {
      data: formattedMessages,
      total,
      page,
      limit,
    };
  }

  /**
   * Get unread messages for the current active chat session only
   */
  async getUnreadMessages(userId: string, chatId: string): Promise<Message[]> {
    if (!chatId) {
      throw new BadRequestException('chatId is required. Please start a chat session first.');
    }

    return await this.messageRepo.find({
      where: {
        receiverId: userId,
        chatId,
        isRead: false,
        isDeleted: false,
      } as any,
      order: { createdAt: 'ASC' as any },
    });
  }

  /**
   * Mark a specific message as read (must be in the current active chat session)
   */
  async markAsRead(messageId: string, userId: string, chatId?: string): Promise<Message> {
    const where: any = {
      _id: new ObjectId(messageId),
      receiverId: userId,
      isDeleted: false,
    };

    // If chatId is provided, verify the message belongs to the current chat session
    if (chatId) {
      where.chatId = chatId;
    }

    const message = await this.messageRepo.findOne({ where } as any);

    if (!message) {
      throw new NotFoundException('Message not found or does not belong to the current chat session');
    }

    message.isRead = true;
    message.readAt = new Date();

    return await this.messageRepo.save(message);
  }

  /**
   * Mark all messages as read for the current active chat session
   */
  async markAllAsRead(userId: string, chatId: string): Promise<{ count: number }> {
    if (!chatId) {
      throw new BadRequestException('chatId is required. Please start a chat session first.');
    }

    const where: any = {
      receiverId: userId,
      chatId,
      isRead: false,
      isDeleted: false,
    };

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
}


