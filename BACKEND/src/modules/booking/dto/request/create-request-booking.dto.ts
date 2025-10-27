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

export class CreateRequestBookingDto {
  @ApiProperty({ enum: BookingType, enumName: 'BookingType' })
  @IsEnum(BookingType)
  @IsNotEmpty()
  bookingType: BookingType;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  eventHall: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  venueId?: string;


  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  eventDate: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDateString()
  endDate: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  endTime: string;

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

