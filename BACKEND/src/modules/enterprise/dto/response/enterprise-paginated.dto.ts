import { ApiProperty } from '@nestjs/swagger';
import { EnterpriseResponseDto } from './enterprise-response.dto';
import { PaginationDto } from './pagination.dto';
import { Expose } from 'class-transformer';

export class EnterprisePaginatedResponseDto {
  @ApiProperty({ type: [EnterpriseResponseDto] })
  @Expose()
  data: EnterpriseResponseDto[];

  @ApiProperty({ type: PaginationDto })
  @Expose()
  pagination: PaginationDto;
}
