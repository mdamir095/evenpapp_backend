import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class PermissionsDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  write?: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  read?: boolean;

  @ApiProperty({ example: true })
  @IsBoolean()
  @IsOptional()
  admin?: boolean;
}
