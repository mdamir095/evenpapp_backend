import {
  IsInt,
  Max,
  Min,
  IsString,
  IsNotEmpty,
  IsMongoId,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum BookingType {
  VENDOR = 'vendor',
  VENUE = 'venue',
}

export class UserFeedbackDto {
  @IsInt()
  @Min(1)
  @Max(5)
  @ApiProperty({ 
    description: 'Rating score between 1 and 5', 
    example: 3,
    minimum: 1,
    maximum: 5
  })
  rating: number;

  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'User feedback message',
    example: 'Your feedback here',
  })
  feedback: string;

  @IsMongoId()
  @IsNotEmpty()
  @ApiProperty({
    description: 'ID of the entity (vendor or venue) being rated',
    example: '68f1f0cba1c3453199b7dcac',
  })
  id: string;

  @IsEnum(BookingType)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Type of the booking (vendor or venue)',
    enum: BookingType,
    example: BookingType.VENDOR,
  })
  bookingType: BookingType;
}
