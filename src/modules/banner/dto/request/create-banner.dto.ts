import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateBannerDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  imageUrl: string;

  @ApiProperty({ required: false, default: 'banner' })
  @IsString()
  type?: string;
}

