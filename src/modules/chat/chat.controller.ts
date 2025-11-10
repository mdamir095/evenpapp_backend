import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiParam,
  ApiBody,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { ChatService } from './chat.service';
import { CreateMessageDto } from './dto/create-message.dto';
import { ReplyMessageDto } from './dto/reply-message.dto';
import { MessageResponseDto } from './dto/message-response.dto';

@ApiTags('Chat')
@Controller('chat')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('message')
  @ApiOperation({ summary: 'Send a message' })
  @ApiBody({ type: CreateMessageDto })
  @ApiResponse({
    status: 201,
    description: 'Message sent successfully',
    type: MessageResponseDto,
  })
  async sendMessage(@Req() req: any, @Body() createMessageDto: CreateMessageDto) {
    const senderId: string = String(req?.user?.id || req?.user?._id || req?.user?.sub);
    return await this.chatService.createMessage(senderId, createMessageDto);
  }

  @Post('reply')
  @ApiOperation({ summary: 'Reply to a message' })
  @ApiBody({ type: ReplyMessageDto })
  @ApiResponse({
    status: 201,
    description: 'Reply sent successfully',
    type: MessageResponseDto,
  })
  async replyToMessage(@Req() req: any, @Body() replyDto: ReplyMessageDto) {
    const senderId: string = String(req?.user?.id || req?.user?._id || req?.user?.sub);
    return await this.chatService.replyToMessage(senderId, replyDto);
  }

  @Get('messages')
  @ApiOperation({ summary: 'Get messages (optionally filter by user)' })
  @ApiQuery({ name: 'otherUserId', required: false, type: String, description: 'Filter messages with specific user' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 50 })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
  })
  async getMessages(
    @Req() req: any,
    @Query('otherUserId') otherUserId?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    const userId: string = String(req?.user?.id || req?.user?._id || req?.user?.sub);
    return await this.chatService.getMessages(userId, otherUserId, page, limit);
  }

  @Get('unread')
  @ApiOperation({ summary: 'Get unread messages' })
  @ApiResponse({
    status: 200,
    description: 'Unread messages retrieved successfully',
  })
  async getUnreadMessages(@Req() req: any) {
    const userId: string = String(req?.user?.id || req?.user?._id || req?.user?.sub);
    return await this.chatService.getUnreadMessages(userId);
  }

  @Get('conversations')
  @ApiOperation({ summary: 'Get all conversations for the current user' })
  @ApiResponse({
    status: 200,
    description: 'Conversations retrieved successfully',
  })
  async getConversations(@Req() req: any) {
    const userId: string = String(req?.user?.id || req?.user?._id || req?.user?.sub);
    return await this.chatService.getConversations(userId);
  }

  @Put('message/:id/read')
  @ApiOperation({ summary: 'Mark a message as read' })
  @ApiParam({ name: 'id', description: 'Message ID' })
  @ApiResponse({
    status: 200,
    description: 'Message marked as read',
    type: MessageResponseDto,
  })
  async markAsRead(@Req() req: any, @Param('id') id: string) {
    const userId: string = String(req?.user?.id || req?.user?._id || req?.user?.sub);
    return await this.chatService.markAsRead(id, userId);
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Mark all messages as read (optionally from a specific sender)' })
  @ApiQuery({ name: 'senderId', required: false, type: String, description: 'Mark messages from specific sender as read' })
  @ApiResponse({
    status: 200,
    description: 'Messages marked as read',
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', example: 5 },
      },
    },
  })
  async markAllAsRead(@Req() req: any, @Query('senderId') senderId?: string) {
    const userId: string = String(req?.user?.id || req?.user?._id || req?.user?.sub);
    return await this.chatService.markAllAsRead(userId, senderId);
  }
}


