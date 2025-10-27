import {
  IsString,
  IsDateString,
  IsOptional,
  IsNumber,
  IsEnum,
  ValidateNested,
  IsArray
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { BookingStatus } from '@shared/enums/bookingStatus';

class PaymentDetailsDto {
  @ApiProperty()
  @IsNumber()
  amount: number;

  @ApiProperty({ default: 'INR' })
  @IsString()
  currency: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  paymentMethod?: string;

  @ApiProperty({ 
    enum: ['PENDING', 'PAID', 'FAILED', 'REFUNDED'],
    default: 'PENDING' 
  })
  @IsEnum(['PENDING', 'PAID', 'FAILED', 'REFUNDED'])
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

class AdditionalServiceDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsNumber()
  price: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateVenueBookingDto {
  @ApiProperty()
  @IsString()
  eventId: string;

  @ApiProperty()
  @IsString()
  venueId: string;

  @ApiProperty()
  @IsDateString()
  startDateTime: string;

  @ApiProperty()
  @IsDateString()
  endDateTime: string;

  @ApiProperty({ 
    enum: BookingStatus, 
    default: BookingStatus.PENDING,
    required: false 
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  bookingStatus?: BookingStatus;

  @ApiProperty({ type: PaymentDetailsDto })
  @ValidateNested()
  @Type(() => PaymentDetailsDto)
  paymentDetails: PaymentDetailsDto;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({ 
    type: [AdditionalServiceDto], 
    required: false 
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AdditionalServiceDto)
  additionalServices?: AdditionalServiceDto[];
}