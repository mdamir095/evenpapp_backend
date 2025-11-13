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

  async createMessage(authenticatedUserId: string, createMessageDto: CreateMessageDto): Promise<Message> {
    // Validate senderId matches authenticated user
    if (createMessageDto.senderId !== authenticatedUserId) {
      throw new BadRequestException('senderId must match the authenticated user');
    }

    // Get or create chatId for this conversation
    // Generate chatId based on sender and receiver IDs (sorted to ensure consistency)
    const participants = [createMessageDto.senderId, createMessageDto.receiverId].sort();
    const chatIdBase = `chat_${participants[0]}_${participants[1]}`;
    
    // Check if there's an existing chat between these users
    const existingMessage = await this.messageRepo.findOne({
      where: {
        $or: [
          { senderId: createMessageDto.senderId, receiverId: createMessageDto.receiverId, isDeleted: false },
          { senderId: createMessageDto.receiverId, receiverId: createMessageDto.senderId, isDeleted: false }
        ]
      } as any,
      order: { createdAt: 'DESC' as any },
    });

    let chatId: string;
    if (existingMessage) {
      chatId = existingMessage.chatId;
    } else {
      // Generate new chatId if no existing chat
      chatId = `${chatIdBase}_${Date.now()}`;
    }

    const message = this.messageRepo.create({
      senderId: createMessageDto.senderId,
      receiverId: createMessageDto.receiverId,
      chatId,
      bookingId: createMessageDto.bookingId,
      message: createMessageDto.message,
      messageType: createMessageDto.messageType || 'text',
      attachmentUrl: createMessageDto.attachmentUrl,
      isRead: false,
      isDeleted: false,
    });

    const savedMessage = await this.messageRepo.save(message);
    return Array.isArray(savedMessage) ? savedMessage[0] : savedMessage;
  }

  async replyToMessage(authenticatedUserId: string, replyDto: ReplyMessageDto): Promise<Message> {
    // Validate senderId matches authenticated user
    if (replyDto.senderId !== authenticatedUserId) {
      throw new BadRequestException('senderId must match the authenticated user');
    }

    // Find the original message
    const originalMessage = await this.messageRepo.findOne({
      where: { _id: new ObjectId(replyDto.messageId), isDeleted: false } as any,
    });

    if (!originalMessage) {
      throw new NotFoundException('Original message not found');
    }

    // Create reply message - use same chatId as original message
    const replyMessage = this.messageRepo.create({
      senderId: replyDto.senderId,
      receiverId: replyDto.receiverId,
      chatId: originalMessage.chatId,
      bookingId: replyDto.bookingId || originalMessage.bookingId,
      message: replyDto.message,
      messageType: replyDto.messageType || 'text',
      attachmentUrl: replyDto.attachmentUrl,
      isRead: false,
      isDeleted: false,
    });

    const savedReply = await this.messageRepo.save(replyMessage);
    return Array.isArray(savedReply) ? savedReply[0] : savedReply;
  }

  /**
   * Get all messages for a chat (by bookingId or chatId)
   * Returns formatted response with sender details
   */
  async getMessages(userId: string, bookingId?: string, page: number = 1, limit: number = 50, chatId?: string): Promise<{ 
    data: Array<{
      text: string;
      isUser: boolean;
      senderName: string;
      avatarUrl: string | null;
      date: string;
      senderId: string;
      receiverId: string;
      chatId: string;
      bookingId?: string;
    }>; 
    total: number; 
    page: number; 
    limit: number 
  }> {
    // Build where clause
    const where: any = {
      isDeleted: false,
    };

    if (chatId) {
      where.chatId = chatId;
    } else if (bookingId) {
      where.bookingId = bookingId;
    } else {
      // If no chatId or bookingId, get messages where user is sender or receiver
      where.$or = [
        { senderId: userId },
        { receiverId: userId }
      ];
    }

    const [messages, total] = await this.messageRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'ASC' as any },
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
          senderId: message.senderId,
          receiverId: message.receiverId,
          chatId: message.chatId,
          bookingId: message.bookingId || undefined,
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
   * Get chat session details for a booking and vendor
   * Returns chat session details/messages post offer acceptance
   */
  async getChatSession(
    userId: string,
    bookingId: string,
    vendorId: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<{
    chatId?: string;
    bookingId: string;
    vendorId: string;
    messages: Array<{
      text: string;
      isUser: boolean;
      senderName: string;
      avatarUrl: string | null;
      date: string;
      senderId: string;
      receiverId: string;
      chatId: string;
    }>;
    total: number;
    page: number;
    limit: number;
  }> {
    // Get all messages for this booking
    const where: any = {
      bookingId,
      isDeleted: false,
    };

    const [messages, total] = await this.messageRepo.findAndCount({
      where,
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'ASC' as any },
    });

    // Get chatId from first message if available
    let chatId: string | undefined;
    if (messages.length > 0) {
      chatId = messages[0].chatId;
    } else {
      // Check if there's an existing chat for this booking
      const existingMessage = await this.messageRepo.findOne({
        where: { bookingId, isDeleted: false } as any,
        order: { createdAt: 'DESC' as any },
      });
      if (existingMessage) {
        chatId = existingMessage.chatId;
      }
    }

    // Format messages with sender details
    const formattedMessages = await Promise.all(
      messages.map(async (message) => {
        const isUser = message.senderId === userId;

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
          senderId: message.senderId,
          receiverId: message.receiverId,
          chatId: message.chatId,
        };
      })
    );

    return {
      chatId,
      bookingId,
      vendorId,
      messages: formattedMessages,
      total,
      page,
      limit,
    };
  }

}


