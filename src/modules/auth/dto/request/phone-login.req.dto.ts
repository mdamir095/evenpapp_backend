import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class PhoneLoginDto {
  @ApiProperty({ example: '+919876543210' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  otp: string;
}