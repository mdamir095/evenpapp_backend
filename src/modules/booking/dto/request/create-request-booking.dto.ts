import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  IsEnum,
} from 'class-validator';
import { BookingType } from '@shared/enums/bookingType';
import { TimeSlot } from '../../entities/booking.entity';

export class CreateRequestBookingDto {
  @ApiProperty({ enum: BookingType, enumName: 'BookingType' })
  @IsEnum(BookingType)
  @IsNotEmpty()
  bookingType: BookingType;

  @ApiProperty()
  eventHall: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  venueId?: string;


  @ApiProperty()
  @IsOptional()
  eventDate: string;

  @ApiProperty()
  @IsOptional()
  endDate: string;

  @ApiProperty()
  @IsOptional()
  startTime: string;

  @ApiProperty()
  @IsOptional()
  endTime: string;

  @ApiProperty({ required: false, enum: TimeSlot, enumName: 'TimeSlot' })
  @IsOptional()
  @IsEnum(TimeSlot)
  timeSlot?: TimeSlot;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  venueAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  specialRequirement?: string;

  @ApiProperty({ required: false, example: 200 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  expectedGuests?: number;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  photographerType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  categoryType?: string;

  @ApiProperty({ required: false, example: 2 })
  @IsOptional()
  @IsNumber()
  coverageDuration?: number;

  @ApiProperty({ required: false, example: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  numberOfPhotographers?: number;

  @ApiProperty({ required: false, example: 5000 })
  @IsOptional()
  @IsNumber()
  budgetRange?: number;

  @ApiProperty({ required: false, type: [String], example: ['data:image/png;base64,...'] })
  @IsOptional()
  @IsArray()
  referenceImages?: string[];

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  mealType?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cuisine?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  servingStyle?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  additionalService?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  foodPreference?: string;
}

