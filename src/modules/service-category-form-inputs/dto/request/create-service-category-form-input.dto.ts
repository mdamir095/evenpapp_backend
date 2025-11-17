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

  @ApiProperty({ description: 'Whether this form input is active', required: false, example: true, default: true })
  @IsBoolean()
  @IsOptional()
  active?: boolean;

  @ApiProperty({ description: 'Minimum value for number/range fields', required: false, example: 1 })
  @IsNumber()
  @IsOptional()
  minrange?: number;

  @ApiProperty({ description: 'Maximum value for number/range fields', required: false, example: 5000 })
  @IsNumber()
  @IsOptional()
  maxrange?: number;
}
