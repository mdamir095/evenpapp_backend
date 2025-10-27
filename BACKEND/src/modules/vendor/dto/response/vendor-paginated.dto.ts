import { ApiProperty } from '@nestjs/swagger';
import { VendorResponseDto } from './vendor-response.dto';
import { IPaginationMeta } from '@common/interfaces/paginationMeta.interface';

export class VendorPaginatedResponseDto {
  @ApiProperty({ 
    type: [VendorResponseDto], 
    description: 'Array of vendors' 
  })
  data: VendorResponseDto[];

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