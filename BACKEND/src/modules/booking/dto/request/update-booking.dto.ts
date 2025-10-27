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

export class UpdateBookingDto {
  @ApiProperty({ required: false, enum: BookingType, enumName: 'BookingType' })
  @IsOptional()
  @IsEnum(BookingType)
  bookingType?: BookingType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  eventHall?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  venueId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  eventDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  startTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  endTime?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  venueAddress?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  specialRequirement?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsNumber()
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

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bookingStatus?: string;
}
