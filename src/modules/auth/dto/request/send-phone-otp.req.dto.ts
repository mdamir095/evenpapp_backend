import { ApiProperty } from '@nestjs/swagger';
import { IsString, Length, Matches } from 'class-validator';

export class SendPhoneOtpDto {
  @ApiProperty({ 
    example: '+91',
    description: 'Country code with + prefix (e.g., +91 for India, +1 for USA)'
  })
  @IsString()
  @Matches(/^\+[1-9]\d{0,3}$/, {
    message: 'Country code must start with + followed by 1-4 digits (no leading zeros)'
  })
  @Length(2, 5, {
    message: 'Country code must be between 2-5 characters (including +)'
  })
  countryCode: string;

  @ApiProperty({ 
    example: '9876543210',
    description: 'Phone number without country code. Must be 7-15 digits.'
  })
  @IsString()
  @Matches(/^\d{7,15}$/, {
    message: 'Phone number must contain only 7-15 digits'
  })
  @Length(7, 15, {
    message: 'Phone number must be between 7-15 digits'
  })
  phoneNumber: string;
}