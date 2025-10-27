import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'

export class RequestBookingResponseDto {
  @ApiProperty({ description: 'Custom booking identifier' })
  @Expose()
  bookingId: string

  @ApiProperty()
  @Expose()
  id: string

  @ApiProperty()
  @Expose()
  eventHall: string

  @ApiProperty({ enum: ['venue', 'vendor'] })
  @Expose()
  bookingType: 'venue' | 'vendor'

  @ApiProperty({ required: false })
  @Expose()
  venueId?: string

  @ApiProperty()
  @Expose()
  userId: string

  @ApiProperty()
  @Expose()
  eventDate: string

  @ApiProperty()
  @Expose()
  endDate: string

  @ApiProperty()
  @Expose()
  startTime: string

  @ApiProperty()
  @Expose()
  endTime: string

  @ApiProperty({ required: false })
  @Expose()
  venueAddress?: string

  @ApiProperty({ required: false })
  @Expose()
  specialRequirement?: string

  @ApiProperty({ required: false })
  @Expose()
  expectedGuests?: number

  @ApiProperty({ required: false })
  @Expose()
  photographerType?: string

  @ApiProperty({ required: false })
  @Expose()
  categoryId?: string

  @ApiProperty({ required: false })
  @Expose()
  categoryType?: string;

  @ApiProperty({ required: false })
  @Expose()
  coverageDuration?: number

  @ApiProperty({ required: false })
  @Expose()
  numberOfPhotographers?: number

  @ApiProperty({ required: false })
  @Expose()
  budgetRange?: number

  @ApiProperty({ required: false, type: [String] })
  @Expose()
  referenceImages?: string[]

  @ApiProperty({ required: false })
  @Expose()
  mealType?: string

  @ApiProperty({ required: false })
  @Expose()
  cuisine?: string

  @ApiProperty({ required: false })
  @Expose()
  servingStyle?: string

  @ApiProperty({ required: false })
  @Expose()
  additionalService?: string

  @ApiProperty({ required: false })
  @Expose()
  foodPreference?: string
}


