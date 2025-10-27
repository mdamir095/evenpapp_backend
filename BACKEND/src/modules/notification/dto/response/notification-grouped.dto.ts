import { ApiProperty } from '@nestjs/swagger';
import { IPaginationMeta } from '@common/interfaces/paginationMeta.interface';
import { NotificationResponseDto } from './notification-response.dto';

export class NotificationGroupDto {
  @ApiProperty({ description: 'Group label (Today, Yesterday, or date)' })
  label: string;

  @ApiProperty({ type: [NotificationResponseDto] })
  items: NotificationResponseDto[];
}

export class NotificationGroupedResponseDto {
  @ApiProperty({ type: [NotificationGroupDto] })
  data: NotificationGroupDto[];

  @ApiProperty({ description: 'Pagination metadata' })
  pagination: IPaginationMeta;
}

