import { IsString, IsNotEmpty, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({
    example: 'user123',
    description: 'ID of the user receiving the message',
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


