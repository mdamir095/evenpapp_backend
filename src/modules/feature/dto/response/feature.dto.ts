import { ApiProperty } from '@nestjs/swagger';

export class FeatureDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'users' })
  name: string;

  @ApiProperty({ example: 'users' })
  uniqueId: string;

  @ApiProperty({ example: true })
  isActive: boolean;
}
