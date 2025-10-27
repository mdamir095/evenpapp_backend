import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateServiceCategoryStatusDto {
  @ApiProperty({ example: true, description: 'Set service category active status' })
  @IsBoolean()
  isActive: boolean;
}


