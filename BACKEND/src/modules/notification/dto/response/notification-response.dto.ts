import { ApiProperty } from '@nestjs/swagger';
import { NotificationStatus } from '@shared/enums/notificationStatus';
import { Expose, Transform } from 'class-transformer';
export class NotificationResponseDto {
  @ApiProperty({ description: 'MongoDB ObjectId' })
  @Expose()
  @Transform(({ obj }) => obj.id?.toString())
  id: string;

  @ApiProperty()
  @Expose()
  title: string;

  @ApiProperty()
  @Expose()
  message: string;

  @ApiProperty({ required: false })
  @Expose()
  recipientId?: string;

  @ApiProperty({ required: false })
  @Expose()
  recipientEmail?: string;

  @ApiProperty({ required: false })
  @Expose()
  recipientPhone?: string;

  @ApiProperty({ enum: NotificationStatus })
  @Expose()
  status: NotificationStatus;

  @ApiProperty()
  @Expose()
  createdAt: Date;

  @ApiProperty()
  @Expose()
  updatedAt: Date;
}

