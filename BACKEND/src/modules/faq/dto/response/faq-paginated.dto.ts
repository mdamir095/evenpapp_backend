import { ApiProperty } from '@nestjs/swagger';
import { FaqResponseDto } from './faq-response.dto';

export class FaqPaginatedDto {
  @ApiProperty({ 
    description: 'Array of FAQ items',
    type: [FaqResponseDto]
  })
  data: FaqResponseDto[];

  @ApiProperty({ description: 'Total number of FAQs', example: 100 })
  total: number;

  @ApiProperty({ description: 'Current page number', example: 1 })
  page: number;

  @ApiProperty({ description: 'Number of items per page', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Total number of pages', example: 10 })
  totalPages: number;

  @ApiProperty({ description: 'Whether there is a next page', example: true })
  hasNext: boolean;

  @ApiProperty({ description: 'Whether there is a previous page', example: false })
  hasPrev: boolean;

  constructor(data: FaqResponseDto[], total: number, page: number, limit: number) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.limit = limit;
    this.totalPages = Math.ceil(total / limit);
    this.hasNext = page < this.totalPages;
    this.hasPrev = page > 1;
  }
}
