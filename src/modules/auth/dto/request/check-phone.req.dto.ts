import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, Matches } from 'class-validator';

export class CheckPhoneDto {
  @ApiProperty({ 
    example: '+1234567890',
    description: 'Phone number to check for existence'
  })
  @IsString({ message: 'Phone number must be a string' })
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^\+?[1-9]\d{1,14}$/, { 
    message: 'Please provide a valid phone number' 
  })
  phoneNumber: string;
}
