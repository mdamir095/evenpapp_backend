import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class AcceptBookingResponseDto {
  @ApiProperty({ description: 'MongoDB ObjectId of the booking' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Unique booking ID' })
  @Expose()
  bookingId: string;

  @ApiProperty({ description: 'Current booking status' })
  @Expose()
  bookingStatus: string;

  @ApiProperty({ description: 'Additional notes for acceptance', required: false })
  @Expose()
  notes?: string;

  @ApiProperty({ description: 'Last update timestamp' })
  @Expose()
  updatedAt: Date;
}

