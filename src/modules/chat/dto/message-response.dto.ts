import { ApiProperty } from '@nestjs/swagger';

export class MessageResponseDto {
  @ApiProperty({
    example: '68da132472afd241781ce658',
    description: 'Message ID',
  })
  id: string;

  @ApiProperty({
    example: 'user123',
    description: 'ID of the user who sent the message',
  })
  senderId: string;

  @ApiProperty({
    example: 'user456',
    description: 'ID of the user who receives the message',
  })
  receiverId: string;

  @ApiProperty({
    example: 'BK-A9098A0F',
    description: 'Booking ID this message belongs to',
  })
  bookingId: string;

  @ApiProperty({
    example: 'user123',
    description: 'User ID (booking owner)',
  })
  userId: string;

  @ApiProperty({
    example: 'Hello, how can I help you?',
    description: 'Message content',
  })
  message: string;

  @ApiProperty({
    example: false,
    description: 'Whether the message has been read',
  })
  isRead: boolean;

  @ApiProperty({
    example: '2025-01-15T10:30:00.000Z',
    description: 'When the message was read',
    required: false,
  })
  readAt?: Date;

  @ApiProperty({
    example: 'text',
    description: 'Type of message',
  })
  messageType: string;

  @ApiProperty({
    example: 'https://example.com/image.png',
    description: 'URL for attachment',
    required: false,
  })
  attachmentUrl?: string;

  @ApiProperty({
    example: '2025-01-15T10:00:00.000Z',
    description: 'When the message was created',
  })
  createdAt: Date;

  @ApiProperty({
    example: '2025-01-15T10:00:00.000Z',
    description: 'When the message was last updated',
  })
  updatedAt: Date;
}


