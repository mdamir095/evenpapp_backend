import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateLocationDto {

  @ApiProperty({ required: true })
  @IsString()
  address: string;

  @ApiProperty({ required: true })
  @Type(() => Number)
  @IsNumber()
  latitude: number;

  @ApiProperty({ required: true })
  @Type(() => Number)
  @IsNumber()
  longitude: number;

  @ApiProperty({ description: 'Linked service id' })
  @IsString()
  serviceId: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isActive?:boolean
}

