import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, Max, Min } from 'class-validator';

export class CreateTestimonialDto {
  @ApiProperty({ required: true })
  @IsString()
  name: string;

  @ApiProperty({ required: false })
  @IsString()
  designation?: string;

  @ApiProperty({ required: true })
  @IsString()
  message: string;

  @ApiProperty({ required: false })
  @IsString()
  avatarUrl?: string;


  @ApiProperty({ required: false })
  @IsNumber()
  @Min(1)
  @Max(5)
  rating: number;
}

