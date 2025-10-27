import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { FieldDto } from './field.dto';

export class CreateFormDto {

  @ApiProperty({ description: 'Form category id' })
  @IsString()
  categoryId: string;

  @ApiProperty({ description: 'Form name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Form description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Form type', example: 'venue category | vendor service' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Form fields', type: () => [FieldDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FieldDto)
  fields: FieldDto[];
}
