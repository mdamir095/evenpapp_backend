import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptOfferDto {
  @ApiProperty({ description: 'Vendor offer ID to accept', example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  offer_id: string;
}

