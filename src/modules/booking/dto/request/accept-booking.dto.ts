import { IsString, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptBookingDto {
  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Additional notes for acceptance',
    example: 'Looking forward to hosting your event',
    required: false,
  })
  notes?: string;
}

