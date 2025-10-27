import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateMealTypeStatusDto {
  @ApiProperty({ example: true, description: 'Set meal type active status' })
  @IsBoolean()
  isActive: boolean;
}


