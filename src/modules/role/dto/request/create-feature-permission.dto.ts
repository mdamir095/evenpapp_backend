import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, ValidateNested } from 'class-validator'
import { PermissionsDto } from './permission.dto';
import { Type } from 'class-transformer';

export class CreateFeaturePermissionDto {
  @ApiProperty({ example: '6888402d8f952e40e89b32ea', description: 'Feature ID' })
  @IsMongoId()
  featureId: string;

  @ApiProperty({
    example: {
      write: true,
      read: true,
      admin: true
    },
  })
  @ValidateNested()
  @Type(() => PermissionsDto)
  permissions: PermissionsDto;
}
