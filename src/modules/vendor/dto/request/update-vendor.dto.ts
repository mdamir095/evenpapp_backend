import { PartialType } from '@nestjs/swagger';
import { CreateVendorDto } from './create-vendor.dto';
import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional } from 'class-validator';

export class UpdateVendorDto extends PartialType(CreateVendorDto) {
  @ApiProperty({ 
    example: '507f1f77bcf86cd799439013', 
    description: 'The user ID who updated this vendor',
    required: false
  })
  @IsString()
  @IsOptional()
  updatedBy?: string;
}
