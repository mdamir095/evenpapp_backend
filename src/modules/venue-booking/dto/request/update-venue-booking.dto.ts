import { PartialType } from '@nestjs/swagger';
import { CreateVenueBookingDto } from './create-venue-booking.dto';
import { IsOptional, IsString, IsDateString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateVenueBookingDto extends PartialType(CreateVenueBookingDto) {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  cancellationReason?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  cancellationDate?: string;
}