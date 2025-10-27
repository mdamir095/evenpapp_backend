import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class UpdateAdminProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  lastName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  countryCode: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phoneNumber: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  organizationName?: string; 

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profileImage?: string; 

  @ApiPropertyOptional()
  @IsOptional() 
  isEmailVerified ?: boolean;

  @ApiPropertyOptional()
  @IsOptional() 
  isActive ?: boolean;
}