import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateNotificationDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  recipientId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  recipientEmail?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  recipientPhone?: string;

}

