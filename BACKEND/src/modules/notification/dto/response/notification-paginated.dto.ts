import { ApiProperty } from '@nestjs/swagger';
import { IPaginationMeta } from '@common/interfaces/paginationMeta.interface';
import { NotificationResponseDto } from './notification-response.dto';

export class NotificationPaginatedResponseDto {
  @ApiProperty({ type: [NotificationResponseDto] })
  data: NotificationResponseDto[];

  @ApiProperty()
  pagination: IPaginationMeta;
}

