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
export class VendorUserResponseDto {
  @ApiProperty({ description: 'MongoDB ObjectId' })
  @Expose()
  @Transform(({ obj }) => obj._id?.toString() || obj.id?.toString())
  id: string;

  @ApiProperty({ description: 'Unique key for frontend components' })
  @Expose({ name: 'key' })
  @Transform(({ obj }) => obj._id?.toString() || obj.id?.toString())
  key: string; 

  @ApiProperty({ description: 'Title of the vendor' })
  @Expose()
  @Transform(({ obj }) => obj.title || obj.name)
  title: string;

  @ApiProperty({ description: 'Description of the vendor' })
  @Expose()
  description: string;

  @ApiProperty({ description: 'Detailed long description of the vendor' })
  @Expose()
  longDescription: string;

  @ApiProperty()
  @Expose()
  categoryId: string;

  @ApiProperty()
  @Expose()
  categoryName: string;

  @ApiProperty({ description: 'Location details' })
  @Expose()
  @Type(() => LocationDto)
  location: LocationDto;

  @ApiProperty({ description: 'Price of the vendor' })
  @Expose()
  @Transform(({ obj }) => {
    // Return original price from database, or 0 if not available
    // Check multiple possible price sources: direct price, formData.price, formData.fields.Price
    if (obj.price !== undefined && obj.price !== null && obj.price > 0) {
      return obj.price;
    }
    if (obj.formData?.price !== undefined && obj.formData?.price !== null && obj.formData.price > 0) {
      return obj.formData.price;
    }
    if (obj.formData?.fields?.Price) {
      const fieldsPrice = parseFloat(obj.formData.fields.Price);
      if (!isNaN(fieldsPrice) && fieldsPrice > 0) {
        return fieldsPrice;
      }
    }
    // Return 0 if no price found
    return 0;
  })
  price: number;

  @ApiProperty({ 
    description: 'Dynamic pricing array based on category',
    example: [
      { title: 'Drone Coverage', price: 2000 },
      { title: 'Pre Wedding Shoot', price: 5000 },
      { title: 'Portrait Shoot', price: 400 }
    ]
  })
  @Expose()
  pricing: Array<{
    title: string;
    price: number;
  }>;

  @ApiProperty({ description: 'Average rating of the vendor' })
  @Expose()
  @Transform(({ obj }) => obj.averageRating || 4.4)
  rating: number;

  @ApiProperty({ description: 'Total number of ratings for the vendor' })
  @Expose()
  @Transform(({ obj }) => obj.totalRatings || 453)
  reviews: number;

  @ApiProperty({ description: "URL of the vendor's image" })
  @Expose()
  @Transform(({ obj }) => obj.imageUrl || 'https://t3.ftcdn.net/jpg/05/06/74/32/360_F_506743235_coW6QAlhxlBWjnRk0VNsHqaXGGH9F4JS.jpg')
  image: string;
}
