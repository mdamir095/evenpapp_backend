import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateAdditionalServiceDto {
  @ApiProperty({ description: 'Additional service name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
