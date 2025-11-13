import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { OfferStatus } from '../../entities/vendor-offer.entity';

export class ExtraServiceResponseDto {
  @ApiProperty({ description: 'Name of the extra service' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'Description of the extra service', required: false })
  @Expose()
  description?: string;

  @ApiProperty({ description: 'Price of the extra service', required: false })
  @Expose()
  price?: number;
}

export class VendorOfferResponseDto {
  @ApiProperty({ description: 'MongoDB ObjectId of the offer' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'Booking ID this offer is for' })
  @Expose()
  bookingId: string;

  @ApiProperty({ description: 'Vendor ID who submitted the offer' })
  @Expose()
  vendor_id: string;

  @ApiProperty({ description: 'Vendor name who submitted the offer', required: false })
  @Expose()
  vendor_name?: string;

  @ApiProperty({ description: 'User ID who added/submitted this offer', required: false })
  @Expose()
  offerAddedBy?: string;

  @ApiProperty({ description: 'Offer amount' })
  @Expose()
  amount: number;

  @ApiProperty({ description: 'Extra services included in the offer', type: [ExtraServiceResponseDto], required: false })
  @Expose()
  extra_services?: ExtraServiceResponseDto[];

  @ApiProperty({ description: 'Status of the offer', enum: OfferStatus })
  @Expose()
  status: OfferStatus;

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

export class VendorOfferListResponseDto {
  @ApiProperty({ description: 'List of vendor offers', type: [VendorOfferResponseDto] })
  @Expose()
  offers: VendorOfferResponseDto[];

  @ApiProperty({ description: 'Total number of offers' })
  @Expose()
  total: number;
}

export class AcceptOfferResponseDto {
  @ApiProperty({ description: 'Accepted offer details', type: VendorOfferResponseDto })
  @Expose()
  offer: VendorOfferResponseDto;

  @ApiProperty({ description: 'Chat ID created/activated for this booking', required: false })
  @Expose()
  chatId?: string;

  @ApiProperty({ description: 'Booking status after acceptance' })
  @Expose()
  bookingStatus: string;
}

