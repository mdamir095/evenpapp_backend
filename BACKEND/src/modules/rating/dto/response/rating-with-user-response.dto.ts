import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';

export class RatingWithUserResponseDto {
  @ApiProperty({ description: 'MongoDB ObjectId' })
  @Expose()
  id: string;

  @ApiProperty({ description: 'User ID who submitted the rating' })
  @Expose()
  userId: string;

  @ApiProperty({ description: 'User name' })
  @Expose()
  userName: string;

  @ApiProperty({ description: 'User profile image URL', required: false })
  @Expose()
  userImage?: string;

  @ApiProperty({ description: 'ID of the booking that validates this rating' })
  @Expose()
  bookingId: string;

  @ApiProperty({ description: 'ID of the entity (vendor or venue) being rated' })
  @Expose()
  entityId: string;

  @ApiProperty({ description: 'Type of the entity (vendor or venue)' })
  @Expose()
  entityType: string;

  @ApiProperty({ description: 'Rating score between 1 and 5' })
  @Expose()
  score: number;

  @ApiProperty({ description: 'User review message', required: false })
  @Expose()
  review?: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @Expose()
  updatedAt: Date;
}
