import { ApiProperty } from '@nestjs/swagger';
import { OfferStatus } from '@shared/enums/offerStatus';
import { OfferType } from '@shared/enums/offerType';
import { IsDateString, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';

export class CreateOfferDto {
  @ApiProperty({ description: 'Offer title', example: 'Diwali Discount' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Offer description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: OfferType })
  @IsEnum(OfferType)
  type: OfferType;

  @ApiProperty({ description: 'Discount value (percentage or fixed amount)', example: 20 })
  @IsNumber()
  @Min(0)
  discountValue: number;

  @ApiProperty({ description: 'Offer start date', example: '2025-01-01T00:00:00.000Z' })
  @IsDateString()
  startDate: Date | string;

  @ApiProperty({ description: 'Offer end date', example: '2025-01-10T23:59:59.999Z' })
  @IsDateString()
  endDate: Date | string;

  @ApiProperty({ enum: OfferStatus, required: false, default: OfferStatus.INACTIVE })
  @IsOptional()
  @IsEnum(OfferStatus)
  status?: OfferStatus;

  @ApiProperty({ description: 'Optional coupon code for the offer', required: false })
  @IsOptional()
  @IsString()
  couponCode?: string;

  @ApiProperty({ description: 'Maximum number of times this offer can be used overall', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  usageLimit?: number;

  @ApiProperty({ description: 'Optional image URL for the offer banner/thumbnail', required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

}

