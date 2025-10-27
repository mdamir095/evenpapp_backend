import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateFeedbackDto {

  @ApiProperty({ example: 'Great experience using the app!' })
  @IsString()
  @IsNotEmpty()
  feedback: string;

  @ApiProperty({ example: 5, required: false, minimum: 1, maximum: 5 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiProperty({ example: 'vendor', required: false, description: 'Type of related entity' })
  @IsOptional()
  @IsString()
  type?: string;
}

