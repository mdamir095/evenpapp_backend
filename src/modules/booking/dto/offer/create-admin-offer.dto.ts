import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateAdminOfferDto {
  @ApiProperty({ description: 'Offer amount', example: 25000 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  offer_amount: number;

  @ApiProperty({ 
    description: 'Extra services included in the offer', 
    type: [String],
    required: false,
    example: ['Extended Coverage', 'Additional Setup Time', 'Premium Support']
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  extra_services?: string[];

  @ApiProperty({ description: 'Additional notes for the offer', example: 'Includes travel expenses', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

