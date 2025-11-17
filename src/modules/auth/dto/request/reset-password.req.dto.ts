import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, IsNotEmpty, IsEmail } from 'class-validator';
import { Transform } from 'class-transformer';

export class ResetPasswordDto {

  @ApiProperty({ 
    example: 'user@example.com', 
    description: 'User email address',
    required: true
  })
  @Transform(({ value }) => {
    // Convert to string if value exists and is not already a string
    if (value === null || value === undefined || value === '') {
      return value;
    }
    // Convert number, boolean, etc. to string
    if (typeof value !== 'string') {
      return String(value);
    }
    return value.toLowerCase().trim();
  })
  @IsNotEmpty({ message: 'email is required' })
  @IsEmail({}, { message: 'email must be a valid email address' })
  email: string;

  @ApiProperty({ 
    example: 'NewPassword123!', 
    description: 'New password (minimum 6 characters)',
    required: true
  })
  @Transform(({ value }) => {
    // Convert to string if value exists and is not already a string
    if (value === null || value === undefined || value === '') {
      return value;
    }
    // Convert number, boolean, etc. to string
    if (typeof value !== 'string') {
      return String(value);
    }
    return value;
  })
  @IsNotEmpty({ message: 'newPassword is required' })
  @IsString({ message: 'newPassword must be a string' })
  @MinLength(6, { message: 'newPassword must be at least 6 characters long' })
  newPassword: string;
}