import {
  IsInt,
  Max,
  Min,
  IsString,
  IsOptional,
  IsNotEmpty,
  IsMongoId,
  IsEnum,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

enum EntityType {
  VENDOR = 'vendor',
  VENUE = 'venue',
}

export class CreateRatingDto {
  @IsNotEmpty()
  @ApiProperty({
    description: 'ID of the booking that validates this rating',
    example: 'BK-12138',
  })
  bookingId: string;

  @IsMongoId()
  @IsNotEmpty()
  @ApiProperty({
    description: 'ID of the entity (vendor or venue) being rated',
    example: '60d0fe4f53c113001f2f0001',
  })
  entityId: string;

  @IsEnum(EntityType)
  @IsNotEmpty()
  @ApiProperty({
    description: 'Type of the entity (vendor or venue)',
    enum: EntityType,
    example: EntityType.VENDOR,
  })
  entityType: EntityType;

  @IsInt()
  @Min(1)
  @Max(5)
  @ApiProperty({ description: 'Rating score between 1 and 5', example: 5 })
  score: number;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Optional review message',
    example: 'Excellent service!',
    required: false,
  })
  review?: string;
}