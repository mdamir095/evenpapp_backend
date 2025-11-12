import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class RejectBookingResponseDto {
  @ApiProperty({ description: 'MongoDB ObjectId of the booking' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Unique booking ID' })
  @Expose()
  bookingId: string;

  @ApiProperty({ description: 'Current booking status' })
  @Expose()
  bookingStatus: string;

  @ApiProperty({ description: 'Reason for rejection' })
  @Expose()
  rejectionReason: string;

  @ApiProperty({ description: 'Additional notes for rejection', required: false })
  @Expose()
  notes?: string;

  @ApiProperty({ description: 'Date when booking was rejected' })
  @Expose()
  rejectionDate: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @Expose()
  updatedAt: Date;
}

