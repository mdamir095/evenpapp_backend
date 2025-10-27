import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsNotEmpty, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateFeaturePermissionDto } from '@modules/role/dto/request/create-feature-permission.dto';

export class AddEnterpriseUserDto {
  @ApiProperty({ example: 'John', description: 'First name of the user' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Doe', description: 'Last name of the user' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'Email address' })
  @IsEmail()
  email: string;


  @ApiProperty({ example: 'ABC Corp', description: 'Organization name' })
  @IsString()
  @IsOptional()
  organizationName?: string;

  @ApiProperty({ example: '+91', description: 'Country code' })
  @IsString()
  @IsNotEmpty()
  countryCode: string;

  @ApiProperty({ example: '9876543210', description: 'Phone number' })
  @IsString()
  @IsNotEmpty()
  phoneNumber: string;

  @ApiProperty({ example: '123 Street, City', description: 'Address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'Mumbai', description: 'City' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'Maharashtra', description: 'State' })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: '400001', description: 'Pincode' })
  @IsOptional()
  @IsString()
  pincode?: string;

  @ApiProperty({ example: '1234567890', description: 'Enterprise ID' })
  @IsOptional()
  @IsString()
  enterpriseId?: string;

  @ApiProperty({
    type: [CreateFeaturePermissionDto],
    description: 'Features and their permissions for the user',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFeaturePermissionDto)
  features: CreateFeaturePermissionDto[];
}