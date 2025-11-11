import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartChatDto {
  @ApiProperty({
    example: 'user123',
    description: 'ID of the service provider or user to start chat with',
  })
  @IsString()
  @IsNotEmpty()
  receiverId: string;
}

