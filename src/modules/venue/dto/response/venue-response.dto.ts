import { ApiProperty } from '@nestjs/swagger';
import { Expose, Transform } from 'class-transformer';

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

export class VenueResponseDto {
  @ApiProperty({ description: 'MongoDB ObjectId' })
  @Expose()
  @Transform(({ obj }) => obj.id?.toString())
  id: string;

  @ApiProperty({ description: 'Service Category ObjectId of the venue' })
  @Expose()
  serviceCategoryId: string;

  @ApiProperty({ description: 'Category ID of the venue' })
  @Expose()
  @Transform(({ obj }) => obj.categoryId || obj.serviceCategoryId)
  categoryId: string;

  @ApiProperty({ description: 'Category name of the venue' })
  @Expose()
  @Transform(({ obj }) => obj.categoryName || 'General Venue')
  categoryName: string;

  @ApiProperty({ description: 'Name of the venue' })
  @Expose()
  name: string;

  @ApiProperty({ description: 'Title of the venue' })
  @Expose()
  title: string;

  @ApiProperty({ description: 'Description of the venue' })
  @Expose()
  description: string;

  @ApiProperty({ description: 'Detailed long description of the venue' })
  @Expose()
  longDescription: string;

  @ApiProperty({ description: 'Location details' })
  @Expose()
  location: LocationDto;

  @ApiProperty({ description: 'Price of the venue' })
  @Expose()
  @Transform(({ obj }) => obj.price || 0)
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

  @ApiProperty({ 
    description: 'Dynamic form data containing venue details',
    example: {
      location: "123 Main Street, Mumbai",
      capacity: 500,
      pricing: 75000,
      amenities: ["WiFi", "Parking", "AC"],
      features: ["Stage", "Sound System"],
      contactEmail: "venue@example.com",
      contactPhone: "+91-9876543210",
      availability: {
        monday: true,
        tuesday: true,
        wednesday: false,
        thursday: true,
        friday: true,
        saturday: true,
        sunday: true
      },
      images: ["image1.jpg", "image2.jpg"],
      description: "Beautiful venue for weddings and events"
    }
  })
  @Expose()
  formData: Record<string, any>;

  @ApiProperty({ description: 'Creation timestamp' })
  @Expose()
  createdAt: Date;

  @ApiProperty({ description: 'Last update timestamp' })
  @Expose()
  updatedAt: Date;

  @ApiProperty({ description: 'Created by user' })
  @Expose()
  createdBy: string;

  @ApiProperty({ description: 'Last updated by user' })
  @Expose()
  updatedBy: string;

  @ApiProperty({ description: 'Whether the venue is active' })
  @Expose()
  isActive: boolean;

  @ApiProperty({ description: 'Whether the venue is deleted' })
  @Expose()
  isDeleted: boolean;

  @ApiProperty({ description: "URL of the venue's image" })
  @Expose()
  @Transform(({ obj }) => obj.imageUrl || obj.formData?.images?.[0] || 'https://t3.ftcdn.net/jpg/05/06/74/32/360_F_506743235_coW6QAlhxlBWjnRk0VNsHqaXGGH9F4JS.jpg')
  image: string;

  @ApiProperty({ description: 'Average rating of the venue' })
  @Expose()
  @Transform(({ obj }) => obj.averageRating || 0)
  rating: number;

  @ApiProperty({ description: 'Total number of ratings/reviews for the venue' })
  @Expose()
  @Transform(({ obj }) => obj.totalRatings || 0)
  reviews: number;

  @ApiProperty({ description: 'Enterprise ID associated with the venue', required: false })
  @Expose()
  enterpriseId?: string;

  @ApiProperty({ description: 'Enterprise name associated with the venue', required: false })
  @Expose()
  enterpriseName?: string;
}