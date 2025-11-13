import { IsString, IsNotEmpty, IsNumber, IsOptional, IsArray, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateOfferDto {
  @ApiProperty({ description: 'User ID (vendor/admin) submitting the offer', example: 'USER-123456' })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({ description: 'Offer amount', example: 1500 })
  @IsNumber()
  @IsNotEmpty()
  @Min(0)
  amount: number;

  @ApiProperty({ 
    description: 'Extra services included in the offer', 
    type: [String],
    required: false,
    example: ['Decoration', 'Premium Menu']
  })
  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  extraServices?: string[];

  @ApiProperty({ description: 'Additional notes for the offer', required: false })
  @IsString()
  @IsOptional()
  notes?: string;
}

