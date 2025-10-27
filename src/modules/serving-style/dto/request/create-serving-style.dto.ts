import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateServingStyleDto {
  @ApiProperty({ description: 'Serving style name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}


