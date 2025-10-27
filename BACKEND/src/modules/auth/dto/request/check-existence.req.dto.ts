import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, Matches, ValidateIf, ValidationArguments, registerDecorator, ValidationOptions } from 'class-validator';

export class CheckExistenceDto {
  @ApiProperty({ 
    example: 'user@example.com',
    description: 'Email address to check for existence (provide either email or phone, not both)',
    required: false
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  email?: string;

  @ApiProperty({ 
    example: '+1234567890',
    description: 'Phone number to check for existence (provide either email or phone, not both)',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  @Matches(/^\+?[1-9]\d{1,14}$/, { 
    message: 'Please provide a valid phone number' 
  })
  phoneNumber?: string;
}
