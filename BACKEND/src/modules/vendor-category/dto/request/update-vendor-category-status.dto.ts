import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateVendorCategoryStatusDto {
  @ApiProperty({ example: true, description: 'Set vendor category active status' })
  @IsBoolean()
  isActive: boolean;
}


