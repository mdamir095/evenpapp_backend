import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class PaginationDto {
  @ApiProperty()
  @Expose()
  total: number;

  @ApiProperty()
  @Expose()
  szPage: number;

  @ApiProperty()
  @Expose()
  szLimit: number;

  @ApiProperty()
  @Expose()
  totalPages: number;
}
