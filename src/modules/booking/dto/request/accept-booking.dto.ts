import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AcceptBookingDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Booking ID',
    example: 'BK-A9098A0F',
    required: true,
  })
  bookingId: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Additional notes for acceptance',
    example: 'Looking forward to hosting your event',
    required: false,
  })
  notes?: string;
}

