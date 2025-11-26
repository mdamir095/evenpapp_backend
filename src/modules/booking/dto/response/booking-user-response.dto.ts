import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';
import { TimeSlot } from '../../entities/booking.entity';
class LocationDto {
  @ApiProperty({ description: 'Full address' })
  @Expose()
  address: string;

  @ApiProperty({ description: 'City name' })
  @Expose()
  city: string;

  @ApiProperty({ description: 'Latitude coordinate' })
  @Expose()
  latitude: number;

  @ApiProperty({ description: 'Longitude coordinate' })
  @Expose()
  longitude: number;

  @ApiProperty({ description: 'Pin title for map' })
  @Expose()
  pinTitle: string;

  @ApiProperty({ description: 'Map image URL' })
  @Expose()
  mapImageUrl: string;
}

export class BookingUserResponseDto {
  @ApiProperty({ description: 'Type of booking', enum: ['venue', 'vendor'] })
  @Expose()
  @Transform(({ obj }) => obj.bookingType)
  bookingType: 'venue' | 'vendor';
  @ApiProperty({ description: 'Title of the venue' })
  @Expose()
  @Transform(({ obj }) => obj.venue?.title || obj.venue?.name || 'Unknown Venue')
  title: string;

  @ApiProperty({ description: 'Description of the venue' })
  @Expose()
  @Transform(({ obj }) => obj.venue?.description || 'No description available')
  description: string;

  @ApiProperty({ description: 'Location details' })
  @Expose()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({ description: 'Price of the venue booking' })
  @Expose()
  @Transform(({ obj }) => obj.paymentDetails?.amount || obj.venue?.price || 0)
  price: number;

  @ApiProperty({ description: 'Time slot of the booking', enum: TimeSlot, required: false })
  @Expose()
  @Transform(({ obj }) => obj.timeSlot)
  timeSlot?: TimeSlot;

  @ApiProperty({ description: 'Average rating of the venue' })
  @Expose()
  @Transform(({ obj }) => obj.venue?.averageRating || 0)
  rating: number;

  @ApiProperty({ description: 'Total number of ratings for the venue' })
  @Expose()
  @Transform(({ obj }) => obj.venue?.totalRatings || 0)
  reviews: number;

  @ApiProperty({ description: "URL of the venue's or vendor's image" })
  @Expose()
  @Transform(({ obj }) => {
    // Check multiple possible sources for imageUrl
    // Priority: direct imageUrl > venue.imageUrl > vendor.imageUrl
    const imageUrl = obj.imageUrl || obj.venue?.imageUrl || obj.vendor?.imageUrl;
    // Return the imageUrl if it exists and is not empty, otherwise return empty string
    return imageUrl && imageUrl.trim() !== '' ? imageUrl : '';
  })
  image: string;

  @ApiProperty({ description: "URL of the venue's or vendor's image (alias for image)" })
  @Expose()
  @Transform(({ obj }) => {
    // Check multiple possible sources for imageUrl
    // Priority: direct imageUrl > venue.imageUrl > vendor.imageUrl
    const imageUrl = obj.imageUrl || obj.venue?.imageUrl || obj.vendor?.imageUrl;
    // Return the imageUrl if it exists and is not empty, otherwise return empty string
    return imageUrl && imageUrl.trim() !== '' ? imageUrl : '';
  })
  imageUrl: string;

  @ApiProperty({ description: 'Status of the venue booking' })
  @Expose()
  @Transform(({ obj }) => obj.bookingStatus || 'Pending')
  status: string;

  @ApiProperty({ description: 'Whether this booking has any offers', example: true })
  @Expose()
  @Transform(({ obj }) => obj.hasOffers ?? false)
  hasOffers?: boolean;

  @ApiProperty({ description: 'Whether the current user has already submitted an offer for this booking', example: false })
  @Expose()
  @Transform(({ obj }) => obj.userHasSubmittedOffer ?? false)
  userHasSubmittedOffer?: boolean;

  @ApiProperty({ description: 'Status of the current user\'s offer (pending, accepted, rejected) or null if no offer submitted', example: 'pending', required: false })
  @Expose()
  @Transform(({ obj }) => obj.userOfferStatus ?? null)
  userOfferStatus?: string | null;

  @ApiProperty({ description: 'Simple offer status: "done" if user has submitted an offer, "no offer" otherwise', example: 'done', enum: ['done', 'no offer'] })
  @Expose()
  @Transform(({ obj }) => obj.offerStatus ?? (obj.userHasSubmittedOffer ? 'done' : 'no offer'))
  offerStatus?: string;

  @ApiProperty({ description: 'User ID who created this booking', example: 'USER123' })
  @Expose()
  @Transform(({ obj }) => obj.createdBy || '')
  createdBy?: string;

  @ApiProperty({ description: 'Full name of user who created this booking', example: 'Shiv Kumar' })
  @Expose()
  @Transform(({ obj }) => obj.createdByName || '')
  createdByName?: string;

  @ApiProperty({ description: 'User ID who last updated this booking', example: 'USER456' })
  @Expose()
  @Transform(({ obj }) => obj.updatedBy || '')
  updatedBy?: string;

  @ApiProperty({ description: 'Full name of user who last updated this booking', example: 'Rahul Yadav' })
  @Expose()
  @Transform(({ obj }) => obj.updatedByName || '')
  updatedByName?: string;
}
