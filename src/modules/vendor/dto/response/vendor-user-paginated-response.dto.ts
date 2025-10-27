import { Expose, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { VendorUserResponseDto } from './vendor-user-response.dto';
import { IPaginationMeta } from '@common/interfaces/paginationMeta.interface';

export class VendorUserPaginatedResponseDto {
  @ApiProperty({ type: [VendorUserResponseDto] })
  @Expose()
  @Type(() => VendorUserResponseDto)
  data: VendorUserResponseDto[];

  @ApiProperty({ type: 'object', additionalProperties: true })
  @Expose()
  pagination: IPaginationMeta;
}
