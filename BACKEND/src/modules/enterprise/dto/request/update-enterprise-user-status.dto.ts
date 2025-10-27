import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateEnterpriseUserStatusDto {
  @ApiProperty({ example: true, description: 'Set user active status' })
  @IsBoolean()
  isActive: boolean;
}


