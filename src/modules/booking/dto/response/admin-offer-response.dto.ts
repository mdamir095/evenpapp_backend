import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { AdminOfferStatus } from '../../entities/admin-offer.entity';

export class AdminOfferResponseDto {
  @ApiProperty({ description: 'MongoDB ObjectId of the offer' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Booking ID this offer is for' })
  @Expose()
  bookingId: string;

  @ApiProperty({ description: 'Admin/Enterprise user ID who submitted the offer' })
  @Expose()
  user_id: string;

  @ApiProperty({ description: 'Offer amount' })
  @Expose()
  offer_amount: number;

  @ApiProperty({ description: 'Extra services included in the offer', type: [String], required: false })
  @Expose()
  extra_services?: string[];

  @ApiProperty({ description: 'Status of the offer', enum: AdminOfferStatus })
  @Expose()
  status: AdminOfferStatus;

  @ApiProperty({ description: 'Additional notes', required: false })
  @Expose()
  notes?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @Expose()
  updatedAt: Date;
}

