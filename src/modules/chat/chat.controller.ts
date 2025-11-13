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
  @ApiOperation({ summary: 'Get all messages for a booking' })
  @ApiQuery({ name: 'bookingId', required: true, type: String, description: 'Booking ID' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 50 })
  @ApiResponse({
    status: 200,
    description: 'Messages retrieved successfully',
  })
  async getMessages(
    @Req() req: any,
    @Query('bookingId') bookingId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    const userId: string = String(req?.user?.id || req?.user?._id || req?.user?.sub);
    return await this.chatService.getMessages(userId, bookingId, page, limit);
  }

  @Get(':bookingId/:vendorId')
  @ApiOperation({ 
    summary: 'Get chat session details for a booking and vendor',
    description: 'Returns chat session details/messages post offer acceptance for a specific booking and vendor combination'
  })
  @ApiParam({ name: 'bookingId', description: 'Booking ID', example: 'BK-A9098A0F' })
  @ApiParam({ name: 'vendorId', description: 'Vendor ID', example: '507f1f77bcf86cd799439011' })
  @ApiQuery({ name: 'page', required: false, type: Number, description: 'Page number', example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Items per page', example: 50 })
  @ApiResponse({
    status: 200,
    description: 'Chat session details retrieved successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Chat session not found',
  })
  async getChatSession(
    @Req() req: any,
    @Param('bookingId') bookingId: string,
    @Param('vendorId') vendorId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    const userId: string = String(req?.user?.id || req?.user?._id || req?.user?.sub);
    return await this.chatService.getChatSession(userId, bookingId, vendorId, page, limit);
  }
}


