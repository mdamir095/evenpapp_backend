import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCuisineDto {
  @ApiProperty({ description: 'Cuisine name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: true, default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}


