import { ApiProperty } from '@nestjs/swagger';
import { OfferStatus } from '@shared/enums/offerStatus';
import { OfferType } from '@shared/enums/offerType';
import { Expose, Transform } from 'class-transformer';

export class OfferResponseDto {
  @ApiProperty({ description: 'MongoDB ObjectId' })
  @Expose()
  @Transform(({ obj }) => obj.id?.toString())
  id: string;

  @ApiProperty({ description: 'Offer title' })
  @Expose()
  title: string;

  @ApiProperty({ description: 'Offer description', required: false })
  @Expose()
  description?: string;

  @ApiProperty({ enum: OfferType })
  @Expose()
  type: OfferType;

  @ApiProperty({ description: 'Discount value (percentage or fixed amount)' })
  @Expose()
  discountValue: number;

  @ApiProperty({ description: 'Offer start date' })
  @Expose()
  startDate: Date;

  @ApiProperty({ description: 'Offer end date' })
  @Expose()
  endDate: Date;

  @ApiProperty({ enum: OfferStatus })
  @Expose()
  status: OfferStatus;

  @ApiProperty({ description: 'Optional coupon code', required: false })
  @Expose()
  couponCode?: string;

  @ApiProperty({ description: 'Maximum usage limit overall', required: false })
  @Expose()
  usageLimit?: number;

  @ApiProperty({ description: 'Current usage count' })
  @Expose()
  usageCount: number;

  @ApiProperty({ description: 'Optional image URL', required: false })
  @Expose()
  imageUrl?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @Expose()
  updatedAt: Date;

  @ApiProperty({ description: 'Created by user' })
  @Expose()
  createdBy: string;

  @ApiProperty({ description: 'Last updated by user' })
  @Expose()
  updatedBy: string;

  @ApiProperty({ description: 'Whether the offer is active' })
  @Expose()
  isActive: boolean;

  @ApiProperty({ description: 'Whether the offer is deleted' })
  @Expose()
  isDeleted: boolean;
}

