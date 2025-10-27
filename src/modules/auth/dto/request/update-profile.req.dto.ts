import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Gender } from '@shared/enums/genderType';
import { IsOptional, IsString, IsEmail, IsNotEmpty, Matches, IsEnum, IsDateString } from 'class-validator';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'john', description: 'First name of the user' })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional({ example: 'smith', description: 'Last name of the user' })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiPropertyOptional({ example: 'john@gmail.com', description: 'Email address' })
  @IsOptional()
  @IsEmail()
  email?: string;
  
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

  @ApiPropertyOptional({ enum: Gender, example: 'Male', description: 'Gender of the user' })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @ApiPropertyOptional({ example: '1995-12-31', description: 'Birthday in YYYY-MM-DD format' })
  @IsOptional()
  @IsDateString()
  birthday?: string;
} 