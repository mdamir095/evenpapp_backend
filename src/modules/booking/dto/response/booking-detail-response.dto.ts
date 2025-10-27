import { ApiProperty } from '@nestjs/swagger'
import { Expose, Transform, Type } from 'class-transformer'

export class BookingVenueResponseDto {
  @ApiProperty()
  @Expose()
  id: string

  @ApiProperty({ required: false })
  @Expose()
  title?: string

  @ApiProperty({ required: false })
  @Expose()
  name?: string

  @ApiProperty({ required: false })
  @Expose()
  description?: string

  @ApiProperty({ required: false })
  @Expose()
  imageUrl?: string

  @ApiProperty({ required: false })
  @Expose()
  price?: number
}

export class BookingDetailResponseDto {
  @ApiProperty()
  @Expose()
  @Transform(({ obj }) => (obj as any)?._id?.toString?.() ?? (obj as any)?.id?.toString?.() ?? '')
  id: string

  @ApiProperty({ description: 'Custom booking identifier' })
  @Expose()
  bookingId: string

  @ApiProperty({ description: 'Event hall name' })
  @Expose()
  eventHall: string

  @ApiProperty({ enum: ['venue', 'vendor'] })
  @Expose()
  bookingType: 'venue' | 'vendor'

  @ApiProperty()
  @Expose()
  venueId: string

  @ApiProperty()
  @Expose()
  categoryId: string

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
  photographerType?: string

  @ApiProperty({ required: false })
  @Expose()
  specialRequirement?: string

  @ApiProperty({ required: false })
  @Expose()
  expectedGuests?: number

  @ApiProperty({ required: false})
  @Expose()
  @Transform(({ obj }) => obj.durationOfCoverage || obj.coverageDuration)
  coverageDuration?: number

  @ApiProperty({ required: false })
  @Expose()
  @Transform(({ obj }) => obj.noOfPhotographers || obj.numberOfPhotographers)
  numberOfPhotographers?: number

  @ApiProperty({ required: false })
  @Expose()
  budgetRange?: number

  @ApiProperty({ required: false, type: [String] })
  @Expose()
  referenceImages?: string[]

  @ApiProperty({ required: false })
  @Expose()
  status: string

  @ApiProperty({ required: false })
  @Expose()
  createdAt: Date

  @ApiProperty({ required: false })
  @Expose()
  updatedAt: Date

  @ApiProperty({ required: false })
  @Expose()
  isDeleted: boolean

  @ApiProperty({ required: false })
  @Expose()
  categoryType?: string

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

  @ApiProperty({ required: false })
  @Expose()
  @Transform(({ obj }) => {
    if (!obj.venueOrVenderInfo) return undefined
    return obj.venueOrVenderInfo
  })
  venueOrVenderInfo?: {
    title: string
    location: {
      address: string
      city: string
      latitude: number
      longitude: number
      pinTitle: string
      mapImageUrl: string
    }
    description?: string
    price?: number
    imagePath: string
    rating: number
    reviews: number
    ratingLabel: string
  }

  @ApiProperty({ required: false, type: BookingVenueResponseDto })
  @Expose()
  @Transform(({ obj }) => {
    if (!obj.venue) return undefined
    const anyVenue = obj.venue as any
    const id = (anyVenue?._id || anyVenue?.id)?.toString?.() || ''
    return {
      id,
      title: anyVenue?.title,
      name: anyVenue?.name,
      description: anyVenue?.description,
      imageUrl: anyVenue?.imageUrl,
      price: anyVenue?.price,
    }
  })
  venue?: BookingVenueResponseDto

  @ApiProperty({ required: false })
  @Expose()
  @Transform(({ obj }) => {
    const e = obj.event
    if (!e) return undefined
    const anyEvent = e as any
    return {
      id: (anyEvent?._id || anyEvent?.id)?.toString?.() || '',
      title: anyEvent?.title,
      type: anyEvent?.type,
      date: anyEvent?.date,
      location: anyEvent?.location,
    }
  })
  event?: {
    id: string
    title: string
    type: string
    date: Date
    location: string
  }

  @ApiProperty({ required: false })
  @Expose()
  @Transform(({ obj }) => {
    const p = obj.photographyType
    if (!p) return undefined
    const anyP = p as any
    return {
      id: (anyP?._id || anyP?.id)?.toString?.() || '',
      name: anyP?.name,
    }
  })
  photographyType?: {
    id: string
    name: string
  }
}


