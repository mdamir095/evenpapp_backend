import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform, Type } from 'class-transformer';

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

  @ApiProperty({ description: 'Average rating of the venue' })
  @Expose()
  @Transform(({ obj }) => obj.venue?.averageRating || 0)
  rating: number;

  @ApiProperty({ description: 'Total number of ratings for the venue' })
  @Expose()
  @Transform(({ obj }) => obj.venue?.totalRatings || 0)
  reviews: number;

  @ApiProperty({ description: "URL of the venue's image" })
  @Expose()
  @Transform(({ obj }) => obj.venue?.imageUrl || 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb')
  image: string;

  @ApiProperty({ description: 'Status of the venue booking' })
  @Expose()
  @Transform(({ obj }) => obj.bookingStatus || 'Pending')
  status: string;
}
