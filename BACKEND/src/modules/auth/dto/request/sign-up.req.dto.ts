import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsEmail, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Matches, MaxLength, MinLength } from "class-validator";

export * from '../../../../shared/dto/sign-up.req.dto';

export class SignUpReqDto {
  @ApiProperty({ example: 'user@example.com', description: 'Valid email address' })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  @Matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, {
    message: 'Email must be in valid format (e.g., user@example.com)'
  })
  email: string;

  @ApiProperty({ 
    example: 'MySecure123!', 
    description: 'Password must be 8-20 characters with at least one uppercase, one lowercase, one number, and one special character'
  })
  @IsString({ message: 'Password must be a string' })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(20, { message: 'Password must not exceed 20 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (@$!%*?&)'
  })
  password: string;
  
  @ApiProperty({ example: 'john' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiPropertyOptional({ example: 'smith' })
  @IsString()
  @IsOptional()
  lastName: string;

  @ApiProperty({ example: 'quantum' })
  @IsString()
  @IsNotEmpty()
  organizationName: string;

  @ApiProperty({ 
    example: '+91', 
    description: 'Country code with + prefix (e.g., +1, +91, +44)'
  })
  @IsString({ message: 'Country code must be a string' })
  @IsNotEmpty({ message: 'Country code is required' })
  @Matches(/^\+[1-9]\d{0,3}$/, {
    message: 'Country code must start with + followed by 1-4 digits (e.g., +1, +91, +44)'
  })
  countryCode: string;

  @ApiProperty({ 
    example: '1234567890', 
    description: 'Phone number without country code (7-12 digits)'
  })
  @IsString({ message: 'Phone number must be a string' })
  @IsNotEmpty({ message: 'Phone number is required' })
  @Matches(/^[1-9]\d{6,11}$/, {
    message: 'Phone number must be 7-12 digits and cannot start with 0'
  })
  phoneNumber: string;

}
