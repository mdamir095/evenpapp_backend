import { IsString, IsNotEmpty, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum OfferAction {
  ACCEPT = 'accept',
  REJECT = 'reject',
}

export class AcceptOfferDto {
  @ApiProperty({ description: 'Offer ID to accept or reject', example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  offer_id: string;

  @ApiProperty({ 
    description: 'Action to perform on the offer', 
    enum: OfferAction,
    example: 'accept',
    default: 'accept'
  })
  @IsEnum(OfferAction)
  @IsNotEmpty()
  action: OfferAction;
}

