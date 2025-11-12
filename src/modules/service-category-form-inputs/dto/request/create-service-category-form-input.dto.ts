import { IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceCategoryFormInputDto {
  @ApiProperty({ description: 'Service Category ObjectId this input belongs to', example: '507f1f77bcf86cd799439011' })
  @IsString()
  @IsNotEmpty()
  categoryId: string;

  @ApiProperty({ description: 'Field label to display in UI', example: 'Number of Guests' })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({ description: 'Field type (e.g., text, number, select, range)', example: 'number' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Whether this field is mandatory', required: false, example: false, default: false })
  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @ApiProperty({ description: 'Minimum value for number/range fields', required: false, example: 1 })
  @IsNumber()
  @IsOptional()
  minrange?: number;

  @ApiProperty({ description: 'Maximum value for number/range fields', required: false, example: 5000 })
  @IsNumber()
  @IsOptional()
  maxrange?: number;
}
