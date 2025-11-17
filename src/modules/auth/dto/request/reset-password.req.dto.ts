import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsNotEmpty } from 'class-validator';

export class ResetPasswordDto {

  @ApiProperty({ 
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODg4NTExNjQ0Zjg0MmFjNGViOWUxZjkiLCJpYXQiOjE3NjMwMjE4ODcsImV4cCI6MTc2MzAyMjc4NywiaXNzIjoiaHR0cDovL2xvY2FsaG9zdDo0MjAwIn0.ppJYZrts4GE5dkOUeMvftOAiBzTfRxavvmZRAMIQ5ew',
    description: 'JWT token received from forgot-password email'
  })
  @IsNotEmpty({ message: 'token is required' })
  @IsString({ message: 'token must be a string' })
  token: string;

  @ApiProperty({ example: 'NewPassword123!', description: 'New password (minimum 6 characters)' })
  @IsNotEmpty({ message: 'newPassword is required' })
  @IsString({ message: 'newPassword must be a string' })
  @MinLength(6, { message: 'newPassword must be at least 6 characters long' })
  newPassword: string;
}