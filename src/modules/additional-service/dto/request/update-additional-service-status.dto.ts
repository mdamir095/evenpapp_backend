import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateAdditionalServiceStatusDto {
  @ApiProperty({ example: true, description: 'Set additional service active status' })
  @IsBoolean()
  isActive: boolean;
}
