import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

export class LocationDto {
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

export class PricingDto {
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

  @ApiProperty({ description: 'Available packages' })
  @Expose()
  packages: Array<{
    name: string;
    price: number;
    includes: string[];
  }>;
}

export class ReviewDto {
  @ApiProperty({ description: 'User name' })
  @Expose()
  user: string;

  @ApiProperty({ description: 'Full name (first + last)' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'Rating (1-5)' })
  @Expose()
  rating: number;

  @ApiProperty({ description: 'Review comment' })
  @Expose()
  comment: string;

  @ApiProperty({ description: 'Reviewer profile image URL', required: false })
  @Expose()
  profileImage?: string;
}

export class VendorDetailResponseDto {
  @ApiProperty({ description: 'MongoDB ObjectId' })
  @Expose()
  @Transform(({ obj }) => obj.id?.toString())
  id: string;

  @ApiProperty({ description: 'Name of the vendor' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'Title of the vendor' })
  @Expose()
  title: string;

  @ApiProperty({ description: 'Location details' })
  @Expose()
  location: LocationDto;

  @ApiProperty({ description: 'Average rating' })
  @Expose()
  avgRating: number;

  @ApiProperty({ description: 'Number of reviews' })
  @Expose()
  reviewCount: number;

  @ApiProperty({ description: 'Description of the vendor' })
  @Expose()
  description: string;

  @ApiProperty({ description: 'Detailed long description of the vendor' })
  @Expose()
  longDescription: string;

  @ApiProperty({ description: 'About section' })
  @Expose()
  about: string;

  @ApiProperty({ description: 'Array of image URLs' })
  @Expose()
  images: string[];

  @ApiProperty({ description: 'Pricing information' })
  @Expose()
  pricing: PricingDto;


  @ApiProperty({ description: 'Vendor albums with detailed information' })
  @Expose()
  albums: Array<{
    id: string;
    name: string;
    images: string[];
    imageCount: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
  }>;

  @ApiProperty({ description: 'Readable price range for display' })
  @Expose()
  priceRange: string;

  @ApiProperty({ description: 'Total room count if applicable' })
  @Expose()
  roomCount: number | string;

  @ApiProperty({ description: 'Catering policy summary' })
  @Expose()
  cateringPolicy: string;

  @ApiProperty({ description: 'Reviews array' })
  @Expose()
  reviews: ReviewDto[];

  @ApiProperty({ description: 'Category ID' })
  @Expose()
  category_id: string;

  @ApiProperty({ description: 'Category name' })
  @Expose()
  category_name: string;

  @ApiProperty({ description: 'Category ID (camelCase)' })
  @Expose()
  @Transform(({ obj }) => obj.category_id || obj.categoryId || '')
  categoryId: string;

  @ApiProperty({ description: 'Category name (camelCase)' })
  @Expose()
  @Transform(({ obj }) => obj.category_name || obj.categoryName || '')
  categoryName: string;
}

