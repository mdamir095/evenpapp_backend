import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsBoolean } from 'class-validator';

export class FeaturePermissionItem {
  @ApiProperty({ example: '64cfc905e4b35a6f9a2a9876', description: 'Feature ID (MongoDB ObjectId)' })
  @IsMongoId()
  featureId: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  read: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  write: boolean;

  @ApiProperty({ example: false })
  @IsBoolean()
  admin: boolean;
}
