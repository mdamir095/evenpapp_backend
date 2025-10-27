import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateVenueCategoryStatusDto {
  @ApiProperty({ example: true, description: 'Set venue category active status' })
  @IsBoolean()
  isActive: boolean;
}


