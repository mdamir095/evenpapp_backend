import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UpdateFcmTokenResponseDto {
  @ApiProperty({ description: 'MongoDB ObjectId of the user' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'User email' })
  @Expose()
  email: string;

  @ApiProperty({ description: 'Updated FCM token' })
  @Expose()
  fcmToken: string;

  @ApiProperty({ description: 'Update timestamp' })
  @Expose()
  updatedAt: Date;

  @ApiProperty({ description: 'Success message' })
  @Expose()
  message: string;
}
