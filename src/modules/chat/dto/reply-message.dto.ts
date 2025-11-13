import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReplyMessageDto {
  @ApiProperty({
    example: '68da132472afd241781ce658',
    description: 'ID of the message being replied to',
  })
  @IsString()
  @IsNotEmpty()
  messageId: string;

  @ApiProperty({
    example: 'BK-A9098A0F',
    description: 'Booking ID this reply belongs to (optional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  bookingId?: string;

  @ApiProperty({
    example: 'admin456',
    description: 'Sender ID (admin/vendor owner ID who is replying)',
  })
  @IsString()
  @IsNotEmpty()
  senderId: string;

  @ApiProperty({
    example: 'user123',
    description: 'Receiver ID (user ID who will receive the reply)',
  })
  @IsString()
  @IsNotEmpty()
  receiverId: string;

  @ApiProperty({
    example: 'Thank you for your message!',
    description: 'Reply message content',
  })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({
    example: 'text',
    description: 'Type of message (text, image, file)',
    required: false,
    default: 'text',
  })
  @IsString()
  @IsOptional()
  messageType?: string;

  @ApiProperty({
    example: 'https://example.com/image.png',
    description: 'URL for attachment if message type is image or file',
    required: false,
  })
  @IsString()
  @IsOptional()
  attachmentUrl?: string;
}


