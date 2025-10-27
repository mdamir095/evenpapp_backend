import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class CancelBookingResponseDto {
  @ApiProperty({ description: 'MongoDB ObjectId of the booking' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Unique booking ID' })
  @Expose()
  bookingId: string;

  @ApiProperty({ description: 'Current booking status' })
  @Expose()
  bookingStatus: string;

  @ApiProperty({ description: 'Reason for cancellation' })
  @Expose()
  cancellationReason: string;

  @ApiProperty({ description: 'Date when booking was cancelled' })
  @Expose()
  cancellationDate: Date;

  @ApiProperty({ description: 'Additional notes for cancellation', required: false })
  @Expose()
  notes?: string;

  @ApiProperty({ description: 'Last update timestamp' })
  @Expose()
  updatedAt: Date;
}
