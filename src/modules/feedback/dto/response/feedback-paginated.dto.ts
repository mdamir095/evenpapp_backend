import { ApiProperty } from '@nestjs/swagger';
import { IPaginationMeta } from '@common/interfaces/paginationMeta.interface';
import { FeedbackResponseDto } from './feedback-response.dto';

export class FeedbackPaginatedResponseDto {
  @ApiProperty({ type: [FeedbackResponseDto] })
  data: FeedbackResponseDto[];

  @ApiProperty()
  pagination: IPaginationMeta;
}

