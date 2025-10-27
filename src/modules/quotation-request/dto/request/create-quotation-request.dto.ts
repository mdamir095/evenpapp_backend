import { IsString, IsNotEmpty, IsNumber, IsArray, IsDateString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateQuotationRequestDto {
  @ApiProperty({
    example: 'Rooftop Terrace',
    description: 'Name of the event hall'
  })
  @IsString()
  @IsNotEmpty()
  eventHall: string;

  @ApiProperty({
    example: '2025-09-24T00:00:00.000Z',
    description: 'Start date of the event'
  })
  @IsDateString()
  @IsNotEmpty()
  eventDate: string;

  @ApiProperty({
    example: '2025-09-26T00:00:00.000Z',
    description: 'End date of the event'
  })
  @IsDateString()
  @IsNotEmpty()
  endDate: string;

  @ApiProperty({
    example: '1:26 PM',
    description: 'Start time of the event'
  })
  @IsString()
  @IsNotEmpty()
  startTime: string;

  @ApiProperty({
    example: '6:26 AM',
    description: 'End time of the event'
  })
  @IsString()
  @IsNotEmpty()
  endTime: string;

  @ApiProperty({
    example: 'Venue address',
    description: 'Address of the venue'
  })
  @IsString()
  @IsNotEmpty()
  venueAddress: string;

  @ApiProperty({
    example: 'Wedding',
    description: 'Type of photographer needed'
  })
  @IsString()
  @IsNotEmpty()
  photographerType: string;

  @ApiProperty({
    example: 'requirement',
    description: 'Special requirements for the event'
  })
  @IsString()
  @IsNotEmpty()
  specialRequirement: string;

  @ApiProperty({
    example: 247,
    description: 'Expected number of guests'
  })
  @IsNumber()
  @IsNotEmpty()
  expectedGuests: number;

  @ApiProperty({
    example: 2,
    description: 'Coverage duration in hours'
  })
  @IsNumber()
  @IsNotEmpty()
  coverageDuration: number;

  @ApiProperty({
    example: 4,
    description: 'Number of photographers needed'
  })
  @IsNumber()
  @IsNotEmpty()
  numberOfPhotographers: number;

  @ApiProperty({
    example: 3077,
    description: 'Budget range for the event'
  })
  @IsNumber()
  @IsNotEmpty()
  budgetRange: number;

  @ApiProperty({
    example: ['data:image/png;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...', 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD...'],
    description: 'Array of base64 encoded reference images',
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  referenceImages: string[];

  @ApiProperty({
    example: 'user123',
    description: 'ID of the user making the request',
    required: false
  })
  @IsString()
  @IsOptional()
  userId?: string;

  @ApiProperty({
    example: 'vendor123',
    description: 'ID of the vendor (if specific vendor is requested)',
    required: false
  })
  @IsString()
  @IsOptional()
  vendorId?: string;

  @ApiProperty({
    example: 'venue123',
    description: 'ID of the venue (if specific venue is requested)',
    required: false
  })
  @IsString()
  @IsOptional()
  venueId?: string;
}
