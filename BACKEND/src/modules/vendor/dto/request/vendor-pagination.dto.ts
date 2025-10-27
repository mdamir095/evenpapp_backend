import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsNumber, IsString, Min, Max } from 'class-validator';

export class VendorPaginationDto {
  @ApiProperty({ 
    description: 'Page number (starts from 1)', 
    example: 1, 
    default: 1,
    minimum: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiProperty({ 
    description: 'Number of items per page', 
    example: 10, 
    default: 10,
    minimum: 1,
    maximum: 100
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiProperty({ 
    description: 'Search term to filter vendors by name or location', 
    required: false,
    example: 'photographer'
  })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiProperty({ 
    description: 'Filter by category ObjectId', 
    required: false,
    example: '507f1f77bcf86cd799439011'
  })
  @IsOptional()
  @IsString()
  categoryId?: string;

  @ApiProperty({ 
    description: 'Filter by location', 
    required: false,
    example: 'Mumbai'
  })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ 
    description: 'Filter by minimum price', 
    required: false,
    example: 10000
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({ 
    description: 'Filter by maximum price', 
    required: false,
    example: 100000
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maxPrice?: number;
}