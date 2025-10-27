import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class UserFeedbackResponseDto {
  @ApiProperty({ description: 'MongoDB ObjectId' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'User ID who submitted the feedback' })
  @Expose()
  userId: string;

  @ApiProperty({ description: 'ID of the entity (vendor or venue) being rated' })
  @Expose()
  entityId: string;

  @ApiProperty({ description: 'Type of the entity (vendor or venue)' })
  @Expose()
  entityType: string;

  @ApiProperty({ description: 'Rating score between 1 and 5' })
  @Expose()
  score: number;

  @ApiProperty({ description: 'User feedback message', required: false })
  @Expose()
  review?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @Expose()
  updatedAt: Date;
}
