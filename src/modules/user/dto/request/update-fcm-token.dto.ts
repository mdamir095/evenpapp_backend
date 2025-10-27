import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateFcmTokenDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Firebase Cloud Messaging token for push notifications',
    example: 'fcm_token_example_123456789',
    required: true,
  })
  fcmToken: string;
}
