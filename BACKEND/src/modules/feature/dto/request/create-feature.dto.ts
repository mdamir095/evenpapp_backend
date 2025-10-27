import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class CreateFeatureDto {
  @ApiProperty({ example: 'event' })
  @IsString()
  name: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isActive: boolean;
}
