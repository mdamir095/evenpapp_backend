import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpStatus, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth, ApiBody } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { CreateNotificationDto } from './dto/request/create-notification.dto';
import { UpdateNotificationDto } from './dto/request/update-notification.dto';
import { NotificationResponseDto } from './dto/response/notification-response.dto';
import { NotificationPaginatedResponseDto } from './dto/response/notification-paginated.dto';
import { NotificationGroupedResponseDto } from './dto/response/notification-grouped.dto';
import { NotificationPaginationDto } from './dto/request/notification-pagination.dto';

@ApiTags('Notifications')
@Controller('notifications')
@UsePipes(new ValidationPipe({ transform: true }))
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  @Post()
  @ApiOperation({ summary: 'Create a notification' })
  @ApiBody({ type: CreateNotificationDto })
  @ApiResponse({ status: HttpStatus.CREATED, type: NotificationResponseDto })
  create(@Body() dto: CreateNotificationDto): Promise<NotificationResponseDto> {
    return this.notificationService.create(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List notifications with pagination' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({ status: HttpStatus.OK, type: NotificationPaginatedResponseDto })
  findAll(@Query() pagination: NotificationPaginationDto): Promise<NotificationPaginatedResponseDto> {
    return this.notificationService.findAll(pagination);
  }

  @Get('grouped')
  @ApiOperation({ summary: 'List notifications grouped by date (Today/Yesterday/yyyy-mm-dd)' })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, example: 10 })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'status', required: false, type: String })
  @ApiResponse({ status: HttpStatus.OK, type: NotificationGroupedResponseDto })
  findAllGrouped(@Query() pagination: NotificationPaginationDto): Promise<NotificationGroupedResponseDto> {
    return this.notificationService.findAllGrouped(pagination);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get notification by ID' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: HttpStatus.OK, type: NotificationResponseDto })
  findOne(@Param('id') id: string): Promise<NotificationResponseDto> {
    return this.notificationService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: HttpStatus.OK, type: NotificationResponseDto })
  update(@Param('id') id: string, @Body() dto: UpdateNotificationDto): Promise<NotificationResponseDto> {
    return this.notificationService.update(id, dto);
  }

  @Patch(':id/mark-sent')
  @ApiOperation({ summary: 'Mark a notification as sent' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  markAsSent(@Param('id') id: string): Promise<NotificationResponseDto> {
    return this.notificationService.markAsSent(id);
  }

  @Patch(':id/mark-failed')
  @ApiOperation({ summary: 'Mark a notification as failed' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  markAsFailed(@Param('id') id: string): Promise<NotificationResponseDto> {
    return this.notificationService.markAsFailed(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  @ApiParam({ name: 'id', description: 'Notification ID' })
  @ApiResponse({ status: HttpStatus.OK })
  remove(@Param('id') id: string): Promise<{ message: string }> {
    return this.notificationService.remove(id);
  }
}

