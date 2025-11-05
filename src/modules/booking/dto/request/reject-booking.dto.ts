import { IsString, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RejectBookingDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Reason for rejection',
    example: 'Venue not available on requested date',
    required: true,
  })
  rejectionReason: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Additional notes for rejection',
    example: 'Please consider alternative dates',
    required: false,
  })
  notes?: string;
}

