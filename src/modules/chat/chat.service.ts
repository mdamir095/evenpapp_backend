import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MongoRepository } from 'typeorm';
import { Message } from './entity/message.entity';
import { CreateMessageDto } from './dto/create-message.dto';
import { ReplyMessageDto } from './dto/reply-message.dto';
import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import { UserService } from '@modules/user/user.service';
import { BookingService } from '@modules/booking/booking.service';
import { Venue } from '@modules/venue/entity/venue.entity';
import { Vendor } from '@modules/vendor/entity/vendor.entity';

@Injectable()
export class ChatService {
  constructor(
    @InjectRepository(Message, 'mongo')
    private readonly messageRepo: MongoRepository<Message>,
    @InjectRepository(Venue, 'mongo')
    private readonly venueRepo: MongoRepository<Venue>,
    @InjectRepository(Vendor, 'mongo')
    private readonly vendorRepo: MongoRepository<Vendor>,
    private readonly userService: UserService,
    private readonly bookingService: BookingService,
  ) {}

  async createMessage(authenticatedUserId: string, createMessageDto: CreateMessageDto): Promise<Message> {
    // Verify booking exists and user has access
    const booking = await this.bookingService.findByBookingId(createMessageDto.bookingId, authenticatedUserId);
    if (!booking) {
      throw new NotFoundException('Booking not found or you do not have access');
    }

    // Validate senderId matches authenticated user
    if (createMessageDto.senderId !== authenticatedUserId) {
      throw new BadRequestException('senderId must match the authenticated user');
    }

    // Validate senderId is the booking owner
    if (createMessageDto.senderId !== booking.userId) {
      throw new BadRequestException('Only the booking owner can send messages');
    }

    // Get receiverId (admin ID) from vendor/venue enterprise
    let receiverId = createMessageDto.receiverId;
    
    // If receiverId is not provided or needs validation, get admin ID from vendor/venue
    if (!receiverId || receiverId === booking.venueId) {
      // Get vendor/venue to find enterprise admin
      const venueId = typeof booking.venueId === 'string' 
        ? new ObjectId(booking.venueId) 
        : booking.venueId;
      
      let venueOrVendor = await this.venueRepo.findOne({ 
        where: { _id: venueId, isDeleted: false } as any 
      } as any);
      
      if (!venueOrVendor) {
        venueOrVendor = await this.vendorRepo.findOne({ 
          where: { _id: venueId, isDeleted: false } as any 
        } as any);
      }

      if (venueOrVendor && (venueOrVendor as any).enterpriseId) {
        // Find enterprise admin user
        const adminUsers = await this.userService['userRepository'].find({
          where: {
            enterpriseId: (venueOrVendor as any).enterpriseId,
            isEnterpriseAdmin: true,
            isDeleted: false,
          } as any,
        });

        if (adminUsers && adminUsers.length > 0) {
          const adminUser = adminUsers[0];
          receiverId = String((adminUser as any).id || (adminUser as any)._id || adminUser);
        } else {
          // Fallback to venueId if no admin found
          receiverId = booking.venueId;
        }
      } else {
        // Fallback to venueId if no enterprise found
        receiverId = booking.venueId;
      }
    }


    // Get or create chatId for this booking
    // Check if there's an existing active chat for this booking
    const existingMessage = await this.messageRepo.findOne({
      where: { bookingId: createMessageDto.bookingId, isDeleted: false } as any,
      order: { createdAt: 'DESC' as any },
    });

    let chatId: string;
    if (existingMessage) {
      chatId = existingMessage.chatId;
    } else {
      // Generate new chatId if no existing chat
      chatId = `chat_${Date.now()}_${uuidv4().substring(0, 8)}`;
    }

    const message = this.messageRepo.create({
      senderId: createMessageDto.senderId,
      receiverId: receiverId,
      chatId,
      bookingId: createMessageDto.bookingId,
      message: createMessageDto.message,
      messageType: createMessageDto.messageType || 'text',
      attachmentUrl: createMessageDto.attachmentUrl,
      isRead: false,
      isDeleted: false,
    });

    const savedMessage = await this.messageRepo.save(message);
    
    // Return message with userId, bookingId, and senderId
    return {
      ...savedMessage,
      userId: booking.userId,
      bookingId: savedMessage.bookingId,
      senderId: savedMessage.senderId,
    } as any;
  }

  async replyToMessage(authenticatedUserId: string, replyDto: ReplyMessageDto): Promise<Message> {
    // Verify booking exists
    const booking = await this.bookingService.findByBookingId(replyDto.bookingId, authenticatedUserId);
    if (!booking) {
      throw new NotFoundException('Booking not found or you do not have access');
    }

    // Validate senderId matches authenticated user
    if (replyDto.senderId !== authenticatedUserId) {
      throw new BadRequestException('senderId must match the authenticated user');
    }

    // Validate receiverId is the booking user
    if (replyDto.receiverId !== booking.userId) {
      throw new BadRequestException('receiverId must be the booking owner');
    }

    // Validate senderId is admin (not the booking user)
    if (replyDto.senderId === booking.userId) {
      throw new BadRequestException('Only admin/vendor can reply. Users should use the send message endpoint.');
    }

    // Find the original message
    const originalMessage = await this.messageRepo.findOne({
      where: { _id: new ObjectId(replyDto.messageId), bookingId: replyDto.bookingId, isDeleted: false } as any,
    });

    if (!originalMessage) {
      throw new NotFoundException('Original message not found');
    }

    // Create reply message - use same chatId and bookingId as original message
    const replyMessage = this.messageRepo.create({
      senderId: replyDto.senderId, // Admin ID
      receiverId: replyDto.receiverId, // User ID (booking owner)
      chatId: originalMessage.chatId,
      bookingId: replyDto.bookingId,
      message: replyDto.message,
      messageType: replyDto.messageType || 'text',
      attachmentUrl: replyDto.attachmentUrl,
      isRead: false,
      isDeleted: false,
    });

    const savedReply = await this.messageRepo.save(replyMessage);
    
    // Return message with userId, bookingId, and senderId
    return {
      ...savedReply,
      userId: booking.userId,
      bookingId: savedReply.bookingId,
      senderId: savedReply.senderId,
    } as any;
  }

  /**
   * Get all messages for a booking
   * Returns formatted response with sender details
   */
  async getMessages(userId: string, bookingId: string, page: number = 1, limit: number = 50): Promise<{ 
    data: Array<{
      text: string;
      isUser: boolean;
      senderName: string;
      avatarUrl: string | null;
      date: string;
      userId: string;
      bookingId: string;
      senderId: string;
      receiverId: string;
    }>; 
    total: number; 
    page: number; 
    limit: number 
  }> {
    // Verify booking exists and user has access
    const booking = await this.bookingService.findByBookingId(bookingId, userId);
    if (!booking) {
      throw new NotFoundException('Booking not found or you do not have access');
    }

    // Get all messages for this booking
    const where: any = {
      bookingId,
      isDeleted: false,
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
        // isUser = true if sender is the booking user, false if sender is vendor/admin
        const isUser = message.senderId === booking.userId;

        // Get sender details
        let senderName = 'Unknown';
        let avatarUrl: string | null = null;

        try {
          if (isUser) {
            // Sender is the user who made the booking
            const sender = await this.userService.findById(message.senderId);
            if (sender) {
              senderName = `${sender.firstName || ''} ${sender.lastName || ''}`.trim() || 'Unknown';
              avatarUrl = sender.profileImage || null;
            }
          } else {
            // Sender is vendor/admin - use vendor/venue name
            // For now, we'll use a default name, or we can get vendor details
            senderName = 'Admin'; // Or get from vendor/venue entity
            avatarUrl = null; // Or get vendor/venue image
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
          userId: booking.userId,
          bookingId: message.bookingId,
          senderId: message.senderId,
          receiverId: message.receiverId,
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

}


