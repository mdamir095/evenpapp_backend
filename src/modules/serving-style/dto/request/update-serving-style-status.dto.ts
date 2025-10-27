import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateServingStyleStatusDto {
  @ApiProperty({ example: true, description: 'Set serving style active status' })
  @IsBoolean()
  isActive: boolean;
}


