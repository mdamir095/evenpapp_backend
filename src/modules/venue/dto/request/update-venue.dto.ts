// src/modules/venue/dto/update-venue.dto.ts

import { PartialType } from '@nestjs/swagger';
import { CreateVenueDto } from './create-venue.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateVenueDto extends PartialType(CreateVenueDto) {
  @ApiProperty({ 
    example: '507f1f77bcf86cd799439013', 
    description: 'The user ID who updated this venue',
    required: false
  })
  @Transform(({ value }) => {
    if (value === '' || value === null) return undefined;
    return value;
  })
  @IsString()
  @IsOptional()
  updatedBy?: string;
}
