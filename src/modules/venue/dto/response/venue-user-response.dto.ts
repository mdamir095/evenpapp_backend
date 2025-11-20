import { Expose, Transform, Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
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
export class VenueUserResponseDto {
  @ApiProperty({ description: 'MongoDB ObjectId' })
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() || obj.id?.toString())
  id: string;

  @ApiProperty({ description: 'Unique key for frontend components' })
  @Expose({ name: 'key' })
  @Transform(({ obj }) => obj._id?.toString() || obj.id?.toString())
  key: string;

  @ApiProperty({ description: 'Location details' })
  @Expose()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({ description: 'Title of the venue' })
  @Expose()
  @Transform(({ obj }) => obj.title || obj.name)
  title: string;

  @ApiProperty({ description: 'Description of the venue' })
  @Expose()
  description: string;

  @ApiProperty({ description: 'Detailed long description of the venue' })
  @Expose()
  longDescription: string;

  @ApiProperty({ description: 'Price of the venue' })
  @Expose()
  @Transform(({ obj }) => obj.formData?.price || obj.price || 0)
  price: number;

  @ApiProperty({ 
    description: 'Dynamic pricing array based on category',
    example: [
      { title: 'Veg Price Per Plate', price: 100 },
      { title: 'Non-Veg Price Per Plate', price: 300 },
      { title: 'Decor Setup', price: 400 }
    ]
  })
  @Expose()
  pricing: Array<{
    title: string;
    price: number;
  }>;

  @ApiProperty({ description: 'Average rating of the venue' })
  @Expose()
  @Transform(({ obj }) => obj.averageRating || 4.4)
  rating: number;

  @ApiProperty({ description: 'Total number of ratings for the venue' })
  @Expose()
  @Transform(({ obj }) => obj.totalRatings || 453)
  reviews: number;

  @ApiProperty({ description: "URL of the venue's image" })
  @Expose()
  @Transform(({ obj }) => obj.formData?.imageUrl || obj.formData?.images?.[0] || obj.imageUrl || 'https://t3.ftcdn.net/jpg/05/06/74/32/360_F_506743235_coW6QAlhxlBWjnRk0VNsHqaXGGH9F4JS.jpg')
  image: string;

  @ApiProperty({ description: 'Category ID of the venue' })
  @Expose()
  @Transform(({ obj }) => obj.categoryId || obj.serviceCategoryId)
  categoryId: string;

  @ApiProperty({ description: 'Category name of the venue' })
  @Expose()
  @Transform(({ obj }) => obj.categoryName || 'General Venue')
  categoryName: string;
}
