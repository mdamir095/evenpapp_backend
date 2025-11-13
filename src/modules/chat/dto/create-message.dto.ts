import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({
    example: 'BK-A9098A0F',
    description: 'Booking ID this message belongs to (optional)',
    required: false,
  })
  @IsString()
  @IsOptional()
  bookingId?: string;

  @ApiProperty({
    example: 'user123',
    description: 'Sender ID (user ID who is sending the message)',
  })
  @IsString()
  @IsNotEmpty()
  senderId: string;

  @ApiProperty({
    example: 'admin456',
    description: 'Receiver ID (admin/vendor owner ID who will receive the message)',
  })
  @IsString()
  @IsNotEmpty()
  receiverId: string;

  @ApiProperty({
    example: 'Hello, how can I help you?',
    description: 'Message content',
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


