import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class BlockUserDto {
  @ApiProperty({ example: true, description: 'Set user blocked status' })
  @IsBoolean()
  isBlocked: boolean;
}


