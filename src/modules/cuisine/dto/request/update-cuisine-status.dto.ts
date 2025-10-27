import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateCuisineStatusDto {
  @ApiProperty({ example: true, description: 'Set cuisine active status' })
  @IsBoolean()
  isActive: boolean;
}


