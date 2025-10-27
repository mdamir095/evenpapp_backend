import { IsNotEmpty, IsOptional, IsString, IsArray, IsEmail, IsBoolean, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { ObjectId } from 'mongodb';

class PermissionsDto {
  @ApiProperty({
    description: 'The read permission of the feature',
    example: true,
  })
  @IsBoolean()
  read: boolean;
  @ApiProperty({
    description: 'The write permission of the feature',
    example: true,
  })
  @IsBoolean()
  write: boolean;
  @ApiProperty({
    description: 'The admin permission of the feature',
    example: true,
  })
  @IsBoolean()
  admin: boolean;
}
class FeatureDto {
  @ApiProperty({
    description: 'The feature id of the enterprise',
    example: 'feature1',
  })
  @IsNotEmpty()
  @IsString()
  featureId: string;
  @ApiProperty({
    description: 'The permissions of the feature',
    example: {
      read: true,
      write: true,
      admin: true,
    },
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => PermissionsDto)
  permissions: PermissionsDto;
}

export class CreateEnterpriseDto {
  @ApiProperty({
      description: 'The name of the enterprise',
      example: 'Enterprise 1',
  })
  @IsNotEmpty()
  @IsString()
  firstName: string;    

  @ApiProperty({
        description: 'The last name of the enterprise',
    example: 'Enterprise 1 last name',
  })
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty({
    description: 'The email of the enterprise',
    example: 'enterprise1@example.com',
  })
  @IsNotEmpty()
  @IsEmail()
  email: string;
  
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
    description: 'The phone number of the enterprise',
    example: '+1234567890',
  })
  @IsNotEmpty()
  @IsString()
  phoneNumber: string;

  @ApiProperty({
    description: 'The enterprise name of the enterprise',
    example: 'Enterprise 1',
  })
  @IsNotEmpty()
  @IsString()
  enterpriseName: string;

  @ApiProperty({
    description: 'The description of the enterprise',
    example: 'Enterprise 1 description',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'The address of the enterprise',
    example: '123 Main St',
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({
    description: 'The city of the enterprise',
    example: 'New York',
  })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({
    description: 'The state of the enterprise',
    example: 'NY',
  })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({
    description: 'The pincode of the enterprise',
    example: '10001',
  })
  @IsOptional()
  @IsString()
  pincode?: string;
  @ApiProperty({
    description: 'The feature ids of the enterprise',
    example: [{
      featureId: 'feature1',
      permissions: {
        read: true,
        write: true,
        admin: true,
      },
    }],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FeatureDto)
  features?: FeatureDto[];

  @IsOptional()
  @IsArray()
  featurePermissionsIds?: ObjectId[];
}


