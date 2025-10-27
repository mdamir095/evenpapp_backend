import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CancelBookingDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'Reason for cancellation',
    example: 'Change of plans',
    required: true,
  })
  cancellationReason: string;

  @IsOptional()
  @IsString()
  @ApiProperty({
    description: 'Additional notes for cancellation',
    example: 'Will rebook for next month',
    required: false,
  })
  notes?: string;
}
