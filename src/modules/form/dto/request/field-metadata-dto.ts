import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray } from 'class-validator';

export class FieldMetadataDto {
  @ApiProperty({ description: 'Label for the field' })
  @IsString()
  label: string;

  @ApiProperty({ description: 'Placeholder text', required: false })
  @IsOptional()
  @IsString()
  placeholder?: string;

  @ApiProperty({ description: 'Dropdown options', required: false, type: [String] })
  @IsOptional()
  @IsArray()
  options?: string[];

  @ApiProperty({ description: 'Tooltip text', required: false })
  @IsOptional()
  @IsString()
  tooltip?: string;

  @ApiProperty({ description: 'Icon', required: false })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiProperty({ description: 'Default value', required: false })
  @IsOptional()
  @IsString()
  defaultValue?: string | number | boolean;
}