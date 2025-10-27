import { ApiProperty } from '@nestjs/swagger';
import { OfferResponseDto } from './offer-response.dto';
import { IPaginationMeta } from '@common/interfaces/paginationMeta.interface';

export class OfferPaginatedResponseDto {
  @ApiProperty({ type: [OfferResponseDto], description: 'Array of offers' })
  data: OfferResponseDto[];

  @ApiProperty({ description: 'Pagination metadata' })
  pagination: IPaginationMeta;
}

