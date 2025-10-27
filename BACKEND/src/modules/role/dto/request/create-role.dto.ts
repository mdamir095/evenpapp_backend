import { ApiProperty } from '@nestjs/swagger';
import { ArrayNotEmpty, IsArray, IsEnum, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CreateFeaturePermissionDto } from './create-feature-permission.dto';
import { Type } from 'class-transformer';
export class CreateRoleDto {
 @ApiProperty({ example: 'Admin', description: 'Role name' })
  @IsString()
  name: string;

  @ApiProperty({
    type: [CreateFeaturePermissionDto],
    description: 'List of feature-permission mappings',
  })
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => CreateFeaturePermissionDto)
  featurePermissions: CreateFeaturePermissionDto[];
} 
