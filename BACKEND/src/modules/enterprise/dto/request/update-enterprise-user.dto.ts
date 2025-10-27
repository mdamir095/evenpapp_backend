import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEmail, IsOptional, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { CreateFeaturePermissionDto } from '@modules/role/dto/request/create-feature-permission.dto';

export class UpdateEnterpriseUserDto {
  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: '+91', required: false })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiProperty({ example: '9876543210', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;

  @ApiProperty({ example: '123 Street', required: false })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ example: 'Mumbai', required: false })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiProperty({ example: 'Maharashtra', required: false })
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty({ example: '400001', required: false })
  @IsOptional()
  @IsString()
  pincode?: string;

  @ApiProperty({ example: 'password', required: false })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ type: [CreateFeaturePermissionDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFeaturePermissionDto)
  features?: CreateFeaturePermissionDto[];
}

