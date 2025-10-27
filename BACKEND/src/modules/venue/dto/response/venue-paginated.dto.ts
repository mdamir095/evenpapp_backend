import { ApiProperty } from '@nestjs/swagger';
import { VenueResponseDto } from './venue-response.dto';
import { IPaginationMeta } from '@common/interfaces/paginationMeta.interface';

export class VenuePaginatedResponseDto {
  @ApiProperty({ 
    type: [VenueResponseDto], 
    description: 'Array of venues' 
  })
  data: VenueResponseDto[];

  @ApiProperty({ 
    description: 'Pagination metadata',
    example: {
      total: 25,
      page: 1,
      limit: 10,
      totalPages: 3
    }
  })
  pagination: IPaginationMeta;
}