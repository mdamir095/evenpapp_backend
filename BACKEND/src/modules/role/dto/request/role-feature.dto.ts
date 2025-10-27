import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNumber, IsOptional } from 'class-validator';

export class RoleFeaturePermissionDto {
  @ApiProperty({ example: 1, description: 'Feature ID' })
  @IsNumber()
  featureId: number;

  @ApiProperty({ example: true, required: false, description: 'Read permission' })
  @IsOptional()
  @IsBoolean()
  read?: boolean;

  @ApiProperty({ example: true, required: false, description: 'Write permission' })
  @IsOptional()
  @IsBoolean()
  write?: boolean;

  @ApiProperty({ example: true, required: false, description: 'Delete permission' })
  @IsOptional()
  @IsBoolean()
  delete?: boolean;
  @ApiProperty({ example: true, required: false, description: 'Update permission' })
  @IsOptional()   
  @IsBoolean()
  update?: boolean;
}
