import { ApiProperty } from '@nestjs/swagger';

export class TestimonialResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ required: false })
  designation?: string;

  @ApiProperty()
  message: string;

  @ApiProperty({ required: false })
  avatarUrl?: string;

  @ApiProperty({ required: false })
  rating?: number;

  @ApiProperty()
  isActive: boolean;
}

