import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class OfferResponseDto {
  @ApiProperty({ description: 'Offer ID', example: 'OFFER-ABC123' })
  @Expose()
  offerId: string;

  @ApiProperty({ description: 'Booking ID this offer is for', example: 'BK-7AA6B9CD' })
  @Expose()
  bookingId: string;

  @ApiProperty({ description: 'User ID who submitted the offer', example: 'USER-123456' })
  @Expose()
  userId: string;

  @ApiProperty({ description: 'User name who submitted the offer', required: false })
  @Expose()
  userName?: string;

  @ApiProperty({ description: 'User ID who added/submitted this offer', required: false })
  @Expose()
  offerAddedBy?: string;

  @ApiProperty({ description: 'Offer amount', example: 1500 })
  @Expose()
  amount: number;

  @ApiProperty({ description: 'Extra services included in the offer', type: [String], required: false })
  @Expose()
  extraServices?: string[];

  @ApiProperty({ description: 'Additional notes', required: false })
  @Expose()
  notes?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @Expose()
  createdAt: Date;
}

