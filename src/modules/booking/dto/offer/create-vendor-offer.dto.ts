import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class ExtraServiceDto {
  @ApiProperty({ description: 'Name of the extra service', example: 'Extended Coverage' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ description: 'Description of the extra service', example: 'Additional 2 hours of photography', required: false })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: 'Price of the extra service', example: 5000, required: false })
  @IsNumber()
  @IsOptional()
  @Min(0)
  price?: number;
}

export class CreateVendorOfferDto {
  @ApiProperty({ description: 'Offer amount', example: 25000 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  offerAmount: number;

  @ApiProperty({ 
    description: 'Extra services included in the offer', 
    type: [ExtraServiceDto],
    required: false,
    example: [
      {
        name: 'Extended Coverage',
        description: 'Additional 2 hours of photography',
        price: 5000
      }
    ]
  })
  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ExtraServiceDto)
  extraServices?: ExtraServiceDto[];

  @ApiProperty({ description: 'Additional notes for the offer', example: 'Includes travel expenses', required: false })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiProperty({ description: 'User ID who is adding/submitting this offer', example: '6895e5aad5e5ed179ca8dafe', required: false })
  @IsString()
  @IsOptional()
  offerAddedBy?: string;
}

