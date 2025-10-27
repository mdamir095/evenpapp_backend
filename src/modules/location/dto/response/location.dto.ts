import { ApiProperty } from '@nestjs/swagger';

export class LocationResponseDto {
  @ApiProperty() id: string;
  @ApiProperty({ required: false }) address: string;
  @ApiProperty({ required: false }) latitude?: number;
  @ApiProperty({ required: false }) longitude?: number;
  @ApiProperty() serviceId: string;
  @ApiProperty() isActive: boolean;
}

