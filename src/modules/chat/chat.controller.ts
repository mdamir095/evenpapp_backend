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
import { StartChatDto } from './dto/start-chat.dto';

@ApiTags('Chat')
@Controller('chat')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post('start')
  @ApiOperation({ summary: 'Start a new chat session' })
  @ApiBody({ type: StartChatDto })
  @ApiResponse({
    status: 201,
    description: 'New chat session started successfully',
    schema: {
      type: 'object',
      properties: {
        chatId: { type: 'string', example: 'chat_1234567890_abc12345' },
      },
    },
  })
  async startChatSession(@Req() req: any, @Body() startChatDto: StartChatDto) {
    const senderId: string = String(req?.user?.id || req?.user?._id || req?.user?.sub);
    return await this.chatService.startChatSession(senderId, startChatDto.receiverId);
  }

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
  @ApiOperation({ summary: 'Get all messages for the current active chat session' })
  @ApiQuery({ name: 'chatId', required: true, type: String, description: 'Current active chat session ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 50 })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully (only for current active chat session)',
  })
  async getMessages(
    @Req() req: any,
    @Query('chatId') chatId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    const userId: string = String(req?.user?.id || req?.user?._id || req?.user?.sub);
    return await this.chatService.getMessages(userId, chatId, page, limit);
  }

  @Get('unread')
  @ApiOperation({ summary: 'Get unread messages for the current active chat session' })
  @ApiQuery({ name: 'chatId', required: true, type: String, description: 'Current active chat session ID' })
  @ApiResponse({
    status: 200,
    description: 'Unread messages retrieved successfully (only for current active chat session)',
  })
  async getUnreadMessages(@Req() req: any, @Query('chatId') chatId: string) {
    const userId: string = String(req?.user?.id || req?.user?._id || req?.user?.sub);
    return await this.chatService.getUnreadMessages(userId, chatId);
  }

  @Put('message/:id/read')
  @ApiOperation({ summary: 'Mark a message as read' })
  @ApiParam({ name: 'id', description: 'Message ID' })
  @ApiQuery({ name: 'chatId', required: false, type: String, description: 'Current active chat session ID (optional but recommended)' })
  @ApiResponse({
    status: 200,
    description: 'Message marked as read',
    type: MessageResponseDto,
  })
  async markAsRead(@Req() req: any, @Param('id') id: string, @Query('chatId') chatId?: string) {
    const userId: string = String(req?.user?.id || req?.user?._id || req?.user?.sub);
    return await this.chatService.markAsRead(id, userId, chatId);
  }

  @Put('read-all')
  @ApiOperation({ summary: 'Mark all messages as read for the current active chat session' })
  @ApiQuery({ name: 'chatId', required: true, type: String, description: 'Current active chat session ID' })
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
  async markAllAsRead(@Req() req: any, @Query('chatId') chatId: string) {
    const userId: string = String(req?.user?.id || req?.user?._id || req?.user?.sub);
    return await this.chatService.markAllAsRead(userId, chatId);
  }
}


