import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { IPaginationMeta } from '@common/interfaces/paginationMeta.interface';
import { VenueUserResponseDto } from './venue-user-response.dto';

export class VenueUserPaginatedResponseDto {
  @ApiProperty({ type: [VenueUserResponseDto] })
  @Expose()
  @Type(() => VenueUserResponseDto)
  data: VenueUserResponseDto[];

  @ApiProperty({ type: 'object', additionalProperties: true })
  @Expose()
  pagination: IPaginationMeta;
}
